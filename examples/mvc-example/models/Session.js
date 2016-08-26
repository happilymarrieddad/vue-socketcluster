'use strict'

class Session extends require('./DB.js') {
	constructor() {
		super('session')
	}
}

module.exports = new Session()