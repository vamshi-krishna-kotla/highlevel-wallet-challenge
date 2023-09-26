/**
 * the express app to create a http server to serve the application
 */

// require the needed modules
const express = require('express');

// require routes and handler for webpack output
const { scriptRoutes, pageRoutes } = require('../routes');
const { scriptsResponseFunction, pageResponseFunction } = require('./helper');

// instantiate server object
const app = express();

/**
 * use express JSON middleware to support
 * JSON communication between server and client
 */
app.use(express.json());

// set the handler up for webpack output
scriptRoutes.forEach(route => {
	app.get(route, scriptsResponseFunction);
});

// set the handler for UI routes
pageRoutes.forEach(route => {
	app.get(route, pageResponseFunction);
});

// export the express server
module.exports.app = app;
