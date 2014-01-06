var fs = require('fs'),
    path = require('path'),
    nconf = require('nconf');

var configPath = path.join(__dirname, '/../config/');
/**
 * Setup nconf to use (in-order):
 *  1. Command-line arguments
 *  2. Environment variables
 *  3. A file located at 'path/to/config.json'
 */
nconf.argv()
     .env()
 
// Read default config
nconf.file({ file: path.join(configPath, 'default.json') });

module.exports = nconf;