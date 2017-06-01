'use strict';

const debug = require('debug')('npus:printer');
const _ = require('lodash');
const PromiseA = require('bluebird');
const libcups = require('printer');
const {EventEmitter} = require('events');
const errs = require('errs');
const Job = require('./job');
const schedule = require('./utils').schedule;
const arrify = require('arrify');

class Printer extends EventEmitter {

	constructor(descriptor) {
		super();
		this.update(descriptor);
	}

	get descriptor() {
		return this._descriptor;
	}

	get name() {
		return this._descriptor.name;
	}

	get status() {
		return this._descriptor.status;
	}

	get started() {
		return this._schedule && !this._schedule.isCancelled();
	}

	start(interval) {
		interval = interval || 500;
		if (!this.started) {
			debug(`Start printer "${this.name}" with interval ${interval}ms`);
			this._schedule = schedule(interval, () => this.update());
		}
	}

	stop() {
		if (this.started) {
			debug(`Stop printer "${this.name}"`);
			this._schedule.cancel();
		}
	}

	toJSON() {
		const json = _.omit(this._descriptor, 'jobs');
		json.jobs = _.map(this.jobs, job => job.descriptor);
		return json;
	}

	update(descriptor) {
		descriptor = descriptor || libcups.getPrinter(this.name);
		if (!descriptor) {
			return this.emit('error', errs.create({
				message: `Printer "${this.name}" is not exists or has been deleted`,
				printer: this
			}));
		}

		const descriptorChanged = !_.isEqual(this._descriptor, descriptor);
		const statusChanged = !_.isEqual(_.get(this._descriptor, 'status'), _.get(descriptor, 'status'));

		if (descriptorChanged) {
			this._descriptor = descriptor;
			this.emit('update', descriptor, this);
			if (statusChanged) {
				this.emit('status', descriptor.status, this);
			}
			this._addJob(descriptor.jobs);
		}

		_.forEach(this.jobs, job => job.update());
	}

	_addJob(data) {
		const items = arrify(data);
		const result = _.map(items, item => {
			this.jobs = this.jobs || {};
			const jobId = typeof item === 'object' ? item.id : item;
			let job = this.jobs[jobId];
			if (!job) {
				job = new Job(this, item);
				job.once('complete', () => {
					_.remove(this.jobs, job);
					debug(`Removed job "${job.fullid}"`);
				});
				this.emit('job', job);
				this.jobs[jobId] = job;
			}
			return job;
		});
		return Array.isArray(data) ? result : result[0];
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
				success: jobId => resolve(this._addJob(jobId)),
				error: reject
			});
		});
	}

	/**
	 *
	 * @return {*}
	 */
	printDirect() {
		return this.print(...arguments);
	}

	/**
	 *
	 * @param {String} filename data to printer
	 * @param {String} [docname] name of document showed in printer status
	 * @param {Object} [options] JS object with CUPS options, optional
	 */
	printFile(filename, {docname, options} = {}) {
		debug(`print file ${filename}`);
		if (process.platform === 'win32') {
			return this.print(require('fs').readFileSync(filename), {docname, options});
		}
		return new PromiseA((resolve, reject) => {
			libcups.printFile({
				filename, docname, options,
				printer: this.name,
				success: jobId => resolve(this._addJob(jobId)),
				error: reject
			});
		});
	}
}

module.exports = Printer;
