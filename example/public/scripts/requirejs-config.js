requirejs.config({
  baseUrl: "/",
  paths: {
    "app": "/scripts/app-requirejs",
    "socket.io": "/socket.io/socket.io",
    "test-socket-rpc": "/scripts/test-socket-rpc",
    "boco-socket-rpc": "/bower_components/boco-socket-rpc/dist/boco-socket-rpc"
  },
  shim: {
    "test-socket-rpc": {
      exports: "testSocketRPC"
    },
    "socket.io": {
      exports: "io"
    }
  }
});

requirejs(["app"]);
