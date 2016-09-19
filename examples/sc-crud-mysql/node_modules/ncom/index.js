var net = require('net');
var tls = require('tls');
var crypto = require('crypto');
var formatter = require('sc-formatter');
var EventEmitter = require('events').EventEmitter;
var domain = require('sc-domain');

var ComSocket = function (options, id) {
  var self = this;
  self._errorDomain = domain.create();
  self._errorDomain.on('error', function (err) {
    self.emit('error', err);
  });

  var dataBuffer = '';
  var endSymbol = '\u0017';
  var endSymbolRegex = new RegExp(endSymbol, 'g');

  self.id = id;
  self.connected = false;

  if (options instanceof net.Socket) {
    self.socket = options;
    self.authorized = options.authorized;
  } else {
    self.socket = new net.Socket(options);
  }

  self._errorDomain.add(self.socket);

  self.connect = function () {
    self.socket.connect.apply(self.socket, arguments);
  };

  self.socket.on('data', function (data) {
    dataBuffer += data.toString();
    var messages = dataBuffer.split(endSymbol);
    var num = messages.length - 1;
    dataBuffer = messages[num];

    for (var i=0; i<num; i++) {
      self.socket.emit('message', formatter.parse(messages[i]));
    }
  });

  self.socket.on('connect', function () {
    self.connected = true;
  });

  self.socket.on('close', function () {
    self.connected = false;
  });

  self.on = function (event, callback) {
    if (event == 'error') {
      EventEmitter.prototype.on.call(self, event, callback);
    } else {
      self.socket.on(event, callback);
    }
  };

  self.listeners = function () {
    self.socket.listeners.apply(self.socket, arguments);
  };

  self.removeListener = function () {
    self.socket.removeListener.apply(self.socket, arguments);
  };

  self.removeAllListeners = function () {
    self.socket.removeAllListeners.apply(self.socket, arguments);
  };

  self.write = function (data, filters) {
    var str, formatError;

    try {
      str = formatter.stringify(data).replace(endSymbolRegex, '');
    } catch (err) {
      formatError = err;
      self._errorDomain.emit('error', formatError);
    }
    if (!formatError) {
      if (filters) {
        var len = filters.length;
        for (var i = 0; i < len; i++) {
          str = filters[i](str);
        }
      }
      self.socket.write(str + endSymbol);
    }
  };

  self.end = function () {
    self.socket.end();
    self._errorDomain.remove(self.socket);
  };

  self.destroy = function () {
    self.socket.destroy();
    self._errorDomain.remove(self.socket);
  };
};

ComSocket.prototype = Object.create(EventEmitter.prototype);

var ComServer = function (options) {
  var self = this;

  self._errorDomain = domain.create();
  self._errorDomain.on('error', function (err) {
    self.emit('error', err);
  });
  self._options = options || {};

  var server;

  if (self._options.secure) {
    server = tls.createServer(options);
  } else {
    server = net.createServer(options);
  }
  self._errorDomain.add(server);

  var idTrailer = 0;

  var generateId = function (callback) {
    return crypto.randomBytes(32, function (err, buffer) {
      if (err) {
        callback(null);
      } else {
        idTrailer++;
        callback(buffer.toString('hex') + '-' + idTrailer);
      }
    });
  };

  self.listen = function () {
    server.listen.apply(server, arguments);
  };

  server.on('connection', function (socket) {
    var tempBuffer = [];
    var bufferData = function (data) {
      tempBuffer.push(data.toString());
    };
    socket.on('data', bufferData);
    generateId(function (id) {
      socket.removeListener('data', bufferData);
      var comSocket = new ComSocket(socket, id);
      comSocket.connected = true;
      self.emit('connection', comSocket);
      var len = tempBuffer.length;
      for (var i = 0; i < len; i++) {
        socket.emit('data', tempBuffer[i]);
      }
    });
  });

  self.on = function (event, callback) {
    if (event == 'connection' || event == 'error') {
      EventEmitter.prototype.on.call(self, event, callback);
    } else {
      server.on(event, callback);
    }
  };

  self.removeListener = function () {
    EventEmitter.prototype.removeListener.apply(self, arguments);
    server.removeListener.apply(server, arguments);
  };

  self.removeAllListeners = function () {
    EventEmitter.prototype.removeAllListeners.apply(self, arguments);
    server.removeAllListeners.apply(server, arguments);
  };

  self.close = function (callback) {
    server.close(callback);
  };
};

ComServer.prototype = Object.create(EventEmitter.prototype);

var createServer = function () {
  var options, listener;
  if (arguments[1]) {
    options = arguments[0];
    listener = arguments[1];
  } else if (arguments[0] instanceof Function) {
    listener = arguments[0];
  } else {
    options = arguments[0];
  }

  var server = new ComServer(options);
  if (listener) {
    server.on('connection', listener);
  }
  return server;
};

module.exports.ComSocket = ComSocket;
module.exports.ComServer = ComServer;
module.exports.createServer = createServer;
