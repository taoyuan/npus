'use strict';

const npus = require('..');

const printers = npus.list();
console.log(JSON.stringify(printers, null, 2));
