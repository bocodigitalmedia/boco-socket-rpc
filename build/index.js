// Generated by CoffeeScript 1.10.0
var configure,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

configure = function($) {
  var Base, Client, InvalidRequest, MethodNotFound, Request, RequestError, Response, Server, SocketRPC;
  if ($ == null) {
    $ = {};
  }
  if ($.generateId == null) {
    $.generateId = function() {
      return require("uuid").v4();
    };
  }
  if ($.requestEventName == null) {
    $.requestEventName = "rpc.request";
  }
  if ($.responseEventName == null) {
    $.responseEventName = "rpc.response";
  }
  if ($.errorEventName == null) {
    $.errorEventName = "rpc.error";
  }
  if ($.EventEmitter == null) {
    $.EventEmitter = require("events").EventEmitter;
  }
  RequestError = (function(superClass) {
    extend(RequestError, superClass);

    RequestError.prototype.name = null;

    RequestError.prototype.code = null;

    RequestError.prototype.message = null;

    RequestError.prototype.request = null;

    function RequestError(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
      if (this.name == null) {
        this.name = this.constructor.name;
      }
      if (this.code == null) {
        this.code = this.constructor.code;
      }
      if (this.message == null) {
        this.message = this.constructor.message;
      }
      Error.captureStackTrace(this, this.constructor);
    }

    return RequestError;

  })(Error);
  InvalidRequest = (function(superClass) {
    extend(InvalidRequest, superClass);

    function InvalidRequest() {
      return InvalidRequest.__super__.constructor.apply(this, arguments);
    }

    InvalidRequest.code = -32600;

    InvalidRequest.message = "Invalid Request";

    return InvalidRequest;

  })(RequestError);
  MethodNotFound = (function(superClass) {
    extend(MethodNotFound, superClass);

    function MethodNotFound() {
      return MethodNotFound.__super__.constructor.apply(this, arguments);
    }

    MethodNotFound.code = -32601;

    MethodNotFound.message = "Method not found";

    return MethodNotFound;

  })(RequestError);
  Request = (function() {
    Request.prototype.id = null;

    Request.prototype.method = null;

    Request.prototype.params = null;

    function Request(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
    }

    return Request;

  })();
  Response = (function() {
    Response.prototype.id = null;

    Response.prototype.result = void 0;

    Response.prototype.error = void 0;

    function Response(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
    }

    return Response;

  })();
  Base = (function() {
    Base.Request = Request;

    Base.Response = Response;

    Base.prototype.requestEventName = null;

    Base.prototype.responseEventName = null;

    Base.prototype.errorEventName = null;

    Base.prototype.socket = null;

    Base.prototype.socketListeners = null;

    Base.prototype.generateRequestId = $.generateId;

    function Base(props) {
      var key, val;
      for (key in props) {
        if (!hasProp.call(props, key)) continue;
        val = props[key];
        this[key] = val;
      }
      if (this.requestEventName == null) {
        this.requestEventName = $.requestEventName;
      }
      if (this.responseEventName == null) {
        this.responseEventName = $.responseEventName;
      }
      if (this.errorEventName == null) {
        this.errorEventName = $.errorEventName;
      }
      if (this.socketListeners == null) {
        this.socketListeners = {};
      }
    }

    Base.prototype.attachSocket = function(socket) {
      if (this.socket != null) {
        this.disconnect();
      }
      this.socket = socket;
      return this.addSocketListeners();
    };

    Base.prototype.detachSocket = function() {
      if (this.socket == null) {
        return;
      }
      this.removeSocketListeners();
      return this.socket = null;
    };

    Base.prototype.addSocketListener = function(eventName, listener) {
      this.socketListeners[eventName] = listener;
      return this.socket.on(eventName, listener);
    };

    Base.prototype.addSocketListeners = function() {};

    Base.prototype.removeSocketListener = function(eventName) {
      this.socket.removeListener(eventName, this.socketListeners[eventName]);
      return delete this.socketListeners[name];
    };

    Base.prototype.removeSocketListeners = function() {
      var eventName, ref, results;
      ref = this.socketListeners;
      results = [];
      for (eventName in ref) {
        if (!hasProp.call(ref, eventName)) continue;
        results.push(this.removeSocketListener(eventName));
      }
      return results;
    };

    Base.prototype.constructRequest = function(props) {
      var request;
      request = new this.constructor.Request(props);
      if (request.id == null) {
        request.id = this.generateRequestId();
      }
      return request;
    };

    Base.prototype.constructResponse = function(props) {
      return new this.constructor.Response(props);
    };

    return Base;

  })();
  Server = (function(superClass) {
    extend(Server, superClass);

    Server.prototype.methods = null;

    function Server(props) {
      Server.__super__.constructor.call(this, props);
      if (this.methods == null) {
        this.methods = {};
      }
    }

    Server.prototype.registerMethod = function(key, fn) {
      return this.methods[key] = fn;
    };

    Server.prototype.addSocketListeners = function() {
      return this.addSocketListener(this.requestEventName, this.handleRequest.bind(this));
    };

    Server.prototype.emitInvalidRequest = function(request) {
      var error;
      error = new InvalidRequest({
        request: request
      });
      return this.socket.emit(this.errorEventName, error);
    };

    Server.prototype.emitMethodNotFound = function(request) {
      var error;
      error = new MethodNotFound({
        request: request
      });
      return this.socket.emit(this.errorEventName, error);
    };

    Server.prototype.isValidRequest = function(request) {
      var id, method, params;
      id = request.id, method = request.method, params = request.params;
      return (id != null) && (method != null) && Array.isArray(params);
    };

    Server.prototype.handleRequest = function(props) {
      var method, request;
      request = this.constructRequest(props);
      if (!this.isValidRequest(request)) {
        return this.emitInvalidRequest(request);
      }
      method = this.methods[request.method];
      if (method == null) {
        return this.emitMethodNotFound(request);
      }
      return method.call.apply(method, [null].concat(slice.call(props.params), [(function(_this) {
        return function(error, result) {
          return _this.sendResponse({
            id: request.id,
            error: error,
            result: result
          });
        };
      })(this)]));
    };

    Server.prototype.sendResponse = function(props) {
      var response;
      response = this.constructResponse(props);
      return this.socket.emit(this.responseEventName, response);
    };

    return Server;

  })(Base);
  Client = (function(superClass) {
    extend(Client, superClass);

    Client.prototype.responseHandlers = null;

    function Client(props) {
      Client.__super__.constructor.call(this, props);
      if (this.emitter == null) {
        this.emitter = new $.EventEmitter;
      }
      if (this.responseHandlers == null) {
        this.responseHandlers = {};
      }
    }

    Client.prototype.on = function() {
      var args, ref;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return (ref = this.emitter).on.apply(ref, args);
    };

    Client.prototype.addSocketListeners = function() {
      this.addSocketListener(this.responseEventName, this.handleResponse.bind(this));
      return this.addSocketListener(this.errorEventName, this.handleError.bind(this));
    };

    Client.prototype.sendRequest = function(props, responseHandler) {
      var request;
      request = this.constructRequest(props);
      this.responseHandlers[request.id] = responseHandler;
      return this.socket.emit(this.requestEventName, request);
    };

    Client.prototype.handleResponse = function(props) {
      var response, responseHandler;
      response = this.constructResponse(props);
      responseHandler = this.responseHandlers[response.id];
      if (responseHandler != null) {
        return responseHandler.call(null, response.error, response.result);
      }
    };

    Client.prototype.handleError = function(error) {
      return this.emitter.emit("error", error);
    };

    return Client;

  })(Base);
  return SocketRPC = {
    configuration: $,
    configure: configure,
    Request: Request,
    Response: Response,
    Base: Base,
    Server: Server,
    Client: Client
  };
};

module.exports = configure();

//# sourceMappingURL=index.js.map
