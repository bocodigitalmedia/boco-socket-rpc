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

--------------------------------------------------------------------------------

The MIT License (MIT)

Copyright (c) 2015 Christian Bradley + Boco Digital Media, LCC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

