// The MIT License (MIT)
// 
// Copyright (c) 2015 Christian Bradley + Boco Digital Media, LCC
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
// 
// 

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BocoSocketRPC = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.10.0
var configure,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  slice = [].slice;

configure = function($) {
  var Base, BocoSocketRPC, Client, InvalidRequest, MethodNotFound, Request, RequestError, Response, Server;
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

    RequestError.prototype.data = null;

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
        if (key !== "socket") {
          this[key] = val;
        }
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
      this.attachSocket(props.socket);
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
      return delete this.socketListeners[eventName];
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
        data: {
          request: request
        }
      });
      return this.socket.emit(this.errorEventName, error);
    };

    Server.prototype.emitMethodNotFound = function(request) {
      var error;
      error = new MethodNotFound({
        data: {
          request: request
        }
      });
      return this.socket.emit(this.errorEventName, error);
    };

    Server.prototype.isValidRequest = function(request) {
      var id, method, params;
      id = request.id, method = request.method, params = request.params;
      return (id != null) && (method != null) && Array.isArray(params);
    };

    Server.prototype.handleRequest = function(props) {
      var done, error, error1, method, request;
      request = this.constructRequest(props);
      if (!this.isValidRequest(request)) {
        return this.emitInvalidRequest(request);
      }
      method = this.methods[request.method];
      if (method == null) {
        return this.emitMethodNotFound(request);
      }
      done = (function(_this) {
        return function(error, result) {
          return _this.sendResponse({
            id: request.id,
            error: error,
            result: result
          });
        };
      })(this);
      try {
        return method.call.apply(method, [null].concat(slice.call(request.params), [done]));
      } catch (error1) {
        error = error1;
        return done(error);
      }
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

    Client.prototype.callMethod = function() {
      var done, i, method, params;
      method = arguments[0], params = 3 <= arguments.length ? slice.call(arguments, 1, i = arguments.length - 1) : (i = 1, []), done = arguments[i++];
      return this.sendRequest({
        method: method,
        params: params
      }, done);
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
  return BocoSocketRPC = {
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

(function() {
  var globalObject, globalObjectName, previousValue;
  globalObjectName = require("../package.json").globalObjectName;
  globalObject = (function() {
    return this;
  }).apply(null);
  previousValue = globalObject[globalObjectName];
  return module.exports.noConflict = function() {
    globalObject[globalObjectName] = previousValue;
    return module.exports;
  };
})();



},{"../package.json":6,"events":3,"uuid":5}],2:[function(require,module,exports){
module.exports = require("./build/index.js");

},{"./build/index.js":1}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
(function (global){

var rng;

if (global.crypto && crypto.getRandomValues) {
  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // Moderately fast, high quality
  var _rnds8 = new Uint8Array(16);
  rng = function whatwgRNG() {
    crypto.getRandomValues(_rnds8);
    return _rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var  _rnds = new Array(16);
  rng = function() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      _rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return _rnds;
  };
}

module.exports = rng;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
//     uuid.js
//
//     Copyright (c) 2010-2012 Robert Kieffer
//     MIT License - http://opensource.org/licenses/mit-license.php

// Unique ID creation requires a high quality random # generator.  We feature
// detect to determine the best RNG source, normalizing to a function that
// returns 128-bits of randomness, since that's what's usually required
var _rng = require('./rng');

// Maps for number <-> hex string conversion
var _byteToHex = [];
var _hexToByte = {};
for (var i = 0; i < 256; i++) {
  _byteToHex[i] = (i + 0x100).toString(16).substr(1);
  _hexToByte[_byteToHex[i]] = i;
}

// **`parse()` - Parse a UUID into it's component bytes**
function parse(s, buf, offset) {
  var i = (buf && offset) || 0, ii = 0;

  buf = buf || [];
  s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
    if (ii < 16) { // Don't overflow!
      buf[i + ii++] = _hexToByte[oct];
    }
  });

  // Zero out remaining bytes if string was short
  while (ii < 16) {
    buf[i + ii++] = 0;
  }

  return buf;
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
function unparse(buf, offset) {
  var i = offset || 0, bth = _byteToHex;
  return  bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] + '-' +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]] +
          bth[buf[i++]] + bth[buf[i++]];
}

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

// random #'s we need to init node and clockseq
var _seedBytes = _rng();

// Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
var _nodeId = [
  _seedBytes[0] | 0x01,
  _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]
];

// Per 4.2.2, randomize (14 bit) clockseq
var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;

// Previous uuid creation time
var _lastMSecs = 0, _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};

  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  var node = options.node || _nodeId;
  for (var n = 0; n < 6; n++) {
    b[i + n] = node[n];
  }

  return buf ? buf : unparse(b);
}

// **`v4()` - Generate random UUID**

// See https://github.com/broofa/node-uuid for API details
function v4(options, buf, offset) {
  // Deprecated - 'format' argument, as supported in v1.2
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || _rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ii++) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || unparse(rnds);
}

// Export public API
var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;
uuid.parse = parse;
uuid.unparse = unparse;

module.exports = uuid;

},{"./rng":4}],6:[function(require,module,exports){
module.exports={
  "name": "boco-socket-rpc",
  "globalObjectName": "BocoSocketRPC",
  "version": "0.3.2",
  "description": "Easy JSON RPC over Web Sockets",
  "main": "index.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "test": "./bin/shake npm_test",
    "preversion": "./bin/shake npm_preversion",
    "version": "./bin/shake npm_version",
    "postversion": "./bin/shake npm_postversion"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/bocodigitalmedia/boco-socket-rpc.git"
  },
  "keywords": [
    "socket",
    "sockets",
    "socket.io",
    "rpc",
    "websockets",
    "web",
    "sockets"
  ],
  "author": "Christian Bradley <christianbradley@gmail.com> (https://github.com/christianbradley)",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/bocodigitalmedia/boco-socket-rpc/issues"
  },
  "homepage": "https://github.com/bocodigitalmedia/boco-socket-rpc#readme",
  "devDependencies": {
    "boco-markdown-driven": "^0.3.6",
    "boco-mdd-jasmine-coffee": "^0.3.2",
    "bower": "^1.7.0",
    "browserify": "^12.0.1",
    "socket.io": "^1.3.7",
    "socket.io-client": "^1.3.7",
    "uglify-js": "^2.6.1"
  },
  "dependencies": {
    "uuid": "^2.0.1"
  }
}

},{}]},{},[2])(2)
});