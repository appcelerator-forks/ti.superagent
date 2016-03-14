import { isObject } from './utils';

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */
function serializeObject(obj) {
	if (!isObject(obj)) return obj;
	var pairs = [];
	for (var key in obj) {
		if (null != obj[key]) {
			pushEncodedKeyValuePair(pairs, key, obj[key]);
		}
	}
	return pairs.join('&');
}

export { serializeObject };

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */
function pushEncodedKeyValuePair(pairs, key, val) {
	if (Array.isArray(val)) {
		return val.forEach(function(v) {
			pushEncodedKeyValuePair(pairs, key, v);
		});
	}
	pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
}


/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */
export let types = {
	html: 'text/html',
	json: 'application/json',
	xml: 'application/xml',
	urlencoded: 'application/x-www-form-urlencoded',
	'form': 'application/x-www-form-urlencoded',
	'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj) {
 *       return 'generated xml here';
 *     };
 *
 */
export let serialize = {
	'application/x-www-form-urlencoded': serializeObject,
	'application/json': JSON.stringify
};

/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */
function parseString(str) {
	var obj = {};
	var pairs = str.split('&');
	var parts;
	var pair;

	for (var i = 0, len = pairs.length; i < len; ++i) {
		pair = pairs[i];
		parts = pair.split('=');
		obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
	}

	return obj;
}

/**
 * Expose parser.
 */
export { parseString };

/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(str){
 *       return { object parsed from str };
 *     };
 *
 */
export let parse = {
	'application/x-www-form-urlencoded': parseString,
	'application/json': JSON.parse
};
