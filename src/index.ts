/**
 * npus
 *
 * Copyright © 2017 Yuan Tao. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import * as arrify from 'arrify';
import * as libcups from 'printer';
import {Manager, ManagerOptions} from "./manager";
import {Printer} from "./printer";

export * from './job';
export * from './printer';
export * from './manager';

export function createManager(opts?: ManagerOptions) {
	return new Manager(opts);
}

/**
 * List printers
 */
export interface ListOptions {
	simple?: boolean;
}

export function list(opts?: ListOptions) {
	opts = opts || {};
	const descriptors = arrify(libcups.getPrinters());
	descriptors.forEach(d => d.asPrinter = () => new Printer(d));
	if (opts.simple) {
		return descriptors;
	}
	return descriptors.map(d => d.asPrinter());
}

export const listPrinters = list;
export const getPrinters = list;

/**
 * Return user defined printer, according to https://www.cups.org/documentation.php/doc-2.0/api-cups.html#cupsGetDefault2 :
 * "Applications should use the cupsGetDests and cupsGetDest functions to get the user-defined default printer,
 * as this function does not support the lpoptions-defined default printer"
 */
export const getDefaultPrinterName = libcups.getDefaultPrinterName;
export const defaultPrinterName = libcups.getDefaultPrinterName;

/**
 * Get supported print format for printDirect
 */
export const getSupportedPrintFormats = libcups.getSupportedPrintFormats;
export const supportedPrintFormats = libcups.getSupportedPrintFormats;

/**
 * Get possible job command for setJob. It depends on os.
 * @return Array of string. e.g.: DELETE, PAUSE, RESUME
 */
export const getSupportedJobCommands = libcups.getSupportedJobCommands;
export const supportedJobCommands = libcups.getSupportedJobCommands;


/** Find printer info with jobs
 * @param {String} [name] printer name to extract the info
 * @return {Printer}
 *    TODO: to enum all possible attributes
 */
export function findPrinter(name?: string): Printer {
	name = name || getDefaultPrinterName();
	if (name) {
		const descriptor = libcups.getPrinter(name);
		if (descriptor) {
			return new Printer(descriptor);
		}
	}
	return list()[0];
}

export function getPrinter(name?: string): Printer {
	const printer = findPrinter(name);
	if (!printer) {
		throw new Error(`Not found printer "${name}"`);
	}
	return printer;
}
