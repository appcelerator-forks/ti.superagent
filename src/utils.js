/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
export function isObject(obj) {
	return null != obj && 'object' == typeof obj;
}

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */
export function parseHeader(str) {
	var lines = str.split(/\r?\n/),
		fields = {},
		index,
		line,
		field,
		val;

	lines.pop(); // trailing CRLF

	for (var i = 0, len = lines.length; i < len; ++i) {
		line = lines[i];
		index = line.indexOf(':');
		field = line.slice(0, index).toLowerCase();
		val = line.slice(index + 1).trim();
		fields[field] = val;
	}

	return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
export function type(str) {
	return str.split(/ *; */).shift();
}

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */
export function params(str) {
	return str.split(/ *; */).reduce(function(obj, str) {
		var parts = str.split(/ *= */),
			key = parts.shift(),
			val = parts.shift();

		if (key && val) obj[key] = val;
		return obj;
	}, {});
}
