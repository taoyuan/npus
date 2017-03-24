'use strict';

const assert = require('assert');

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
		isCancelled: () => canceled,
		cancel,
	};
};
