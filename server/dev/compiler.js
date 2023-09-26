/**
 * webpack compiler bundles the scripts from multiple files
 * and generates the final output based on given configuration
 */

// require the needed modules
const webpack = require('webpack');

/**
 * memory file-system to read and write like files in memory instead of actual files
 * this helps in avoiding creation and writing into file(s) unnecessarily
 */
const { fs } = require('memfs');

// read webpack config function
const webpackConfigFunction = require('../../webpack.config');

// generate client-side development webpack configuration
const clientConfig = webpackConfigFunction({ dev: true, BUILD_ENV: 'client' });

// instantiate webpack compiler object with client bundle configuration
const compiler = webpack(clientConfig);

// set the file-system for the compiler as the memfs instance
compiler.outputFileSystem = fs;

// export the webpack compiler
module.exports.compiler = compiler;
