// Windows does not support PDF formats, but you can use imagemagick-native to achieve conversion from PDF to EMF.

const npus = require("..");
const fs = require('fs');
const path = require('path');

let filename = process.argv[2] || path.resolve(__dirname, 'fixtures', 'doc.pdf');
let printername = process.argv[3];

if (process.platform !== 'win32') {
	throw 'This application can be run only on win32 as a demo of print PDF image'
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

try {
	imagemagick = require('imagemagick-native');
} catch (e) {
	throw 'please install imagemagick-native: `npm install imagemagick-native`'
}


// First convert PDF into
imagemagick.convert({
	srcData: data,
	srcFormat: 'PDF',
	format: 'EMF',
}, function (err, buffer) {
	if (err) {
		throw 'something went wrong on converting to EMF: ' + err;
	}

	printer.print(buffer, {
		type: 'EMF'
	}).then(job => {
		console.log('printed with id ' + job.id);
	}).catch(err => {
		console.error('error on printing: ' + err);
	});
});



