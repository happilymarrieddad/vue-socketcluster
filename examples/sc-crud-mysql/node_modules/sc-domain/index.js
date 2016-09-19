var EventEmitter = require('events').EventEmitter;

var privateErrorEventName = '__domainError';

// Monkey patch the EventEmitter emit function to emit an additional
// '__domainError' event for internal use when an error occurs.
var originalEmitFunction = EventEmitter.prototype.emit;
EventEmitter.prototype.emit = function (eventName) {
  if (eventName == 'error') {
    originalEmitFunction.call(this, privateErrorEventName, arguments[1]);
  }
  return originalEmitFunction.apply(this, arguments);
};

var SCDomain = function () {
  var self = this;
  EventEmitter.call(this);

  this.members = [];

  this._errorHandler = function errorHandler(err) {
    self.emit('error', err);
  };

  this.run = function (callback) {
    var that = this;
    var args = arguments;

    (new Promise(function (resolve, reject) {
      var functionArgs = Array.prototype.slice.call(args, 1);
      callback.apply(that, functionArgs);
    })).catch(self._errorHandler);
  };
};

SCDomain.prototype = Object.create(EventEmitter.prototype);

SCDomain.prototype.bind = function (callback) {
  var self = this;

  return function () {
    self.run.apply(this, [callback].concat(Array.prototype.slice.call(arguments, 0)));
  };
};

SCDomain.prototype.add = function (ee) {
  this.members.push(ee);
  ee.on(privateErrorEventName, this._errorHandler);
};

SCDomain.prototype.remove = function (ee) {
  var index = this.members.indexOf(ee);
  if (index !== -1) {
    ee.removeListener(privateErrorEventName, this._errorHandler);
    this.members.splice(index, 1);
  }
};

module.exports.create = function () {
  return new SCDomain();
};
