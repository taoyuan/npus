'use strict';

const util = require('util');
const npus = require("..");

const printer = npus.getPrinter();
printer.start();

printer.on('job:complete', () => {
	printer.stop();
});

printer.on('job:status', (job, status) => {
	console.log(`JOB "${job.fullid}" STATUS: ${status}`);
});

printer.print('print from Node.JS buffer', {
	type: 'TEXT',	// type: RAW, TEXT, PDF, JPEG, .. depends on platform
	options: {
		copies: 2,
	}
}).catch(err => {
	console.error(err);
});
