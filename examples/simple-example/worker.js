var fs = require('fs'),
    express = require('express'),
    serveStatic = require('serve-static'),
    path = require('path');

module.exports.run = function (worker) {
    console.log('   >> Worker PID:', process.pid)

    var app = require('express')()

    var httpServer = worker.httpServer
    var scServer = worker.scServer

    app.set('views', __dirname+'/views')
    app.set('view engine', 'jade')
    app.use(serveStatic(path.resolve(__dirname, 'public')))

    httpServer.on('request', app)

    app.get('*',function(req,res) {
        res.render('home/index')
    })

    scServer.on('connection', function (socket) {
        console.log('   >> Client',socket.id,'connected at',new Date())

        console.log('ping sent to',socket.id)
        socket.emit('ping')

        socket.on('pong',function() {
            console.log('pong received from',socket.id)
        })

    })

}
