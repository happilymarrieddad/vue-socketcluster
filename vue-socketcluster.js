(function () {
    var version = 1.0.0
    window.VueSocketcluster = {}

    if (!socketCluster) {
        throw new Error("[Vue-Socketcluster] cannot locate socketcluster-client")
    }

    var VueSocketcluster = {
        install: function (Vue, config) {

            if (typeof config == 'object') {
                if (!config.hostname || !config.port) {
                    config.hostname = 'localhost',
                    config.port = 3000
                }
                
            } else {
                config = {
                    hostname:'localhost',
                    port:3000
                }
            }

            var socket = socketCluster.connect(config)

            /*
             * Wildcard support
             * http://stackoverflow.com/questions/10405070/socket-io-client-respond-to-all-events-with-one-handler
             */
            var onevent = socket.onevent;
            socket.onevent = function (packet) {
                var args = packet.data || [];
                onevent.call(this, packet);
                packet.data = ["*"].concat(args);
                onevent.call(this, packet);
            }

            var methods = [
                "connect",
                "error",
                "disconnect",
                "reconnect",
                "reconnect_attempt",
                "reconnecting",
                "reconnect_error",
                "reconnect_failed"
            ]

            Vue.mixin({
                created: function () {
                    var self = this
                    if (this.$options.hasOwnProperty("sockets")) {
                        
                        for (var key in self.$options.sockets) {
                            if (self.$options.sockets.hasOwnProperty(key) && methods.indexOf(key) < 0) {
                                socket.on(key,function(emit,data,respond) {
                                    self.$options.sockets[key].call(self,data,respond)
                                })
                            }
                        }

                        // socket.on("*", function (emit, data) {
                        //     if (self.$options.sockets.hasOwnProperty(emit)) {
                        //         self.$options.sockets[emit].call(self, data)
                        //     }
                        // })

                        methods.forEach(function (m) {
                            socket.on(m, function (data,respond) {
                                if (self.$options.sockets.hasOwnProperty(m)) {
                                    self.$options.sockets[m].call(self, data, respond)
                                }
                            })
                        })
                    }

                    // Global socketio instance
                    this.$sc = socket
                }
            })


        }
    };

    if (typeof exports == "object") {
        module.exports = VueSocketcluster
    } else if (typeof define == "function" && define.amd) {
        define([], function () {
            return VueSocketcluster
        })
    } else if (window.Vue) {
        window.VueSocketcluster = VueSocketcluster;
    }


})();