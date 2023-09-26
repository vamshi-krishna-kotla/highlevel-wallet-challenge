// import required modules
import fs from 'fs';
import path from 'path';

/**
 * import React (client-side) support dependencies
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';

/**
 * import the application component
 */
import App from '../../src/App.jsx';

/**
 * @description
 * handler method to serve the application
 * with server-side rendered content
 * 
 * @param {Object} req request object from client
 * @param {Object} res response object to client
 */
export function pageResponseHandler(req, res) {
    fs.readFile(path.resolve(__dirname, '../dist/index.html'), 'utf8', (err, data) => {
        if (err) {
            res.status(500).send(err).end();
        }
        else {
            // add server-side rendered content into the output
            const response = data.replace('<div id="root"></div>', `<div id="root">
                ${renderToString(
                    <StaticRouter location={req.url} >
                        <App />
                    </StaticRouter>)
                    }
                </div>`);
            res.status(200).send(response);
        }
    });
};
