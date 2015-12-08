$files = {}

describe "boco-socket-rpc", ->
  [SocketRPC] = []

  beforeEach ->
    SocketRPC = require "boco-socket-rpc"

  describe "Usage", ->
    [EventEmitter, socket, server, a, b, done, client] = []

    beforeEach ->
      # Let's use an event emitter as a mock socket for testing:
      EventEmitter = require("events").EventEmitter
      socket = new EventEmitter()
      
      # Create a server and register some RPC methods
      server = new SocketRPC.Server
      
      server.registerMethod "add", (a, b, done) ->
        done null, a + b
      
      server.registerMethod "multiply", (a, b, done) ->
        done null, a * b
      
      # Attach the socket to initialize event listeners
      server.attachSocket socket
      
      # Create a client
      client = new SocketRPC.Client
      client.attachSocket socket
      
      # Detach sockets when they are disconnected
      socket.on "disconnect", ->
        server.detachSocket()
        client.detachSocket()

    it "Sending requests calls the remote method and returns the result:", (ok) ->
      client.sendRequest method: "add", params: [2, 3], (error, result) ->
        throw error if error?
        expect(result).toEqual 5
        ok()

    it "Correlation ids are automatically assigned to make sure response handlers receive the correct results:", (ok) ->
      client.sendRequest method: "multiply", params: [2, 3], (error, result) ->
        throw error if error?
        expect(result).toEqual 6
        ok()
