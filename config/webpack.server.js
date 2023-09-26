const path = require('path');

// required webpack plugins
/**
 * @note
 * we need MiniCSSExtractPlugin plugin on server-side for CSS modules
 * as these modules work with dynamically generated, hashed
 * CSS element selectors, we need them to be parsed on server-side to place
 * the right selectors in the JSX of the components
 */
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

/**
 * this webpack configuration is to support bundling on the server-side
 * as we are working with ES6 imports and other new JS syntaxes, we
 * need support for transpiling and as SSR is enabled on the server, we
 * need to deal with the React code
 * 
 * for more refs visit the client side webpack configuration file
 */

module.exports = (env) => {
	return {
		entry: {
			'www': './server/prod'
		},
		/**
		 * decide the mode of compilation based on the 'dev' env passed from command
		 */
		mode: env.dev ? 'development' : 'production',
		output: {
			path: path.resolve(__dirname, '../', '.bin'),
			filename: '[name]',
			clean: true
		},
		target: 'node',
		module: {
			rules: [
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
						}
					]
				},
				/**
				 * files other than JS are scanned while building the server JS
				 * 
				 * to support these format so that the bundling of server doesn't break
				 * we added these rules
				 */
				{
					test: /\.scss$/,
					/**
					 * ignore bundling regular CSS code for server
					 */
					use: 'ignore-loader',
					exclude: /\.module\.scss$/
				},
				{
					test: /\.module\.scss$/,
					/**
					 * @note
					 * we need the CSS modules to be parsed on server-side unlike the regular CSS
					 * 
					 * regular CSS has hardcoded element selectors in the stylesheets
					 * and are referenced in hardcoded format in JSX of the components
					 * e.g. <div id="hardCodedId" className="hardCodedClassValue"></div>
					 * 
					 * CSS modules are used when we hash the selector references
					 * and access them in the JSX via the 'styles' object
					 * hence, these selectors need to be parsed not only for client-side
					 * but also for server-side, as the server-side rendered HTML
					 * should be having the respective hashed selectors
					 * 
					 * Note that the bundling config is the same as used on client side
					 */
					use: [
						MiniCSSExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								modules: {
									localIdentName: '[hash:base64:7]'
								}
							}
						},
						'sass-loader'
					]
				},
				// we need not parse CSS and font scripts for server-side build generation
				{
					test: /\.css$/,
					use: 'ignore-loader'
				},
				{ 
					test: /\.(eot|svg|ttf|woff|woff2)$/, 
					use: 'ignore-loader'
				}
			]
		},
		plugins: [
			new MiniCSSExtractPlugin({
				filename: 'styles/[name].[contenthash].css',
			}),
		]
	};
}
