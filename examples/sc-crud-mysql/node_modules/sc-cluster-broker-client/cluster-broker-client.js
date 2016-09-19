var url = require('url');
var scClient = require('socketcluster-client');
var EventEmitter = require('events').EventEmitter;

var trailingPortNumberRegex = /:[0-9]+$/

var ClusterBrokerClient = function (broker, options) {
  EventEmitter.call(this);
  this.subMappers = [];
  this.pubMappers = [];
  this.broker = broker;
  this.targetClients = {};
  this.authKey = options.authKey || null;

  this._handleClientError = (err) => {
    this.emit('error', err);
  };
};

ClusterBrokerClient.prototype = Object.create(EventEmitter.prototype);

ClusterBrokerClient.prototype.errors = {
  NoMatchingTargetError: function (channelName) {
    var err = new Error(`Could not find a matching target server for the ${channelName} channel - The server may have gone down recently.`);
    err.name = 'NoMatchingTargetError';
    return err;
  }
};

ClusterBrokerClient.prototype.breakDownURI = function (uri) {
  var parsedURI = url.parse(uri);
  var hostname = parsedURI.host.replace(trailingPortNumberRegex, '');
  var result = {
    hostname: hostname,
    port: parsedURI.port
  };
  if (parsedURI.protocol == 'wss:' || parsedURI.protocol == 'https:') {
    result.secure = true;
  }
  return result;
};

ClusterBrokerClient.prototype._mapperPush = function (mapperList, mapper, targetURIs) {
  var targets = {};

  targetURIs.forEach((clientURI) => {
    var clientConnectOptions = this.breakDownURI(clientURI);
    clientConnectOptions.query = {
      authKey: this.authKey
    };
    var client = scClient.connect(clientConnectOptions);
    client.on('error', this._handleClientError);
    client.targetURI = clientURI;
    targets[clientURI] = client;
    this.targetClients[clientURI] = client;
  });

  var mapperContext = {
    mapper: mapper,
    targets: targets
  };
  mapperList.push(mapperContext);

  return mapperContext;
};

ClusterBrokerClient.prototype._getAllBrokerSubscriptions = function () {
  var channelMap = {};
  var workerChannelMaps = Object.keys(this.broker.subscriptions);
  workerChannelMaps.forEach((index) => {
    var workerChannels = Object.keys(this.broker.subscriptions[index]);
    workerChannels.forEach((channelName) => {
      channelMap[channelName] = true;
    });
  });
  return Object.keys(channelMap);
};

ClusterBrokerClient.prototype.getAllSubscriptions = function () {
  var visitedClientsLookup = {};
  var channelsLookup = {};
  var subscriptions = [];
  this.subMappers.forEach((mapperContext) => {
    Object.keys(mapperContext.targets).forEach((clientURI) => {
      var client = mapperContext.targets[clientURI];
      if (!visitedClientsLookup[clientURI]) {
        visitedClientsLookup[clientURI] = true;
        var subs = client.subscriptions(true);
        subs.forEach((channelName) => {
          if (!channelsLookup[channelName]) {
            channelsLookup[channelName] = true;
            subscriptions.push(channelName);
          }
        });
      }
    });
  });

  var localBrokerSubscriptions = this._getAllBrokerSubscriptions();
  localBrokerSubscriptions.forEach((channelName) => {
    if (!channelsLookup[channelName]) {
      subscriptions.push(channelName);
    }
  });
  return subscriptions;
};

ClusterBrokerClient.prototype._cleanupUnusedTargetSockets = function () {
  var requiredClients = {};
  this.subMappers.forEach((subMapperContext) => {
    var subMapperTargetURIs = Object.keys(subMapperContext.targets);
    subMapperTargetURIs.forEach((uri) => {
      requiredClients[uri] = true;
    });
  });
  this.pubMappers.forEach((pubMapperContext) => {
    var pubMapperTargetURIs = Object.keys(pubMapperContext.targets);
    pubMapperTargetURIs.forEach((uri) => {
      requiredClients[uri] = true;
    });
  });
  var targetClientURIs = Object.keys(this.targetClients);
  targetClientURIs.forEach((targetURI) => {
    if (!requiredClients[targetURI]) {
      this.targetClients[targetURI].disconnect();
      delete this.targetClients[targetURI];
    }
  });
};

ClusterBrokerClient.prototype.subMapperPush = function (mapper, targetURIs) {
  var mapperContext = this._mapperPush(this.subMappers, mapper, targetURIs);
  var activeChannels = this.getAllSubscriptions();

  activeChannels.forEach((channelName) => {
    this._subscribeWithMapperContext(mapperContext, channelName);
  });
};

ClusterBrokerClient.prototype.subMapperShift = function () {
  var activeChannels = this.getAllSubscriptions();
  var oldMapperContext = this.subMappers.shift();
  activeChannels.forEach((channelName) => {
    this._unsubscribeWithMapperContext(oldMapperContext, channelName);
  });
  this._cleanupUnusedTargetSockets();
};

ClusterBrokerClient.prototype.pubMapperPush = function (mapper, targetURIs) {
  this._mapperPush(this.pubMappers, mapper, targetURIs);
};

ClusterBrokerClient.prototype.pubMapperShift = function () {
  this.pubMappers.shift();
  this._cleanupUnusedTargetSockets();
};

ClusterBrokerClient.prototype._unsubscribeWithMapperContext = function (mapperContext, channelName) {
  var targetURI = mapperContext.mapper(channelName);
  if (targetURI) {
    var isLastRemainingMappingForClientForCurrentChannel = true;

    // If any other subscription mappers map to this client for this channel,
    // then don't unsubscribe.
    this.subMappers.forEach((subMapperContext) => {
      var subTargetURI = subMapperContext.mapper(channelName);
      if (targetURI == subTargetURI) {
        isLastRemainingMappingForClientForCurrentChannel = false;
        return;
      }
    });
    if (isLastRemainingMappingForClientForCurrentChannel) {
      var targetClient = mapperContext.targets[targetURI];
      targetClient.unsubscribe(channelName);
      targetClient.unwatch(channelName);
    }
  } else {
    var err = this.errors['NoMatchingTargetError'](channelName);
    this.emit('error', err);
  }
};

ClusterBrokerClient.prototype.unsubscribe = function (channelName) {
  this.subMappers.forEach((mapperContext) => {
    this._unsubscribeWithMapperContext(mapperContext, channelName);
  });
};

ClusterBrokerClient.prototype._handleChannelMessage = function (channelName, packet) {
  this.emit('message', channelName, packet);
};

ClusterBrokerClient.prototype._subscribeWithMapperContext = function (mapperContext, channelName) {
  var targetURI = mapperContext.mapper(channelName);
  if (targetURI) {
    var targetClient = mapperContext.targets[targetURI];
    targetClient.subscribe(channelName);
    if (!targetClient.watchers(channelName).length) {
      targetClient.watch(channelName, this._handleChannelMessage.bind(this, channelName));
    }
  } else {
    var err = this.errors['NoMatchingTargetError'](channelName);
    this.emit('error', err);
  }
};

ClusterBrokerClient.prototype.subscribe = function (channelName) {
  this.subMappers.forEach((mapperContext) => {
    this._subscribeWithMapperContext(mapperContext, channelName);
  });
};

ClusterBrokerClient.prototype._publishWithMapperContext = function (mapperContext, channelName, data) {
  var targetURI = mapperContext.mapper(channelName);
  if (targetURI) {
    var targetClient = mapperContext.targets[targetURI];
    targetClient.publish(channelName, data);
  } else {
    var err = this.errors['NoMatchingTargetError'](channelName);
    this.emit('error', err);
  }
};

ClusterBrokerClient.prototype.publish = function (channelName, data) {
  this.pubMappers.forEach((mapperContext) => {
    this._publishWithMapperContext(mapperContext, channelName, data);
  });
};

module.exports.ClusterBrokerClient = ClusterBrokerClient;
