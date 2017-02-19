'use strict';

const assert = require('assert');

function eq(a, b) {
	return a === b && (a !== 0 || 1 / a === 1 / b) // false for +0 vs -0
		|| a !== a && b !== b; // true for NaN vs NaN
}

exports.schedule = function (ms, fn) {
	assert(typeof ms === 'number', 'Number "ms" must be a number');
	assert(typeof fn === 'function', 'Function "fn" is required');

	let canceled;
	let t;

	function schedule() {
		t = setTimeout(() => {
			fn.call();
			if (!canceled) schedule();
		}, ms);
	}

	function cancel() {
		canceled = true;
		if (t) {
			clearTimeout(t);
			t = null;
		}
	}

	schedule();

	return {
		cancel,
	}
};

exports.same = function (a, b) {
	if (a === b) {
		return true;
	}

	if ((a && !b) || (!a && b)) {
		return false;
	}

	if (!Array.isArray(a) || !Array.isArray(b)) {
		return eq(a, b);
	}

	return (a.length === b.length) && a.every((u, i) => eq(u, b[i]));
};
