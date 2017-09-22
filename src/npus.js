/**
 * npus
 *
 * Copyright © 2017 Yuan Tao. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const arrify = require('arrify');
const libcups = require('printer');

const Printer = require('./printer');

const npus = module.exports = {};

npus.Printer = require('./printer');
npus.Job = require('./job');

/**
 * List printers
 */
npus.list = function (opts) {
	opts = opts || {};
	const descriptors = arrify(libcups.getPrinters());
	descriptors.forEach(d => d.asPrinter = () => new Printer(d));
	if (opts.simple) {
		return descriptors;
	}
	return descriptors.map(d => d.asPrinter());
};

npus.listPrinters = npus.getPrinters = function () {
	return npus.list();
};

/**
 * Return user defined printer, according to https://www.cups.org/documentation.php/doc-2.0/api-cups.html#cupsGetDefault2 :
 * "Applications should use the cupsGetDests and cupsGetDest functions to get the user-defined default printer,
 * as this function does not support the lpoptions-defined default printer"
 */
npus.defaultPrinterName = npus.getDefaultPrinterName = function () {
	return libcups.getDefaultPrinterName();
};

/**
 * Get supported print format for printDirect
 */
npus.supportedPrintFormats = npus.getSupportedPrintFormats = function () {
	return libcups.getSupportedPrintFormats();
};

/**
 * Get possible job command for setJob. It depends on os.
 * @return Array of string. e.g.: DELETE, PAUSE, RESUME
 */
npus.supportedJobCommands = npus.getSupportedJobCommands = function () {
	return libcups.getSupportedJobCommands();
};

/** Find printer info with jobs
 * @param {String} [name] printer name to extract the info
 * @return {Printer}
 *    TODO: to enum all possible attributes
 */
npus.findPrinter = function (name) {
	name = name || npus.getDefaultPrinterName();
	if (name) {
		const descriptor = libcups.getPrinter(name);
		if (descriptor) {
			return new Printer(descriptor);
		}
	}
	return npus.list()[0];
};

npus.getPrinter = function (name) {
	const printer = npus.findPrinter(name);
	if (!printer) {
		throw new Error('Not found printer "' + name + '"');
	}
	return printer;
};
