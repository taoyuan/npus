'use strict';

const npus = require("..");
const printer = npus.getPrinter(/*'VPP'*/);
printer.start();
printer.on('job:complete', (job) => {
	console.log(`JOB "${job.fullid}" completed`);
	printer.stop();
});
printer.print("print from Node.JS buffer\n", {
	type: 'RAW' // type: RAW, TEXT, PDF, JPEG, .. depends on platform
}).then(job => {
	console.log("sent to printer with ID: " + job.id);
}).catch(err => {
	console.error(err);
});
