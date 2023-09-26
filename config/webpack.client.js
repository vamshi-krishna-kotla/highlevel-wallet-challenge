const path = require('path');

/**
 * required webpack plugins
 */
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

/**
 * 
 * @param {*} env : passed from webpack command from terminal
 * 
 * the parent webpack.config.js calls with the env variables
 * that it gets from terminal
 */
module.exports = (env) => {
	/**
	 * store the config object in an object
	 * to manipulate required params based on env
	 */
	let webpackConfig = {
		entry: {
			/**
			 * entry paths are hardcoded and need not be relative
			 * to the current 'config' directory as these will be considered
			 * as they are from the root webpack.config.js
			 */
			main: './src/index.js'
		},
		/**
		 * decide the mode of compilation based on the 'dev' env passed from command
		 */
		mode: env.dev ? 'development' : 'production',
		output: {
			/**
			 * cannot hardcode the output path as it takes the
			 * entire path to the target folder via the 'path'
			 * dependency
			 * 
			 * this needs to be pointing to the root directory
			 * and hence is relative from the current directory
			 */
			path: path.resolve(__dirname, '../', 'dist'),
			/**
			 * generate contenthash only on production mode
			 */
			filename: env.dev ? 'scripts/[name].js' : 'scripts/[name].[contenthash].js',
			/**
			 * cleans the content of the output folder before new build
			 * without using webpack clean plugin
			 */
			clean: true,
			/**
			 * configures the public path, i.e., path from server to serve static assets
			 * 
			 * the path which is set in the template generated by webpack (via html-webpack-plugin)
			 * depends on this attribute
			 * 
			 * used to set the reference path for static files (assets) to be loaded from
			 * the root path
			 */
			publicPath: '/'
		},
		/**
		 * specifies the target JS build grammar
		 */
		target: 'web',
		module: {
			rules: [
				// rule to parse scripts and components
				{
					test: /\.(js|jsx)$/,
					exclude: /node_modules/,
					use: [
						{
							/**
							 * takes the presets and plugins options from
							 * babel.config.js
							 */
							loader: 'babel-loader',
						}
					]
				},
				{
					test: /\.scss$/,
					/**
					 * 
					 * @param {Object} param as 'resource'
					 * destructuring the 'resource' key from the config object
					 * as it is used for setting further loader configuration
					 * 
					 * @returns appropriate loader configuration object
					 * with options that work for CSS modules and direct CSS imports
					 * 
					 * @note the 'use' property is set up by default to work for developement mode here
					 * production mode configuration is applied when this property is overwritten
					 * based on the env.dev value
					 */
					use: ({ resource }) => {
						/**
						 * flag that is set based on the (SCSS) file, if it is
						 * a '<name>.module.scss' or '<name>.scss', based on the usage for
						 * CSS modules
						 */
						let isCssModuleFile = /.*\.module\.scss$/.test(resource);

						return [
							{
								/**
								 * - use 'style-loader' to append styles to HTML
								 * 	using style tag (easy for dev)
								 * 
								 */
								loader: 'style-loader',
							},
							{
								// loader to convert SCSS to CSS
								loader: 'css-loader',
								/**
								 * we are using a function to return the loader configuration
								 * hence we need a unique identification for the 'options' object
								 * which is passed to the loader
								 * this has to be passed to the 'ident' key
								 * i.e., { loader, options, ident } have to be used
								 * 
								 * setting a different 'ident' value based on the 'isCssModuleFile' flag
								 * as the 'ident' key should be unique for each set of options
								 */
								ident: isCssModuleFile ? 'css_module' : 'non_css_module',
								/**
								 * conditionally setting the options object based on the 'isCssModuleFile' flag
								 * appropriate options are passed for files used for CSS modules
								 */
								options: isCssModuleFile ? {
									// set the modules property if the styles are used as CSS modules
									modules: {
										/**
										 * specify the format of identifiers (classNames or IDs)
										 * 
										 * <name-of-file>__<className>__<base64-number-with-specified-digits>
										 * e.g.: .Info-module__info___1ClHo
										 * 
										 * if not mentioned then a random hash will be generated
										 */
										localIdentName: '[name]__[local]___[hash:base64:5]'
									}
								} :
									// pass empty 'options' object for styles used normally, unlike CSS modules
									{}
							},
							// loader to parse through SCSS code
							'sass-loader'
						]
					}
				},
				// rule to parse CSS files
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader']
				},
				// rules to parse font files
				{ 
					test: /\.(eot|svg|ttf|woff|woff2)$/, 
					use: 'url-loader?name=[name].[ext]'
				}
			]
		},
		plugins: [
			// add CSS plugin to generate bundled styles
			new MiniCSSExtractPlugin({
				filename: 'styles/[name].[contenthash].css',
			}),
			// generate HTML and include required chunks
			new HTMLWebpackPlugin({
				minify: false,
				template: './index.html',
				filename: 'index.html'
			}),
		],
	}

	// modifying the configuration based on environment
	if (!env.dev) {
		// entering this block implies compilation is in PRODUCTION mode

		/**
		 * in production mode we need to use the MiniCSSExtractPlugin
		 * to load CSS onto the page
		 * 
		 * MiniCSSExtractPlugin.loader isn't supporting the 'ident' option
		 * hence we can NOT conditionally pass the CSS modules options
		 * 
		 * to avoid the error using MiniCSSExtractPlugin in production mode
		 * 1. exclude the compilation of <name>.module.scss in /\.scss$/ rule
		 * 	- avoid compiling CSS modules in base SCSS rule
		 * 2. overwrite the 'use' set-up (which are configured for development environment by default)
		 * 	- replace the 'use' property with an object supported for production mode for CSS
		 * 3. add a new rule to compile the <name>.module.scss to the config
		 * 	- compile the CSS modules, avoided by base SCSS rule, with right
		 * 	'modules' options
		 */
		webpackConfig.module.rules[1]['exclude'] = /\.module\.scss$/;
		webpackConfig.module.rules[1]['use'] = [
			MiniCSSExtractPlugin.loader,
			'css-loader',
			'sass-loader'
		];
		webpackConfig.module.rules.push({
			test: /\.module\.scss$/,
			use: [
				/**
				 * - use MiniCSSExtractPlugin to generate new CSS files for production
				 */
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
		});
	}
	return webpackConfig;
}