# boco-socket-rpc

Easy JSON RPC over Sockets

```coffee
SocketRPC = require "boco-socket-rpc"
```

## Table of Contents

* [Installation]
* [Usage]

## Installation

```sh
$ npm install boco-socket-rpc
```

## Usage

```coffee
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
```

Sending requests calls the remote method and returns the result:

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


[Installation]: #Installation
[Usage]: #usage

--------------------------------------------------------------------------------

The MIT License (MIT)

Copyright (c) 2015 Boco Digital Media

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

