// Generated using webpack-cli https://github.com/webpack/webpack-cli

import webpack from 'webpack';
import 'webpack-dev-server';

import path from 'path';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';
import Handlebars from 'handlebars';

import sortFamilies from './src/sortsConfigs/sortFamilies';
import { getBooleanString, getComplexityOrComplexityRangeString } from './src/sortsConfigs/definitions/SortPropertyHelpers';


const isProduction = process.env.NODE_ENV == 'production';
const serveOnLocalHost: boolean = true;



const htmlBundlerPluginConfig: HtmlBundlerPlugin.PluginOptions = {
	entry: {
		// define HTML files here

		index: {
			import: "src/templates/index.html",
			data: {
				sortFamilies: sortFamilies
			}
		}
	},
	js: {
		// output filename of extracted JS
		filename: 'scripts/[name].js',
	},
	css: {
		// output filename of extracted CSS
		filename: 'styles/[name].css',
	},
};



// Data for individual simulator pages

// Type conversion EntryObject if entry was previously defined otherwise
if (htmlBundlerPluginConfig.entry == undefined)
	htmlBundlerPluginConfig.entry = {};
else if (typeof htmlBundlerPluginConfig.entry == "string") {
	const originalEntry = htmlBundlerPluginConfig.entry;
	htmlBundlerPluginConfig.entry = {};
	htmlBundlerPluginConfig.entry[originalEntry] = { import: originalEntry };
}

// Insert data
for (const sortFamily of sortFamilies) {
	for (const sort of sortFamily.sorts) {
		const urlPath = sort.nameMachine;

		if (htmlBundlerPluginConfig.entry instanceof Array) {
			htmlBundlerPluginConfig.entry.push({
				import: 'src/templates/simulator.html',
				filename: urlPath + '.html',
				data: sort
			});
		} else {
			htmlBundlerPluginConfig.entry[urlPath] = {
				import: 'src/templates/simulator.html',
				data: sort
			};
		}
	}
}



Handlebars.registerHelper('complexityString', getComplexityOrComplexityRangeString);
Handlebars.registerHelper('booleanString', getBooleanString);



const config: webpack.Configuration = {
	mode: isProduction ? 'production' : 'development',
	devtool: isProduction ? undefined : 'inline-source-map',
	output: {
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		compress: true,
		open: true,
		host: serveOnLocalHost ? 'localhost' : undefined,
		hot: true
	},
	plugins: [
		new HtmlBundlerPlugin(htmlBundlerPluginConfig),

		// Add your plugins here
		// Learn more about plugins from https://webpack.js.org/configuration/plugins/
	],
	module: {
		rules: [
			{   // HTML files
				test: /\.html$/,
				loader: HtmlBundlerPlugin.loader, // HTML template loader
				options: {
					preprocessor: (content: any, { data }: any) => Handlebars.compile(content)(data)
				}
			},
			{   // TypeScript files
				test: /\.(ts|tsx)$/i,
				loader: 'ts-loader',
				exclude: ['/node_modules/'],
			},
			{   // CSS files
				test: /\.css$/i,
				use: ['css-loader'],
			},
			{   // SASS files
				test: /\.s[ac]ss$/i,
				use: [
					'css-loader',
					{
						loader: 'sass-loader',
						options: {
							api: 'modern'
						}
					}
				],
			},
			{   // Assets
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: 'asset',
			},

			// Add your rules for custom modules here
			// Learn more about loaders from https://webpack.js.org/loaders/
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
	},
};

export default config;
