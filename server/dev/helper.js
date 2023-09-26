// require the needed modules
const path = require('path');

/**
 * memory file-system to read and write like files in memory instead of actual files
 * this helps in avoiding creating and writing into files unnecessarily
 */
const { fs } = require('memfs');

/**
 * @description route handler function to send index HTML file to render the UI
 * 
 * @param {Object} req request object from client
 * @param {Object} res response object to client
 * 
 */
module.exports.pageResponseFunction = (req, res) => {
	// send the bundled index HTML file
	fs.readFile(path.resolve(__dirname, '../../dist/index.html'), 'utf8', (err, data) => {
		if (err) {
			res.status(500).send(err).end();
		}
		else {
			res.status(200).send(data);
		}
	});
};

/**
 * @description
 * route handler function to send output files that include
 * compiled JS file that have embedded CSS in them (using style-loader for dev env)
 * 
 * @param {Object} req request object from client
 * @param {Object} res response object to client
 * 
 */
module.exports.scriptsResponseFunction = (req, res) => {
	/**
	 * send the bundled JS file from memfs for scripts
	 */
	fs.readFile(path.resolve(__dirname, '../../dist/scripts/' + req.params.file), 'utf8', (err, data) => {
		if (err) {
			res.status(500).send(err).end();
		}
		else {
			res.status(200).send(data);
		}
	});
};
