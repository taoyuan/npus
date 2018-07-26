import * as assert from 'assert';

/**
 *
 * @param ms
 * @param fn
 * @return {{isCancelled: (function(): *), cancel: (function(): *)}}
 */
export function schedule(ms, fn) {
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
}
