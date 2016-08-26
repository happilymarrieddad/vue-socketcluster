'use strict'
var bcrypt = require('bcrypt')

class Password {
	constructor() {

		this.hash = function(pwd,respond) {
			if (!pwd || typeof pwd != 'string') { return respond('Password must be a valid string.') }
			return respond(null,bcrypt.hashSync(pwd,bcrypt.genSaltSync(10)))
		}

		this.verify = function(pwd,hash) {
			return bcrypt.compareSync(pwd,hash)
		}
		
	}
}

module.exports = new Password()