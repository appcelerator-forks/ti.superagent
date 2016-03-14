import Request from './request';
import Response from './response';
import { types, serialize, parse } from './globals';
import constructors from './constructors';

/**
 * Expose the request function.
 */
var request = constructors.bind(null, Request);

/**
 * Expose global maps for serializing and parsing content types/MIME types.
 */
request.types = types;
request.serialize = serialize;
request.parse = parse;

/**
 * Expose `Response`.
 */
exports.Response = Response;

/**
 * Expose `Request`.
 */
exports.Request = Request;


/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */
request.get = function(url, data, fn) {
	var req = request('GET', url);
	if ('function' == typeof data) fn = data, data = null;
	if (data) req.query(data);
	if (fn) req.end(fn);
	return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */
request.head = function(url, data, fn) {
	var req = request('HEAD', url);
	if ('function' == typeof data) fn = data, data = null;
	if (data) req.send(data);
	if (fn) req.end(fn);
	return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */
function del(url, fn) {
	var req = request('DELETE', url);
	if (fn) req.end(fn);
	return req;
}

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */
request.patch = function(url, data, fn) {
	var req = request('PATCH', url);
	if ('function' == typeof data) fn = data, data = null;
	if (data) req.send(data);
	if (fn) req.end(fn);
	return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */
request.post = function(url, data, fn) {
	var req = request('POST', url);
	if ('function' == typeof data) fn = data, data = null;
	if (data) req.send(data);
	if (fn) req.end(fn);
	return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */
request.put = function(url, data, fn) {
	var req = request('PUT', url);
	if ('function' == typeof data) fn = data, data = null;
	if (data) req.send(data);
	if (fn) req.end(fn);
	return req;
};

module.exports = request;
