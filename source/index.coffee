configure = ($ = {}) ->
  $.generateId ?= -> require("uuid").v4()
  $.requestEventName ?= "rpc.request"
  $.responseEventName ?= "rpc.response"
  $.errorEventName ?= "rpc.error"
  $.EventEmitter ?= require("events").EventEmitter

  class RequestError extends Error
    name: null
    code: null
    message: null
    data: null

    constructor: (props) ->
      @[key] = val for own key, val of props
      @name ?= @constructor.name
      @code ?= @constructor.code
      @message ?= @constructor.message
      Error.captureStackTrace @, @constructor

  class InvalidRequest extends RequestError
    @code: -32600
    @message: "Invalid Request"

  class MethodNotFound extends RequestError
    @code: -32601
    @message: "Method not found"

  class Request
    id: null
    method: null
    params: null

    constructor: (props) ->
      @[key] = val for own key, val of props

  class Response
    id: null
    result: undefined
    error: undefined

    constructor: (props) ->
      @[key] = val for own key, val of props

  class Base
    @Request: Request
    @Response: Response

    requestEventName: null
    responseEventName: null
    errorEventName: null
    socket: null
    socketListeners: null
    generateRequestId: $.generateId

    constructor: (props = {}) ->
      @[key] = val for own key, val of props when key isnt "socket"
      @requestEventName ?= $.requestEventName
      @responseEventName ?= $.responseEventName
      @errorEventName ?= $.errorEventName
      @socketListeners ?= {}
      @attachSocket props.socket if props.socket?


    attachSocket: (socket) ->
      @detachSocket()
      @socket = socket
      @addSocketListeners()

    detachSocket: ->
      @removeSocketListeners()
      @socket = null

    addSocketListener: (eventName, listener) ->
      @socketListeners[eventName] = listener
      @socket.on eventName, listener

    addSocketListeners: ->
      # do nothing by default

    removeSocketListener: (eventName) ->
      @socket.removeListener eventName, @socketListeners[eventName]
      delete @socketListeners[eventName]

    removeSocketListeners: ->
      @removeSocketListener eventName for own eventName of @socketListeners

    constructRequest: (props) ->
      request = new @constructor.Request props
      request.id ?= @generateRequestId()
      request

    constructResponse: (props) ->
      new @constructor.Response props

  class Server extends Base
    methods: null

    constructor: (props) ->
      super props
      @methods ?= {}

    registerMethod: (key, fn) ->
      @methods[key] = fn

    addSocketListeners: ->
      @addSocketListener @requestEventName, @handleRequest.bind(@)

    emitInvalidRequest: (request) ->
      error = new InvalidRequest data: { request: request }
      @socket.emit @errorEventName, error

    emitMethodNotFound: (request) ->
      error = new MethodNotFound data: { request: request }
      @socket.emit @errorEventName, error

    isValidRequest: (request) ->
      {id, method, params} = request
      id? and method? and Array.isArray(params)

    handleRequest: (props) ->
      request = @constructRequest props
      return @emitInvalidRequest(request) unless @isValidRequest(request)

      method = @methods[request.method]
      return @emitMethodNotFound(request) unless method?

      done = (error, result) =>
        @sendResponse id: request.id, error: error, result: result

      try method.call(null, request.params..., done)
      catch error then done error

    sendResponse: (props) ->
      response = @constructResponse props
      @socket.emit @responseEventName, response

  class Client extends Base
    responseHandlers: null

    constructor: (props) ->
      super props
      @emitter ?= new $.EventEmitter
      @responseHandlers ?= {}

    on: (args...) ->
      @emitter.on args...

    addSocketListeners: ->
      @addSocketListener @responseEventName, @handleResponse.bind(@)
      @addSocketListener @errorEventName, @handleError.bind(@)

    sendRequest: (props, responseHandler) ->
      request = @constructRequest props
      @responseHandlers[request.id] = responseHandler
      @socket.emit @requestEventName, request

    callMethod: (method, params..., done) ->
      @sendRequest method: method, params: params, done

    handleResponse: (props) ->
      response = @constructResponse props
      responseHandler = @responseHandlers[response.id]
      responseHandler.call null, response.error, response.result if responseHandler?

    handleError: (error) ->
      @emitter.emit "error", error

  BocoSocketRPC =
    configuration: $
    configure: configure
    Request: Request
    Response: Response
    Base: Base
    Server: Server
    Client: Client

module.exports = configure()

do ->
  globalObjectName = require("../package.json").globalObjectName;
  globalObject = (-> @).apply(null)
  previousValue = globalObject[globalObjectName]

  module.exports.noConflict = ->
    globalObject[globalObjectName] = previousValue
    module.exports
