/**
 * npus
 *
 * Copyright © 2017 Yuan Tao. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import {EventEmitter} from 'events';

import * as _ from 'lodash';
import * as arrify from 'arrify';
import * as libcups from 'printer';
import {Printer, PrinterDescriptor} from './printer';

export interface PrinterHolder {
	printer: Printer;
	created?: number;
	updated?: number;
	heartbeat?: number;
}

export interface ManagerOptions {
	autoStart?: boolean;
	loopInterval?: number;
}

export class Manager extends EventEmitter {

	_holders: {[name: string]: PrinterHolder};
	_loopInterval: number;
	_loopTimer: any;

	_looping: boolean;

	defaultPrinter: Printer | null;

	constructor(opts?: ManagerOptions) {
		super();
		opts = opts || {};
		this._holders = {};
		this._loopInterval = opts.loopInterval || 2000;
		if (opts.autoStart === false) {
			this.start();
		}
	}

	get holders() {
		return this._holders;
	}

	start() {
		if (this._looping) {
			return;
		}
		this._looping = true;
		process.nextTick(() => this._loop());
	}

	stop() {
		if (!this._looping) {
			return;
		}
		this._looping = false;

		if (this._loopTimer) {
			clearTimeout(this._loopTimer);
			this._loopTimer = null;
		}
	}

	_check() {
		const descriptors: PrinterDescriptor[] = <PrinterDescriptor[]>arrify(libcups.getPrinters());
		const ts = Date.now();

		_.forEach(descriptors, d => {
			let h = this._holders[d.name];
			if (!h) {
				h = this._holders[d.name] = {printer: new Printer(d)};
				h.created = h.updated = ts;
				this.emit('added', h.printer);
			}

			if (!_.isEqual(d, h.printer.descriptor)) {
				h.printer.update(d);
				h.updated = ts;
				this.emit('updated', h.printer);
			}

			h.heartbeat = ts;

			if (d.isDefault) {
				this.defaultPrinter = h.printer;
			}

		});

		// delete all removed printer
		_.forEach(this._holders, (h, name) => {
			if (h.heartbeat !== ts) {
				if (this.defaultPrinter === h.printer) {
					this.defaultPrinter = null;
				}
				delete this._holders[name];
				this.emit('deleted', h.printer);
			}
		});
	}

	_loop() {
		if (this._loopTimer) {
			clearTimeout(this._loopTimer);
			this._loopTimer = null;
		}

		this._check();

		if (this._looping) {
			this._loopTimer = setTimeout(() => this._loop(), this._loopInterval);
		}
	}

	list() {
		this._check();
		return this._holders && Object.values(this._holders).map(h => h.printer);
	}

	get(name?: string) {
		this._check();
		if (name) {
			return this._holders[name] && this._holders[name].printer;
		}
		if (this.defaultPrinter) {
			return this.defaultPrinter;
		}
		const holders = Object.values(this._holders);
		if (holders.length) {
			return holders[0].printer;
		}
	}

}
