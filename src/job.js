'use strict';

const _ = require('lodash');
const assert = require('assert');
const {EventEmitter} = require('events');
const libcups = require('printer');
const arrify = require('arrify');

const utils = require('./utils');

class Job extends EventEmitter {

	constructor(printer, id) {
		super();
		this.printer = printer;
		this.id = id;

		this._schedule = utils.schedule(500, () => this._update());
		this._update();
	}

	_update() {
		const descriptor = this.update();

		if (!this.descriptor || !_.isEqual(this.descriptor, descriptor)) {
			this.desciptor = descriptor;
			this.emit('status', descriptor.status, descriptor, this);

			if (this.is('PRINTED')) {
				this.emit('printed');
			}

			if (this.is('CANCELLED')) {
				this.emit('cancelled');
			}

			if (this.is('PRINTED') || this.is('CANCELLED')) {
				this.completed = true;
				this.emit('complete');
				this._schedule.cancel();
			}
		}
	}

	is(status) {
		const currentStatus = arrify(this.desciptor && this.desciptor.status);
		if (!currentStatus.length) {
			return false;
		}
		return currentStatus.includes(status && status.toUpperCase());
	}

	update() {
		return libcups.getJob(this.printer.name, this.id);
	}

	perform(action) {
		assert(typeof action === 'string', 'String "action" is required');
		return libcups.setJob(this.printer.name, this.id, action.toUpperCase());
	}

	cancel() {
		return this.perform('cancel');
	}
}

module.exports = Job;
