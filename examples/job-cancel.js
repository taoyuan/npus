'use strict';

const util = require('util');
const npus = require("..");

const printer = npus.getPrinter();
printer.print('print from Node.JS buffer', {
	type: 'TEXT'	// type: RAW, TEXT, PDF, JPEG, .. depends on platform
}).then(job => {
	console.log("sent to printer with ID: " + job.id);
	const descriptor = job.descriptor();
	console.log('current job: ', util.inspect(descriptor, {depth: 10, colors: true}));
	if (descriptor.status.indexOf('PRINTED') !== -1) {
		console.log('too late, already printed');
		return;
	}
	console.log('cancelling...');
	const answer = job.cancel();
	console.log("cancelled: " + answer);
	try {
		console.log("current job info:" + util.inspect(job.descriptor(), {depth: 10, colors: true}));
	} catch (err) {
		console.log('job deleted. err:' + err);
	}
}).catch(err => {
	console.error(err);
});
