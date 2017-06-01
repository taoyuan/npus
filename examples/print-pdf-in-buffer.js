// Windows does not support PDF formats, but you can use imagemagick-native to achieve conversion from PDF to EMF.

const npus = require("..");
const fs = require('fs');
const path = require('path');

let filename = process.argv[2] || path.resolve(__dirname, 'fixtures', 'doc.pdf');
let printername = process.argv[3];

if (process.platform === 'win32') {
	throw 'Not yet supported for win32'
}

if (!filename || filename === '-h') {
	throw 'PDF file name is missing. Please use the following params: <filename> [printername]'
}

filename = path.resolve(process.cwd(), filename);
console.log('printing file name ' + filename);

const printer = npus.getPrinter();
printer.start();
printer.on('job:complete', (job) => {
	console.log(`JOB "${job.fullid}" completed`);
	printer.stop();
});
const data = fs.readFileSync(filename);
console.log('data type is: ' + typeof(data) + ', is buffer: ' + Buffer.isBuffer(data));
printer.print(data, {
	type: 'PDF'
}).then(job => {
	console.log('printed with id ' + job.id);
}).catch(err => {
	console.error('error on printing: ' + err);
});

