'use strict';

const _ = require('lodash');
const libcups = require('printer');

class Job {
	constructor(printer, id) {
		this.printer = printer;
		this.id = id;
	}

	descriptor() {
		return libcups.getJob(this.printer.name, this.id);
	}

	perform(action) {
		return libcups.setJob(this.printer.name, this.id, _.upperCase(action));
	}

	cancel() {
		return this.perform('cancel');
	}
}

module.exports = Job;
