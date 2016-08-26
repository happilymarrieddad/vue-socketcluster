var SessionController = {}
	async = require('async'),
	Session = require('../models/Session.js')

SessionController.route = 'session'

SessionController.index = function(data,respond) {
	console.log('Inside session controlller')
	respond(null,'Returning from controller!')
}

module.exports = SessionController