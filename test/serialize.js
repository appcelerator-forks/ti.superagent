import { expect } from 'chai';
import { serializeObject, parseString } from './../src/globals';

function serialize(obj, res) {
	let val = serializeObject(obj);
	expect(val).to.equal(res);
}

function parse(str, obj) {
	let val = parseString(str);
	expect(val).to.eql(obj);
}

describe('request.serializeObject()', () => {
	it('should serialize', () => {
		serialize('test', 'test');
		serialize('foo=bar', 'foo=bar');
		serialize({ foo: 'bar' }, 'foo=bar');
		serialize({ foo: null }, '');
		serialize({ foo: 'null' }, 'foo=null');
		serialize({ foo: undefined }, '');
		serialize({ foo: 'undefined' }, 'foo=undefined');
		serialize({ name: 'tj', age: 24 }, 'name=tj&age=24');
		serialize({ name: '&tj&' }, 'name=%26tj%26');
		serialize({ '&name&': 'tj' }, '%26name%26=tj');
	});
});

describe('request.parseString()', () => {
	it('should parse', () => {
		parse('name=tj', { name: 'tj' });
		parse('name=Manny&species=cat', { name: 'Manny', species: 'cat' });
		parse('redirect=/&ok', { redirect: '/', ok: 'undefined' });
		parse('%26name=tj', { '&name': 'tj' });
		parse('name=tj%26', { name: 'tj&' });
	});
});
