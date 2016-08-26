'use strict'

class DB {

	consructor(name) {
		console.log(name)
		if (!name) throw new Error('A DB connection must have a table name.')
		this._db_config = require('../config.json').db
		this._table = name
	}

	find(id,respond) {
		var self = this
		var conn = require('mysql').createConnection(self._db_config)
		conn.connect()
		conn.query('SELECT * ?? WHERE id = ?',[self._table,id],function(err,rows) {
			if (err) { return respond(err) }
			conn.end()
			return respond(null, (rows.length ? rows[0] : null) )
		})
	}

	store(obj,respond) {
		var self = this
		if (typeof obj != 'object') { return respond('In order to store, you must pass in a valid object') }
		var conn = require('mysql').createConnection(self._db_config)
		conn.connect()
		conn.query('INSERT INTO ?? SET = ?',[self._table,obj],function(err,rows) {
			if (err) { return respond(err) }
			conn.end()
			self.find(rows.insertId,respond)
		})
	}

}

module.exports = DB