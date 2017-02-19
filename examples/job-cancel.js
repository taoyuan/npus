'use strict';

const util = require('util');
const npus = require("..");

const printer = npus.getPrinter();
printer.print('print from Node.JS buffer', {
	type: 'TEXT'	// type: RAW, TEXT, PDF, JPEG, .. depends on platform
}).then(job => {
	console.log("sent to printer with ID: " + job.id);
	job.on('status', (status) => {
		console.log('STATUS:', status);
	});
	const info = job.update();
	console.log('current job: ', util.inspect(info, {depth: 10, colors: true}));
	if (info.status.indexOf('PRINTED') !== -1) {
		console.log('too late, already printed');
		return;
	}
	console.log('cancelling...');
	const answer = job.cancel();
	console.log("cancelled: " + answer);
	try {
		console.log("current job info:" + util.inspect(job.update(), {depth: 10, colors: true}));
	} catch (err) {
		console.log('job deleted. err:' + err);
	}
}).catch(err => {
	console.error(err);
});
