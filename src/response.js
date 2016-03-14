import { parseHeader, type, params } from './utils';
import { parse } from './globals';

function Response(req, options) {
	this.req = req;
	this.xhr = this.req.xhr;
	this.text = this.xhr.responseText;
	this.statusText = this.xhr.statusText;
	this._setStatusProperties(this.xhr.status);
	this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
	// getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
	// getResponseHeader still works. so we get content-type even if getting
	// other headers fails.
	this.header['content-type'] = this.xhr.getResponseHeader('content-type');
	this._setHeaderProperties(this.header);
	this.body = (this.req.method != 'HEAD') ?
		this._parseBody(this.text ? this.text : this.xhr.responseData) : null;
}

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */
Response.prototype._parseBody = function(str) {
	var parseFunc = parse[this.type];
	// TODO Ti API will handle XML and return this.xhr.responseXML as Ti.XML.Document!
	return parseFunc && str && (str.length || str instanceof Object)
		? parseFunc(str) : null;
};

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */
Response.prototype.get = function(field) {
	return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */
Response.prototype._setHeaderProperties = function(header) {
	// content-type
	var ct = this.header['content-type'] || '';
	this.type = type(ct);

	// params
	var obj = params(ct);
	for (var key in obj) this[key] = obj[key];
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */
Response.prototype._setStatusProperties = function(status) {
	var type = status / 100 | 0;

	// status / class
	this.status = this.statusCode = status;
	this.statusType = type;

	// basics
	this.info = 1 == type;
	this.ok = 2 == type;
	this.clientError = 4 == type;
	this.serverError = 5 == type;
	this.error = (4 == type || 5 == type)
		? this.toError()
		: false;

	// sugar
	this.accepted = 202 == status;
	this.noContent = 204 == status;
	this.badRequest = 400 == status;
	this.unauthorized = 401 == status;
	this.notAcceptable = 406 == status;
	this.notFound = 404 == status;
	this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */
Response.prototype.toError = function() {
	var req = this.req;
	var method = req.method;
	var url = req.url;

	var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
	var err = new Error(msg);
	err.status = this.status;
	err.method = method;
	err.url = url;

	return err;
};

export default Response;
