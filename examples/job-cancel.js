'use strict';

const util = require('util');
const npus = require("..");

const printer = npus.getPrinter();
printer.start();
printer.on('job:complete', (job) => {
	console.log(`JOB "${job.fullid}" completed`);
	printer.stop();
});

printer.on('job:status', (job, status) => {
	console.log(`JOB "${job.fullid}" STATUS: ${status}`);
});

printer.print('print from Node.JS buffer', {
	type: 'TEXT'	// type: RAW, TEXT, PDF, JPEG, .. depends on platform
}).then(job => {
	const descriptor = job.fetchDescriptor();
	console.log('current job: ', util.inspect(descriptor, {depth: 10, colors: true}));
	if (descriptor.status.indexOf('PRINTED') !== -1) {
		console.log('Too late, already printed');
		return;
	}
	console.log('cancelling...');
	const answer = job.cancel();
	console.log("cancelled: " + answer);
	try {
		console.log("current job info:" + util.inspect(job.fetchDescriptor(), {depth: 10, colors: true}));
	} catch (err) {
		console.log('job deleted. err:' + err);
	}
}).catch(err => {
	console.error(err);
});
