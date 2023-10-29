// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlBundlerPlugin = require('html-bundler-webpack-plugin');
const Handlebars = require('handlebars');

const AlgorithmsConfig = require('./src/sortsConfig');

const isProduction = process.env.NODE_ENV == 'production';



const htmlBundlerPluginConfig = {
    entry: {
        // define HTML files here
        
        index: {
            import: "src/index.html",
            data: {
                algorithms: [ ]
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

// Data for index template
htmlBundlerPluginConfig.entry.index.data.algorithms = AlgorithmsConfig.algorithms;

// Data for individual simulator pages
AlgorithmsConfig.algorithms.forEach(algorithm => {
    let data = {};

    AlgorithmsConfig.keys.forEach(property => {
        data[property] = algorithm[property]
    });
    
    htmlBundlerPluginConfig.entry[algorithm.nameMachine] = {
        import: 'src/simulator.html',
        data: data
    };
});



const config = {
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
        host: 'localhost',
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
                    preprocessor: (content, {data}) => Handlebars.compile(content)(data)
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
                use: ['css-loader', 'sass-loader'],
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



module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        
    } else {
        config.mode = 'development';
        config.devtool = 'inline-source-map';
    }

    return config;
};
