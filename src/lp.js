const spawn = require('child_process').spawn;
const _ = require('lodash');
const errs = require('errs');
const PromiseA = require('bluebird');

/**
 * Describes the parameter options accepted by lp
 *
 * options array specifies the valid option names for the option
 * if expects is blank '' no option value is required for the option
 *
 * This was written according to lp man page
 * http://unixhelp.ed.ac.uk/CGI/man-cgi?lp
 */
const generalOptions = {
	'E': {
		'options': ['E', 'encryption'],
		'description': 'Forces encryption when connecting to the server',
		'expects': '',
		'default': false
	},
	'U': {
		'options': ['U', 'Username', 'username'],
		'description': 'Specifies the username to use when connecting to the server',
		'expects': 'string'
	},
	'c': {
		'options': ['c', 'backwardsCompatibility'],
		'description': 'This option is provided for backwards-compatibility only. On systems  that	support	 it,  this  option forces the print file to be copied to the spool directory before  printing. In CUPS, print files  are always sent to the scheduler via IPP which has the same effect.',
		'expects': '',
		'default': false
	},
	'd': {
		'options': ['d', 'destination'],
		'description': 'Prints files to the named printer',
		'expects': 'string'
	},
	'h': {
		'options': ['h', 'hostname'],
		'description': 'Chooses an alternate server',
		'expects': 'string'
	},
	'i': {
		'options': ['i', 'job-id'],
		'description': 'Specifies an existing job to modify',
		'expects': 'number'
	},
	'm': {
		'options': ['m'],
		'description': 'Sends an email when the job is completed',
		'expects': ''
	},
	'n': {
		'options': ['n', 'copies', 'numCopies'],
		'description': 'Sets the number of copies to print from 1 to 100',
		'expects': 'number',
		'default': 1
	},
	'o': {
		'options': ['o'],
		'description': '"name=value [name=value ...]" Sets one or more job options',
		'expects': 'string',
		'default': ''
	},
	'q': {
		'options': ['q', 'priority'],
		'description': 'Sets the job priority from	1 (lowest) to 100 (highest). The default priority is 50',
		'expects': 'number',
		'default': 1
	},
	's': {
		'options': ['s'],
		'description': 'Do not report the resulting job IDs (silent mode.)',
		'expects': ''
	},
	't': {
		'options': ['t', 'name'],
		'description': 'Sets the job name',
		'expects': 'string'
	},
	'H': {
		'options': ['H', 'when'],
		'description': 'Specifies  when  the  job  should be printed. A value of immediate will print the file immediately, a value of hold will hold the job indefinitely, and a time value (HH:MM) will hold the job until the specified time. Use a value of resume with the -i option to resume a  held job.  Use a value of restart with the -i option to restart a completed job.',
		'default': 'immediate',
		'expects': 'string'

	},
	'P': {
		'options': ['P', 'page-list'],
		'description': 'page-list Specifies which pages to print in the document. The list can  contain a list of numbers and ranges (#-#) separated by commas (e.g. 1,3-5,16).',
		'expects': 'string'
	}
};

/**
 * Describes the parameter options accepted by lp -o option
 *
 * options array specifies the valid option names for the option
 * if expects is blank '' no option value is required for the option
 *
 * This was written according to lp man page
 * http://unixhelp.ed.ac.uk/CGI/man-cgi?lp
 */
const oOptions = {
	'media': {
		'options': ['media'],
		'description': 'Sets  the  page  size  to size. Most printers support at least the size names "a4", "letter", and "legal".',
		'expects': 'string',
		'default': 'a4'
	},
	'landscape': {
		'options': ['landscape'],
		'description': 'landscape',
		'expects': ''
	},
	'orientation-requested': {
		'options': ['orientation-requested'],
		'description': '',
		'expects': 'number'
	},
	'sides': {
		'options': ['sides'],
		'description': 'Prints on one or two sides of the  paper.  The  value  "two-sided-long-edge" is  normally  used  when printing portrait (unrotated) pages, while "two-sided-short-edge" is used for landscape pages.',
		'expects': 'string'
	},
	'fitplot': {
		'options': ['fitplot'],
		'description': 'Scales the print file to fit on the page',
		'expects': '',
		'default': false
	},
	'scaling': {
		'options': ['scaling'],
		'description': 'Scales image files to use up to number percent of the page. Values greater than 100 cause the image file to be printed across multiple pages',
		'expects': 'number'
	},
	'cpi': {
		'options': ['cpi'],
		'description': 'Sets the number of characters per inch to use when printing a text file. The default is 10',
		'expects': 'number'
	},
	'lpi': {
		'options': ['lpi'],
		'description': 'Sets  the  number  of  lines  per inch to use when printing a text file. The default is 6',
		'expects': 'number'
	},
	'page-bottom': {
		'options': ['page-bottom'],
		'description': 'Sets the page margins when printing text files. The values are in points - there are 72 points to the inch',
		'expects': 'number'
	},
	'page-left': {
		'options': ['page-left'],
		'description': 'Sets the page margins when printing text files. The values are in points - there are 72 points to the inch',
		'expects': 'number'
	},
	'page-right': {
		'options': ['page-right'],
		'description': 'Sets the page margins when printing text files. The values are in points - there are 72 points to the inch',
		'expects': 'number'
	},
	'page-top': {
		'options': ['page-top'],
		'description': 'Sets the page margins when printing text files. The values are in points - there are 72 points to the inch',
		'expects': 'number'
	}
};

const optionsFactory = function (options) {

	const selGeneralOptions = {};

	_.forEach(generalOptions, function (generalOption, generalOptionId) { // for each of lp available options
		_.forEach(generalOption.options, function (option) { // for each option possible name
			if (typeof options[option] !== 'undefined') { // check of the method options contains the value
				if (generalOption.expects === '') { // when expects is empty, ommit the options defined value, just add
					if (options[option]) {
						selGeneralOptions[generalOptionId] = true;
					}
				} else {
					selGeneralOptions[generalOptionId] = options[option];
				}
			}
		});
		if (typeof generalOption.default !== 'undefined') { // if method options does not contains the value, use default if available
			if (typeof selGeneralOptions[generalOptionId] === 'undefined') {
				selGeneralOptions[generalOptionId] = generalOption.default;
			}
		}
	});

	const selOOptions = {};

	_.forEach(oOptions, function (oOption, oOptionId) { // for each of lp available options
		_.forEach(oOption.options, function (option) { // for each option possible name
			if (typeof options[option] !== 'undefined') { // check of the method options contains the value
				if (oOption.expects === '') { // when expects is empty, ommit the options defined value, just add
					if (options[option]) {
						selOOptions[oOptionId] = true;
					}
				} else {
					selOOptions[oOptionId] = options[option];
				}
			} else if (typeof oOption.default !== 'undefined') { // if method options does not contains the value, use default if available
				selOOptions[oOptionId] = oOption.default;
			}
		});
		if (typeof oOption.default !== 'undefined') { // if method options does not contains the value, use default if available
			if (typeof selOOptions[oOptionId] === 'undefined') {
				selOOptions[oOptionId] = oOption.default;
			}
		}
	});

	if (!_.isEmpty(selOOptions)) {
		let selOoptionsString = '';
		_.forEach(selOOptions, function (oOption, oOptionId) {
			if (oOptions[oOptionId].expects === '') {
				if (oOption) {
					selOoptionsString = selOoptionsString + ' ' + oOptionId;
				}
			} else {
				selOoptionsString = selOoptionsString + ' ' + oOptionId + '=' + oOption;
			}
		});
		if (typeof selGeneralOptions.o === 'string') {
			selGeneralOptions.o = selGeneralOptions.o + selOoptionsString;
		} else {
			selGeneralOptions.o = selOoptionsString;
		}
	}

	return selGeneralOptions;
};

const argsFactory = function (options) {
	const args = [];
	_.forEach(options, function (optionValue, optionKey) {
		if (generalOptions[optionKey].expects === '') {
			if (optionValue) {
				args.push('-' + optionKey);
			}
		} else {
			args.push('-' + optionKey + optionValue);
		}

	});
	return args;
};

const buildArgs = function (options) {
	if (!options) return [];
	options = optionsFactory(options);
	return argsFactory(options);
};


exports.printBuffer = (printer, data, options) => {
	const name = _.isString(printer) ? printer : printer.name;
	const args = buildArgs(options);
	args.push('-d', name);

	const lp = spawn('lp', args);
	lp.stdin.write(data);
	lp.stdin.end();

	return new PromiseA((resolve, reject) => {
		let error, jobId;
		lp.stderr.once('data', function(data) {
			error = data.slice(0, data.length - 1);
		});

		lp.stdout.once('data', function(data) {
			jobId = parseInt(data
				.toString()
				.match(/^request id is .*-(\d+)/)[1]);
		});

		lp.once('exit', function(code) {
			if (0 === code) {
				resolve(jobId);
			}
			else {
				reject(errs.create({
					message: error,
					code: 500
				}));
			}
		});
	});
};

exports.printFile = (printer, file, options) => {
	const name = _.isString(printer) ? printer : printer.name;
	const args = buildArgs(options);
	args.push('-d', name);

	args.push('--');
	args.push(file);

	const lp = spawn('lp', args);

	return new PromiseA((resolve, reject) => {
		let error, jobId;
		lp.stderr.once('data', function(data) {
			error = data.slice(0, data.length - 1);
		});

		lp.stdout.once('data', function(data) {
			jobId = parseInt(data
				.toString()
				.match(/^request id is .*-(\d+)/)[1]);
		});

		lp.once('exit', function(code) {
			if (0 === code) {
				resolve(jobId);
			}
			else {
				reject(errs.create({
					message: error,
					code: 500
				}));
			}
		});
	});
};
