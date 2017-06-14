# npus

[![NPM version](http://img.shields.io/npm/v/npus.svg?style=flat-square)](https://www.npmjs.com/package/npus)
[![NPM downloads](http://img.shields.io/npm/dm/npus.svg?style=flat-square)](https://www.npmjs.com/package/npus)
[![Build Status](http://img.shields.io/travis/taoyuan/npus/master.svg?style=flat-square)](https://travis-ci.org/taoyuan/npus)
[![Coverage Status](https://img.shields.io/coveralls/taoyuan/npus.svg?style=flat-square)](https://coveralls.io/taoyuan/npus)

> A node printing utils

### How to Install

```sh
$ npm install --save npus
```

### About `out of paper`

`cups` use printer option to report printer options and state include `paper` state. 
The detail information about printer include paper, marker and toner is [here](https://www.cups.org/doc/api-filter.html#MESSAGES)

Example of `paper out` state when start printing.

```json
{
"printer-state-reasons": "media-empty-warning,media-empty-report"
}
```

and

```json
{
"printer-state-reasons": "media-empty-warning,media-empty-error,media-needed"
}
```

After fulfilled paper, the `printer-state-reasons` become:

```json
{
"printer-state-reasons": "none"
}
```

### Reference

* Printer Management [pliigo-cups-agent](https://bitbucket.org/joeherold/pliigo-cups-agent)

### License

MIT © [Yuan Tao]()
