# boco-socket-rpc
![npm version](https://img.shields.io/npm/v/boco-socket-rpc.svg)
![npm license](https://img.shields.io/npm/l/boco-socket-rpc.svg)
![dependencies](https://david-dm.org/bocodigitalmedia/boco-socket-rpc.png)

Easy JSON RPC over Web Sockets with [socket.io]

## Table of Contents

* [Installation]
* [Usage]
  * [Calling a Method]
  * [Sending a Request]
  * [Request Errors]
* [Browser Usage]
  * [Using the Browser Global]
  * [Using require.js]

## Installation

Installation is available via [npm], [bower] or [github].

```sh
$ npm install boco-socket-rpc
$ bower install boco-socket-rpc
$ git clone https://github.com/bocodigitalmedia/boco-socket-rpc
```

## Usage

Although you will most likely use this library with [socket.io], it can be used with any `EventEmitter`. To demonstrate this, our examples will use an event emitter in place of the actual socket.io server and client.

```coffee
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
```

### Calling a Method

The result of the remote method is returned asynchronously.

```coffee
client.callMethod "hello", "client", (error, result) ->
  throw error if error?
  expect(result).toEqual "Hello, client!"
  ok()
```

Errors thrown by the remote method are returned as well.

```coffee
client.callMethod "throwIt", "foo!", (error, result) ->
  expect(result).toEqual undefined
  expect(error).toEqual "foo!"
  ok()
```

### Sending a Request

You can send a [json-rpc]-formatted request manually using the `sendRequest` method:

```coffee
client.sendRequest method: "hello", params: ["client"], (error, result) ->
  throw error if error?
  expect(result).toEqual "Hello, client!"
  ok()
```

_note: a `uuid` value is automatically assigned to the `id` of all requests_

### Request Errors

The following request errors may be emitted to the client.

#### InvalidRequest

An `InvalidRequest` error will be emitted if the data provided is not a valid `Request` object:

```coffee
client.on "error", (error) ->
  expect(error.code).toEqual -32600
  expect(error.message).toEqual "Invalid Request"
  expect(error.data.request.method).toEqual null
  ok()

client.sendRequest method: null, (error, result) ->
  throw Error("Should not get here")
```

#### MethodNotFound

A `MethodNotFound` error will be emitted if the requested method was not registered by the server:

```coffee
client.on "error", (error) ->
  expect(error.code).toEqual -32601
  expect(error.message).toEqual "Method not found"
  expect(error.data.request.method).toEqual "goodbye"
  ok()

client.sendRequest method: "goodbye", params: [], (error, result) ->
  throw Error("Should not get here")
```

## Browser Usage

An [UMD] module is included in this package at `/dist/boco-socket-rpc.js`. A minified version is also available.

### Using the Browser Global

```html
<!-- file: "index.html" -->
<script src="/socket.io/socket.io.js"></script>
<script src="/js/boco-socket-rpc.js"></script>
<script src="/js/app.js"></script>
```

A `noConflict` method is provided that will reset the global object and return the module instance:

```js
// file: "/js/app.js"
(function(root) {

  var BocoSocketRPC = root.BocoSocketRPC.noConflict();
  var socket = io("http://localhost:3000");
  var client = new BocoSocketRPC.Client({ socket: socket });
  // ...

})(this);
```

### Using require.js

__boco-socket-rpc__ is [AMD] compatible, and can be used with AMD loaders like [require.js].

```html
<!-- file: "index.html" -->
<script data-main="/js/app.js" src="/js/require.js"></script>
```

```js
// file: "/js/app.js
requirejs.config({
  paths: {
    "socket.io": "/socket.io/socket.io.js",
    "boco-socket-rpc": "/js/boco-socket-rpc.js"
  }
});

require(["socket.io", "boco-socket-rpc"], function(io, BocoSocketRPC) {
  var socket = io("http://localhost:3000");
  var client = new BocoSocketRPC.Client({ socket: socket });
  ok();
});
```


[Installation]: #installation
[Usage]: #usage
[Calling a Method]: #calling-a-method
[Sending a Request]: #sending-a-request
[Request Errors]: #request-errors
[Browser Usage]: #browser-usage
[Using the Browser Global]: #using-the-browser-global
[Using require.js]: #using-require.js

[json-rpc]: http://www.jsonrpc.org/specification
[npm]: http://npmjs.org
[bower]: http://bower.io
[github]: http://github.com
[socket.io]: http://socket.io
[umd]: https://github.com/umdjs/umd
[amd]: https://github.com/amdjs/amdjs-api/wiki/AMD
[require.js]: http://requirejs.org
