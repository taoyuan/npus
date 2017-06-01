'use strict';

const path = require('path');
const npus = require("..");

const filename = process.argv[2] || path.resolve(__dirname, 'fixtures', 'doc.pdf');
const printerName = process.argv[3];

console.log('platform:', process.platform);
console.log('try to print file: ' + filename);

const printer = npus.getPrinter(printerName);
printer.start();
printer.on('job:complete', (job) => {
	console.log(`JOB "${job.fullid}" completed`);
	printer.stop();
});
printer.printFile(filename).then(job => {
	console.log("sent to printer with ID: " + job.id);
	console.log(job.status);
}).catch(err => {
	console.error(err);
});
