'use strict';

const util = require('util');
const npus = require("..");

const printer = npus.getPrinter();
printer.print('print from Node.JS buffer', {
	type: 'TEXT'	// type: RAW, TEXT, PDF, JPEG, .. depends on platform
}).then(job => {
	console.log("sent to printer with ID: " + job.id);
	console.log('STATUS:', job.descriptor.status);
	job.on('status', (status) => {
		console.log('STATUS:', status);
	});
	// const info = job.update();
	// console.log('current job: ', util.inspect(info, {depth: 10, colors: true}));
}).catch(err => {
	console.error(err);
});
