/**
 * required server-side dependencies
 */
import express from 'express';
import path from 'path';

// import required routes to be served
import { pageRoutes } from '../routes.js';
// import required helper methods
import { pageResponseHandler } from './helper.js';

// initialize express server
export const app = express();

/**
 * use express JSON middleware to support
 * JSON format data exchange
 */
app.use(express.json());

// set handlers for UI routes
pageRoutes.forEach(route => {
	app.get(route, pageResponseHandler);
});

/**
 * use express static middleware to serve content from
 * dist/ folder directly to the client
 */
app.use(express.static(path.resolve(__dirname, '../dist')));
