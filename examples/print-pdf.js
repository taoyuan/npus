'use strict';

const path = require('path');
const npus = require("..");

const printerName = process.argv[2];
const filename = process.argv[3] || path.resolve(__dirname, 'fixtures', 'doc.pdf');

console.log('platform:', process.platform);
console.log('try to print file: ' + filename);

const printer = npus.getPrinter(printerName);
printer.start();

printer.on('job:status', (job) => {
	console.log(job.status);
});

printer.on('job:complete', (job) => {
	console.log(`JOB "${job.fullid}" completed`);
	printer.stop();
});

printer.printFile(filename, {n: 2}).then(job => {
	console.log("sent to printer with ID: " + job.id);

}).catch(err => {
	console.error(err);
});
