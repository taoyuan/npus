const npus = require("..");

console.log('default printer name: ' + (npus.getDefaultPrinterName() || 'is not defined on your computer'));

