$files = {}

describe "boco-socket-rpc", ->

  describe "Usage", ->
    [BocoSocketRPC, EventEmitter, serverSocket, socket, server, sender, done, error, clientSocket, client] = []

    beforeEach ->
      BocoSocketRPC = require "boco-socket-rpc"
      EventEmitter = require("events").EventEmitter
      
      # server
      serverSocket = new EventEmitter()
      
      serverSocket.on "connection", (socket) ->
        server = new BocoSocketRPC.Server socket: socket
      
        server.registerMethod "hello", (sender, done) ->
          done null, "Hello, #{sender}!"
      
        server.registerMethod "throwIt", (error, done) ->
          throw error
      
      # client
      clientSocket = new EventEmitter()
      client = new BocoSocketRPC.Client socket: clientSocket
      
      # mock connecting
      serverSocket.emit "connection", clientSocket

    describe "Calling a Method", ->

      it "The result of the remote method is returned asynchronously.", (ok) ->
        client.callMethod "hello", "client", (error, result) ->
          throw error if error?
          expect(result).toEqual "Hello, client!"
          ok()

      it "Errors thrown by the remote method are returned as well.", (ok) ->
        client.callMethod "throwIt", "foo!", (error, result) ->
          expect(result).toEqual undefined
          expect(error).toEqual "foo!"
          ok()

    describe "Sending a Request", ->

      it "You can send a [json-rpc]-formatted request manually using the `sendRequest` method:", (ok) ->
        client.sendRequest method: "hello", params: ["client"], (error, result) ->
          throw error if error?
          expect(result).toEqual "Hello, client!"
          ok()

    describe "Request Errors", ->

      describe "InvalidRequest", ->

        it "An `InvalidRequest` error will be emitted if the data provided is not a valid `Request` object:", (ok) ->
          client.on "error", (error) ->
            expect(error.code).toEqual -32600
            expect(error.message).toEqual "Invalid Request"
            expect(error.data.request.method).toEqual null
            ok()
          
          client.sendRequest method: null, (error, result) ->
            throw Error("Should not get here")

      describe "MethodNotFound", ->

        it "A `MethodNotFound` error will be emitted if the requested method was not registered by the server:", (ok) ->
          client.on "error", (error) ->
            expect(error.code).toEqual -32601
            expect(error.message).toEqual "Method not found"
            expect(error.data.request.method).toEqual "goodbye"
            ok()
          
          client.sendRequest method: "goodbye", params: [], (error, result) ->
            throw Error("Should not get here")
