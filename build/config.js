const path = require('path');
const buble = require('rollup-plugin-buble');
const version = require('../package.json').version

const banner =
`/*
 * bowl.js v${version}
 * (c) 2016-${new Date().getFullYear()} classicemi
 * Released under the MIT license.
 */`;

const config = {
  entry: path.resolve(__dirname, '../src/index.js'),
  dest: path.resolve(__dirname, '../lib/bowl.js'),
  format: 'umd',
  banner,
  moduleName: 'bowl',
  plugins: [
    buble()
  ]
};

module.exports = config;

