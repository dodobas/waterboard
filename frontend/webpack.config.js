/* global __dirname, require, module*/

const webpack = require('webpack');
//config.optimization.minimize

const path = require('path');
const env = 'dev'; // TODO

let LIBRARY_NAME = 'WBLib';

let plugins = [], outputFile;

if (env === 'build') {
    //plugins.push(new UglifyJsPlugin({ minimize: true }));
    outputFile = LIBRARY_NAME + '.min.js';
} else {
    outputFile = LIBRARY_NAME + '.js';
}

const config = {
    entry: __dirname + '/src/index.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, '..', 'django_project', 'core', 'base_static', 'js', 'build'),
        filename: outputFile,
        library: LIBRARY_NAME,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /(\.jsx|\.js)$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        modules: [
            path.resolve('./node_modules'),
            path.resolve('./src')
        ],
        extensions: ['.json', '.js']
    },
    plugins: plugins
};

module.exports = config;
