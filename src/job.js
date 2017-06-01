'use strict';

const debug = require('debug')('npus:job');
const _ = require('lodash');
const assert = require('assert');
const events = require('events');
const libcups = require('printer');
const arrify = require('arrify');

const schedule = require('./utils').schedule;

const EVENTS = ['status', 'printed', 'cancelled', 'complete'];

class Job extends events.EventEmitter {

	constructor(printer, idOrDescriptor) {
		super();
		this._printer = printer;

		this._forwardEvents();

		let descriptor;
		if (typeof idOrDescriptor === 'object') {
			this.id = idOrDescriptor.id;
			descriptor = idOrDescriptor;
		} else {
			this.id = idOrDescriptor;
		}

		this.fullid = `${printer.name}-${this.id}`;
		this.update(descriptor);
		// this._schedule = schedule(500, () => this.update());
	}

	get descriptor() {
		return this._descriptor;
	}

	_forwardEvents() {
		EVENTS.map(e => this._forwardEvent(e));
	}

	_unforwardEvents() {
		EVENTS.map(e => this._unforwardEvent(e));
	}

	_forwardEvent(name) {
		this._eventHandlers = this._eventHandlers || {};
		if (!this._eventHandlers[name]) {
			const printer = this._printer;
			this._eventHandlers[name] = function () {
				printer.emit(`job:${name}`, this, ...arguments);
			};
			this.on(name, this._eventHandlers[name]);
		}
	}

	_unforwardEvent(name) {
		if (this._eventHandlers && this._eventHandlers[name]) {
			this.removeListener(name, this._eventHandlers[name]);
			delete this._eventHandlers[name];
		}
	}

	get status() {
		return this._descriptor ? this._descriptor.status : 'Unknown';
	}

	update(descriptor) {
		if (!descriptor && this._lastUpdate && this._lastUpdate + 50 > Date.now()) {
			return;
		}

		this._lastUpdate = Date.now();

		descriptor = descriptor || this.fetchDescriptor();

		if (!this._descriptor || !_.isEqual(this._descriptor, descriptor)) {
			debug(`Job "${this.fullid}" status "${getStatus(descriptor)}"`);
			this._descriptor = descriptor;
			this.emit('status', descriptor.status, descriptor, this);

			if (this.is('PRINTED')) {
				debug(`Job "${this.fullid}" printed`);
				this.emit('printed');
			}

			if (this.is('CANCELLED')) {
				debug(`Job "${this.fullid}" cancelled`);
				this.emit('cancelled');
			}

			if (this.is('PRINTED') || this.is('CANCELLED')) {
				debug(`Job "${this.fullid}" complete`);
				this.completed = true;
				this.emit('complete');
				this._unforwardEvents();
				// this._schedule.cancel();
			}
		}
	}

	is(status) {
		const currentStatus = arrify(this._descriptor && this._descriptor.status);
		if (!currentStatus.length) {
			return false;
		}
		return currentStatus.includes(status && status.toUpperCase());
	}

	fetchDescriptor() {
		return libcups.getJob(this._printer.name, this.id);
	}

	perform(action) {
		assert(typeof action === 'string', 'String "action" is required');
		return libcups.setJob(this._printer.name, this.id, action.toUpperCase());
	}

	cancel() {
		return this.perform('cancel');
	}
}

function getStatus(descriptor) {
	return descriptor ? descriptor.status: 'N/A' ;
}

module.exports = Job;
