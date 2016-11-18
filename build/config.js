const path = require('path');
const buble = require('rollup-plugin-buble');
const version = process.env.VERSION || require('../package.json').version;

const banner =
`/*
 * bowl.js v${version}
 * (c) 2016-${new Date().getFullYear()} classicemi
 * Released under the MIT license.
 */`;

const configs = {
  'dev': {
    entry: path.resolve(__dirname, '../src/index.js'),
    dest: path.resolve(__dirname, '../test/e2e/bowl.js'),
    format: 'umd',
    banner,
    moduleName: 'Bowl',
    plugins: [
      buble()
    ]
  },
  'production': {
    entry: path.resolve(__dirname, '../src/index.js'),
    dest: path.resolve(__dirname, '../lib/bowl.js'),
    format: 'umd',
    banner,
    moduleName: 'Bowl',
    plugins: [
      buble()
    ]
  }
};

if (process.env.TARGET) {
  module.exports = configs[process.env.TARGET];
} else {
  module.exports = configs['production'];
}
