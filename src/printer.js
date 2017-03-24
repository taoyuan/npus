'use strict';

const _ = require('lodash');
const PromiseA = require('bluebird');
const libcups = require('printer');
const {EventEmitter} = require('events');
const errs = require('errs');
const Job = require('./job');
const utils = require('./utils');

class Printer extends EventEmitter {

	constructor(descriptor) {
		super();
		this._descriptor = descriptor;
	}

	get descriptor() {
		return this._descriptor;
	}

	get name() {
		return this._descriptor.name
	}

	monit(interval) {
		if (this._schedule && !this._schedule.isCancelled()) {
			return this._schedule;
		}
		return this._schedule = utils.schedule(interval || 1000, () => this._refresh());
	}

	_refresh() {
		const descriptor = libcups.getPrinter(this.name);
		if (!descriptor) {
			return this.emit('error', errs.create({
				message: `Printer "${this.name}" is not exists or has been deleted`,
				printer: this
			}))
		}

		const descriptorChanged = !_.isEqual(this._descriptor, descriptor);
		const statusChanged = !_.isEqual(_.get(this._descriptor, 'status'), _.get(descriptor, 'status'));

		if (descriptorChanged) {
			this._descriptor = descriptor;
			this.emit('update', descriptor, this);
			if  (statusChanged) {
				this.emit('status', descriptor.status, this);
			}
		}
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
