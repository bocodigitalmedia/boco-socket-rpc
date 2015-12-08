configure = ($ = {}) ->
  $.generateId ?= -> require("uuid").v4()
  $.requestEventName ?= "rpc.request"

  class Request
    id: null
    method: null
    params: null
    generateId: $.generateId

    constructor: (props) ->
      @[key] = val for own key, val of props when @[key] isnt undefined
      @id ?= @generateId() if @generateId?

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
    socket: null
    socketListeners: null

    constructor: (props) ->
      @[key] = val for own key, val of props
      @requestEventName ?= $.requestEventName
      @responseEventName ?= $.responseEventName
      @socketListeners ?= {}

    attachSocket: (socket) ->
      @disconnect() if @socket?
      @socket = socket
      @addSocketListeners()

    detachSocket: ->
      return unless @socket?
      @removeSocketListeners()
      @socket = null

    addSocketListener: (eventName, listener) ->
      @socketListeners[eventName] = listener
      @socket.on eventName, listener

    addSocketListeners: ->
      # do nothing by default

    removeSocketListener: (eventName) ->
      @socket.removeListener eventName, @socketListeners[eventName]

    removeSocketListeners: ->
      @removeSocketListener eventName for own eventName of @socketListeners

    constructRequest: (props) ->
      new @constructor.Request props

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

    handleRequest: (props) ->
      request = @constructRequest props
      method = @methods[request.method]
      method.call null, props.params..., (error, result) =>
        @sendResponse id: request.id, error: error, result: result

    sendResponse: (props) ->
      response = @constructResponse props
      @socket.emit @responseEventName, response

  class Client extends Base
    responseHandlers: null

    constructor: (props) ->
      super props
      @responseHandlers ?= {}

    addSocketListeners: ->
      @addSocketListener @responseEventName, @handleResponse.bind(@)

    sendRequest: (props, responseHandler) ->
      request = @constructRequest props
      @responseHandlers[request.id] = responseHandler
      @socket.emit @requestEventName, request

    handleResponse: (props) ->
      response = @constructResponse props
      responseHandler = @responseHandlers[response.id]
      responseHandler.call null, response.error, response.result if responseHandler?

  SocketRPC =
    configuration: $
    configure: configure
    Request: Request
    Response: Response
    Base: Base
    Server: Server
    Client: Client

module.exports = configure()
