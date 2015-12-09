#!/usr/bin/env node
var Express = require("express");
var SocketIO = require("socket.io");
var SocketRPC = require("../");
var HTTP = require("http");
var Path = require("path");

var app = Express();
var server = HTTP.createServer(app);
var publicDir = Path.resolve(__dirname, "public");
var bowerComponentsDir = Path.resolve(__dirname, "bower_components");
var io = SocketIO(server);

app.use(Express.static(publicDir));
app.use("/bower_components", Express.static(bowerComponentsDir));

io.on("connection", function(socket) {
  var rpcServer = new SocketRPC.Server();
  rpcServer.attachSocket(socket);

  rpcServer.registerMethod("add", function(a, b, done) {
    done(null, a + b);
  });

  rpcServer.registerMethod("multiply", function(a, b, done) {
    done(null, a * b);
  });

  socket.on("disconnect", function() {
    rpcServer.detachSocket(socket);
  });
});

server.listen(3000, function() {
  console.log("server started");
});
