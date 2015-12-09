var SocketRPC = require("../");
var socket = window.io();
var client = new SocketRPC.Client();
var request = client.constructRequest({ method: "add", params: [2, 2] });

client.attachSocket(socket);
client.sendRequest(request, function(error, result) {
  console.log(request);
  console.log({ error: error, result: result });
});
