/* global Ti */
import { types, serialize, serializeObject } from './globals';
import { isObject } from './utils';
import Response from './response';

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */
function isJSON(mime) {
	return /[\/+]json\b/.test(mime);
}

var Request = function(method, url) {
	this._timeout = undefined;
	this.method = method;
	this.url = url;
	this._query = [];
	this.header = {}; // preserves header name case
	this._header = {}; // coerces header names to lowercase
};

// Set Content-Type
Request.prototype.type = function(type) {
	this.set('Content-Type', types[type] || type);
	return this;
};

// Set Accept header
Request.prototype.accept = function(type) {
	this.set('Accept', types[type] || type);
	return this;
};

// set header
Request.prototype.set = function(field, val) {
	if (isObject(field)) {
		for (var key in field) {
			this.set(key, field[key]);
		}
		return this;
	}
	this._header[field.toLowerCase()] = val;
	this.header[field] = val;
	return this;
};

// get header
Request.prototype.get = function(field){
	return this._header[field.toLowerCase()];
};

Request.prototype.query = function(val){
	if ('string' != typeof val) val = serializeObject(val);
	if (val) this._query.push(val);
	return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */
Request.prototype.timeout = function timeout(ms) {
	this._timeout = ms;
	return this;
};

// basic auth
Request.prototype.auth = function(user, pass, options){
	if (!options) {
		options = {
			type: 'basic'
		};
	}

	switch (options.type) {
		case 'basic':
			var str = Ti.Utils.base64encode(user + ':' + pass);
			this.set('Authorization', 'Basic ' + str);
			break;

		case 'auto':
			this.username = user;
			this.password = pass;
			break;
	}
	return this;
};

// FIXME How do we do form data?!

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */
Request.prototype.attach = function(field, file, filename){
	if (!this._formData) this._formData = {};
	this._formData[field] = file; // TODO What about filename?
	return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
Request.prototype.field = function(name, val) {
	if (!this._formData) {
		this._formData = {};
	}
	this._formData[name] = val;
	return this;
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
	var str = {}.toString.call(obj);

	switch (str) {
		case '[object File]':
		case '[object Blob]':
		case '[object FormData]':
			return true;
		default:
			return false;
	}
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */
Request.prototype.send = function (data) {
	var obj = isObject(data);
	var type = this._header['content-type'];

	// merge
	if (obj && isObject(this._data)) {
		for (var key in data) {
			this._data[key] = data[key];
		}
	} else if ('string' == typeof data) {
		// default to x-www-form-urlencoded
		if (!type) this.type('form');
		type = this._header['content-type'];
		if ('application/x-www-form-urlencoded' == type) {
			this._data = this._data ? this._data + '&' + data : data;
		} else {
			this._data = (this._data || '') + data;
		}
	} else {
		this._data = data;
	}

	if (!obj || this._isHost(data)) return this;

	// default to json
	if (!type) this.type('json');
	return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */
Request.prototype.withCredentials = function() {
	this._withCredentials = true;
	return this;
};

/**
 * Sets whether we validate the server certificate. May want to set to 'false'
 * when testing with servers using self-signed certificates.
 *
 * @param {Boolean} value
 * @return {Request} for chaining
 * @api public
 */
Request.prototype.validatesSecureCertificate = function(value) {
	this._validatesSecureCertificate = value || true;
	return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */
Request.prototype.end = function(fn) {
	var self = this;
	var xhr = this.xhr = Ti.Network.createHTTPClient();
	var query = this._query.join('&');
	var timeout = this._timeout;
	var data = this._formData || this._data;

	// Set up onload/onerror!
	xhr.onload = function () {
		let err,
			response;
		try {
			response = new Response(self);
		} catch(e) {
			err = new Error('Parser is unable to parse the response');
			err.parse = true;
			err.original = e;
			// return the raw response if the response parsing fails
			err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
			// return the http status code if the response parsing fails
			err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
		}

		// Error parsing response
		if (err) {
			return fn(err, response);
		}

		// Success
		if (response.status >= 200 && response.status < 300) {
			return fn(err, response);
		}

		// Unknown error
		let new_err = new Error(response.statusText || 'Unsuccessful HTTP response');
		new_err.original = err;
		new_err.response = response;
		new_err.status = response.status;

		fn(new_err, response);
	};

	xhr.onerror = function (e) {
		let err = e.error,
			response;
		try {
			response = new Response(self);
		} catch(e) {
			err = new Error('Parser is unable to parse the response');
			err.parse = true;
			err.original = e;
			// return the raw response if the response parsing fails
			err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
			// return the http status code if the response parsing fails
			err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
		}
		fn(err, response);
	};

	// timeout
	if (timeout) {
		xhr.timeout = timeout;
	}

	// querystring
	if (query) {
		query = serializeObject(query);
		this.url += ~this.url.indexOf('?') ? '&' + query : '?' + query;
	}

	// Auth
	if (this.username && this.password) {
		xhr.username = this.username;
		xhr.password = this.password;
	}

	// Validate Cert?
	if (this._validatesSecureCertificate) xhr.validatesSecureCertificate = this._validatesSecureCertificate;

	// CORS
	if (this._withCredentials) xhr.withCredentials = true;

	// OPEN
	xhr.open(this.method, this.url, true);

	// body
	if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
		// serialize stuff
		let contentType = this._header['content-type'];
		let serializeFunc = this._parser || serialize[contentType ? contentType.split(';')[0] : ''];
		if (!serializeFunc && isJSON(contentType)) serializeFunc = serialize['application/json'];
		if (serializeFunc) data = serializeFunc(data);
	}

	// set header fields
	for (var field in this.header) {
		if (null == this.header[field]) continue;
		xhr.setRequestHeader(field, this.header[field]);
	}

	// SEND
	xhr.send(typeof data !== 'undefined' ? data : null);
	return this;
};

export default Request;
