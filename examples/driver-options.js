const npus = require("..");
const util = require('util');
const printers = npus.list();

printers.forEach(printer => {
	console.log('--------------');
	console.log('ppd for printer "' + printer.name + '":' + util.inspect(printer.getDriverOptions(), {
			colors: true,
			depth: 10
		}));
	console.log('\tselected page size:' + printer.getSelectedPaperSize() + '\n');
	console.log();
});
