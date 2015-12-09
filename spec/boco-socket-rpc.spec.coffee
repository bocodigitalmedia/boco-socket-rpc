$files = {}

describe "boco-socket-rpc", ->
  [SocketRPC] = []

  beforeEach ->
    SocketRPC = require "boco-socket-rpc"

  describe "Usage", ->
    [EventEmitter, socket, server, a, b, done, client] = []

    beforeEach ->
      EventEmitter = require("events").EventEmitter
      socket = new EventEmitter()
      server = new SocketRPC.Server
      server.attachSocket socket
      
      server.registerMethod "add", (a, b, done) ->
        done null, a + b
      
      server.registerMethod "multiply", (a, b, done) ->
        done null, a * b
      client = new SocketRPC.Client
      client.attachSocket socket
      socket.on "disconnect", ->
        server.detachSocket()
        client.detachSocket()

    describe "Sending Requests", ->

      it "Sending a request calls the remote method and returns the result:", (ok) ->
        client.sendRequest method: "add", params: [2, 3], (error, result) ->
          throw error if error?
          expect(result).toEqual 5
          ok()

      it "Correlation ids are automatically assigned to make sure response handlers receive the correct results:", (ok) ->
        client.sendRequest method: "multiply", params: [2, 3], (error, result) ->
          throw error if error?
          expect(result).toEqual 6
          ok()

    describe "Errors", ->

      describe "InvalidRequest", ->

        it "Sending an invalid request emits an `InvalidRequest` error:", (ok) ->
          request = id: 1, method: null, params: null
          
          client.on "error", (error) ->
            expect(error.name).toEqual "InvalidRequest"
            expect(error.code).toEqual -32600
            expect(error.message).toEqual "Invalid Request"
            expect(error.request.id).toEqual request.id
            ok()
          
          client.sendRequest request

      describe "MethodNotFound", ->

        it "Sending a request for a method that has not been registered with the server emits a `MethodNotFound` error:", (ok) ->
          request = id: 2, method: "subtract", params: []
          
          client.on "error", (error) ->
            expect(error.name).toEqual "MethodNotFound"
            expect(error.code).toEqual -32601
            expect(error.message).toEqual "Method not found"
            expect(error.request.id).toEqual request.id
            ok()
          
          client.sendRequest request
