/**
 * this is the production server where static content
 * is server-side rendered
 */

// import express server
import { app } from './server';

// import database instance and helper methods to set the server up
import { database, initDatabaseConnection, serverCloseHandler } from '../database';

// instantiate the PORT to host the app, read from environment variables
const PORT = process.env.PORT || 8080;

// initialize the server with database connection
initDatabaseConnection(app);

// start the server
const server = app.listen(PORT, () => {
	console.log(`Server started on http://localhost:${PORT}/`);
});

/**
 * close the server when the process stops
 * 
 * refer https://blog.heroku.com/best-practices-nodejs-errors
 */
process.on('SIGINT', serverCloseHandler(server, database));
