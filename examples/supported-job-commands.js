const npus = require("..");
const util = require('util');
console.log("supported job commands:\n" + util.inspect(npus.getSupportedJobCommands(), {colors: true, depth: 10}));
