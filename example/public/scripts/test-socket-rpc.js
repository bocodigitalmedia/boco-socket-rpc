this.testSocketRPC = function(io, BocoSocketRPC) {

  var socket = io();
  var client = new BocoSocketRPC.Client();
  var request = client.constructRequest({ method: "add", params: [2, 2] });

  client.attachSocket(socket);
  client.sendRequest(request, function(error, result) {
    console.log(request);
    console.log({ error: error, result: result });
    if(error) throw(error);
  });

};
