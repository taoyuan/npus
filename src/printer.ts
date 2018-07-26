import {inspect} from "util";

const debug = require('debug')('npus:printer');
import * as _ from 'lodash';
import * as libcups from 'printer';
import {EventEmitter} from 'events';
import * as lp from './lp';
import {Job} from './job';
import * as arrify from 'arrify';

export interface PrinterDescriptorOptions {
	[name: string]: any
}

export interface PrinterDescriptor {
	name: string;
	isDefault: boolean;
	status: string;
	options: PrinterDescriptorOptions;
	jobs?: Job[];
}

export interface PrintOptions {
	docname: string;
	type: string;
	options: any;
}

export class Printer extends EventEmitter {

	protected _descriptor?: PrinterDescriptor;

	jobs;

	constructor(descriptor) {
		super();
		this.update(descriptor);
	}

	get descriptor() {
		return this._descriptor;
	}

	get name() {
		return this._descriptor && this._descriptor.name;
	}

	get status() {
		return this._descriptor && this._descriptor.status;
	}

	get uri() {
		return this._descriptor && this._descriptor.options['device-uri'];
	}

	toJSON() {
		const json = _.omit(this._descriptor, 'jobs');
		json.jobs = _.map(this.jobs, ({descriptor}) => descriptor);
		json.uri = this.uri;
		return json;
	}

	update(descriptor?: PrinterDescriptor) {
		const statusChanged = !_.isEqual(_.get(this._descriptor, 'status'), _.get(descriptor, 'status'));
		this._descriptor = descriptor;

		if (!descriptor) {
			return;
		}

		if (statusChanged) {
			this.emit('status', descriptor.status, this);
		}
		this._addJob(descriptor.jobs);

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


	print(data, opts?: PrintOptions) {
		const {docname, type, options} = opts || <PrintOptions>{};
		return new Promise((resolve, reject) => {
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
	printDirect(data, opts?: PrintOptions) {
		return this.print(data, opts);
	}

	async printFile(file, options) {
		const jobId = await lp.printFile(this, file, options);
		return this._addJob(jobId);
	}
}
