'use strict';

const PromiseA = require('bluebird');
const libcups = require('printer');
const Job = require('./job');

class Printer {

	constructor(descriptor) {
		this.descriptor = descriptor;
		Object.assign(this, descriptor);
	}

	getSelectedPaperSize() {
		return libcups.getSelectedPaperSize(this.name);
	}

	getDriverOptions() {
		return libcups.getPrinterDriverOptions(this.name);
	}

	/**
	 *
	 * @param {String|Buffer} data data to printer
	 * @param {String} [docname] name of document showed in printer status
	 * @param {String} [type] only for wind32, data type, one of the RAW, TEXT
	 * @param {Object} [options] JS object with CUPS options, optional
	 * @return {*}
	 */
	print(data, {docname, type, options} = {}) {
		return new PromiseA((resolve, reject) => {
			libcups.printDirect({
				data, docname, type, options,
				printer: this.name,
				success: jobId => resolve(new Job(this, jobId)),
				error: reject
			});
		});
	}

	/**
	 *
	 * @param {String} filename data to printer
	 * @param {String} [docname] name of document showed in printer status
	 * @param {Object} [options] JS object with CUPS options, optional
	 */
	printFile(filename, {docname, options} = {}) {
		if (process.platform === 'win32') {
			return this.print(require('fs').readFileSync(filename), {docname, options});
		}
		return new PromiseA((resolve, reject) => {
			libcups.printFile({
				filename, docname, options,
				printer: this.name,
				success: jobId => resolve(new Job(this, jobId)),
				error: reject
			});
		});
	}

}

module.exports = Printer;
