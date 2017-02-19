const npus = require("..");
const util = require('util');
console.log("supported formats are:\n" + util.inspect(npus.getSupportedPrintFormats(), {colors: true, depth: 10}));
