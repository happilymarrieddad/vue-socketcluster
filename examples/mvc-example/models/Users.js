'use strict'

class Users extends require('./DB') {
	constructor() {
		super('users')
	}
}

module.exports = Users