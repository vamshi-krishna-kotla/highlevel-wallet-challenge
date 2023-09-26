
/**
 * 
 * @param {*} env : passed from webpack command from terminal
 * 
 * ref: https://webpack.js.org/guides/environment-variables/
 * 
 * @returns the final webpack config object based on "--env" params
 */
module.exports = (env) => {
	/**
	 * conditionally selecting the configuration
	 * for the client or server via the BUILD_ENV env variable
	 * passed from terminal to the webpack command
	 * 
	 * the specific config files export a function which takes the "env"
	 * as parameter, hence requiring the specific function and calling
	 * with the same "env" parameter to return the final config object
	 */
	if(env.BUILD_ENV === 'server') {
		return require('./config/webpack.server.js')(env);
	}
	return require('./config/webpack.client.js')(env);
}
