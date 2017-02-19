'use strict';

const npus = require('..');

let name = npus.getDefaultPrinterName();

if (!name) {
	const printers = npus.list();
	if (printers.length) {
		name = printers[0];
	}
}

if (!name) {
	console.warn('No printers found');
	process.exit(1);
}

console.log(npus.getPrinter(name));
