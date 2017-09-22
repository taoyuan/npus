'use strict';

const npus = require('..');

const printers = npus.list({simple: true});
console.log(JSON.stringify(printers, null, 2));
