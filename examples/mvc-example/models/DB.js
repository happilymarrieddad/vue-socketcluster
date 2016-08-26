'use strict'

class DB {
	consructor() {
		this.config = require('../config.json').db
	}
}

module.exports = new DB()