var SessionController = {}
	async = require('async')

SessionController.route = 'session'

SessionController.index = function(data,respond) {
	console.log('Inside session controlller')
	respond(null,'Returning from controller!')
}

module.exports = SessionController