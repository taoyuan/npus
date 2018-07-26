'use strict';

const m = require('..').createManager();

const printer = m.get();

printer.on('job:complete', () => {
	console.log('job complete');
	m.stop();
});

printer.on('job:status', (job, status) => {
	console.log(`job "${job.fullid}" status: ${status}`);
});

printer.print('Print from Node.JS buffer', {
	type: 'TEXT',	// type: RAW, TEXT, PDF, JPEG, .. depends on platform
	options: {
		copies: 2,
	}
}).catch(err => {
	console.error(err);
});

m.start();


