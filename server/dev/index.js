/**
 * this is the development server where the client-side code is
 * compiled immediately when the files' content changes
 * 
 * @note a reload is required on the frontend to load the new updated files
 * 
 */

// require webpack compiler
const { compiler } = require('./compiler');

// require express server
const { app } = require('./server');

// require database instance and helper methods to set the server up
const { initDatabaseConnection, database, serverCloseHandler } = require('../database');

// instantiate the PORT to host the app, read from environment variables
const PORT = process.env.PORT || 3000;

/**
 * start webpack watcher
 * @note webpack watch will compile the code every time the content changes
 */
const watcher = compiler.watch({
	aggregateTimeout: 500,
	ignored: /node_modules/
}, (err, stats) => {
	if (err) {
		console.log(err);
	} else {
		console.log(stats.toString({ colors: true }));
	}
});

// initialize the server with database connection
initDatabaseConnection(app);

// start the server
const server = app.listen(PORT, () => {
	console.log(`Dev server running on http://localhost:${PORT}`);
});

/**
 * close the server when the process stops
 * 
 * refer https://blog.heroku.com/best-practices-nodejs-errors
 */
process.on('SIGINT', serverCloseHandler(server, database));
