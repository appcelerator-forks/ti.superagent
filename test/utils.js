import { expect } from 'chai';
import { parseHeader, type, params } from './../src/utils';

describe('utils.type(str)', () => {
	it('should return the mime type', () => {
		expect(type('application/json; charset=utf-8')).equal('application/json');

		expect(type('application/json')).equal('application/json');
	});
});

describe('utils.params(str)', () => {
	it('should return the field parameters', () => {
		let str = 'application/json; charset=utf-8; foo  = bar';
		const obj = params(str);
		expect(obj.charset).equal('utf-8');
		expect(obj.foo).equal('bar');

		str = 'application/json';
		expect(params(str)).eql({});
	});
});
// TODO Test parseHeader
// TODO Test isObject
