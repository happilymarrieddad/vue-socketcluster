/*
	MySQL Database ORM
*/

var Lynchpin = function(options) {
	var self = this

	var default_options = {
		host:'localhost',
		user:'root',
		password:'password',
		database:'mysql'
	}

	for (var key in options) {
		if (options.hasOwnProperty(key)) {
			default_options[key] = options[key]
		}
	}

	self._pool = require('mysql').createPool(default_options)
}

Lynchpin.prototype.index = function(respond) {
	var self = this
	self._pool.query('SELECT * FROM ??',[self._table],function(err,rows) {
		if (err) { return respond(err) }
		return respond(null, (rows.length ? rows[0] : null) )
	})
}

Lynchpin.prototype.find = function(id,respond) {
	var self = this
	self._pool.query('SELECT * FROM ?? WHERE id = ?',[self._table,id],function(err,rows) {
		if (err) { return respond(err) }
		return respond(null, (rows.length ? rows[0] : null) )
	})
}

Lynchpin.prototype.findBy = function(args,respond) {
	var self = this
	var qry = 'SELECT * FROM ??',
		params = [self._table],
		i = 0
	for (var key in args) {
		if (i > 0) { qry += ' AND ' + key + ' = ?' }
		else { qry += ' WHERE ' + key + ' = ?' }
		params.push(args[key])
		i++
	}
	self._pool.query(qry,params,function(err,rows) {
		if (err) { return respond(err) }
		return respond(null,rows)
	})
}

Lynchpin.prototype.findByAnd = function(args,respond) {
	var self = this
	var qry = 'SELECT * FROM ??',
		params = [self._table],
		i = 0
	for (var key in args) {
		if (i > 0) { qry += ' AND ' + key + ' = ?' }
		else { qry += ' WHERE ' + key + ' = ?' }
		params.push(args[key])
		i++
	}
	self._pool.query(qry,params,function(err,rows) {
		if (err) { return respond(err) }
		return respond(null,rows)
	})
}

Lynchpin.prototype.findByOr = function(args,respond) {
	var self = this
	var qry = 'SELECT * FROM ??',
		params = [self._table],
		i = 0
	for (var key in args) {
		if (i > 0) { qry += ' OR ' + key + ' = ?' }
		else { qry += ' WHERE ' + key + ' = ?' }
		params.push(args[key])
		i++
	}
	self._pool.query(qry,params,function(err,rows) {
		if (err) { return respond(err) }
		return respond(null,rows)
	})
}

Lynchpin.prototype.store = function(obj,respond) {
	var self = this
	self._pool.query('INSERT INTO ?? SET ?',[self._table,obj],function(err,rows) {
		if (err) { return respond(err) }
		self.find(rows.insertId,respond)
	})
}

// // Locate record if not found create it and return it
// Lynchpin.prototype.firstOrCreate = function(respond) {

// }

// // Locate record if not found NOT create it and return it
// Lynchpin.prototype.firstOrNew = function(respond) {
	
// }

Lynchpin.prototype.update = function(id,obj,respond) {
	var self = this
	self._pool.query('UPDATE ?? SET ? WHERE id = ?',[self._table,obj,id],function(err,rows) {
		if (err) { return respond(err) }
		self.find(id,respond)
	})
}

Lynchpin.prototype.destroy = function(id,respond) {
	var self = this
	self._pool.query('DELETE FROM ?? WHERE id = ?',[self._table,id],function(err,rows) {
		if (err) { return respond(err) }
		return respond(null)
	})
}

module.exports = Lynchpin