# boco-socket-rpc

Easy JSON RPC over Sockets

```coffee
SocketRPC = require "boco-socket-rpc"
```

## Table of Contents

* [Installation]
* [Usage]
  * [Sending Requests]
  * [Errors]
    * [InvalidRequest]
    * [MethodNotFound]

## Installation

```sh
$ npm install boco-socket-rpc
```

## Usage

Let's create an event emitter as a mock socket for testing:

```coffee
EventEmitter = require("events").EventEmitter
socket = new EventEmitter()
```

Create a `Server`:

```coffee
server = new SocketRPC.Server
server.attachSocket socket

server.registerMethod "add", (a, b, done) ->
  done null, a + b

server.registerMethod "multiply", (a, b, done) ->
  done null, a * b
```

Create a `Client`:

```coffee
client = new SocketRPC.Client
client.attachSocket socket
```

Make sure to detach sockets when they have disconnected:

```coffee
socket.on "disconnect", ->
  server.detachSocket()
  client.detachSocket()
```

### Sending Requests

Sending a request calls the remote method and returns the result:

```coffee
client.sendRequest method: "add", params: [2, 3], (error, result) ->
  throw error if error?
  expect(result).toEqual 5
  ok()
```

Correlation ids are automatically assigned to make sure response handlers receive the correct results:

```coffee
client.sendRequest method: "multiply", params: [2, 3], (error, result) ->
  throw error if error?
  expect(result).toEqual 6
  ok()
```

### Errors

#### InvalidRequest

Sending an invalid request emits an `InvalidRequest` error:

```coffee
request = id: 1, method: null, params: null

client.on "error", (error) ->
  expect(error.name).toEqual "InvalidRequest"
  expect(error.code).toEqual -32600
  expect(error.message).toEqual "Invalid Request"
  expect(error.request.id).toEqual request.id
  ok()

client.sendRequest request
```

#### MethodNotFound

Sending a request for a method that has not been registered with the server emits a `MethodNotFound` error:

```coffee
request = id: 2, method: "subtract", params: []

client.on "error", (error) ->
  expect(error.name).toEqual "MethodNotFound"
  expect(error.code).toEqual -32601
  expect(error.message).toEqual "Method not found"
  expect(error.request.id).toEqual request.id
  ok()

client.sendRequest request

```

[Installation]: #installation
[Usage]: #usage
[Sending Requests]: #sending-requests
[Errors]: #errors
[InvalidRequest]: #invalidrequest
[MethodNotFound]: #methodnotfound

[json-rpc-errors]: http://www.jsonrpc.org/specification#error_object
