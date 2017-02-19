'use strict';

const {assert} = require('chai');

describe('npus', () => {

	it('load library', () => {
		assert.doesNotThrow(() => require('..'));
	});

	it('list printers', () => {
		const npus = require('..');
		assert.equal(typeof npus.list(), 'object');
	});
});
