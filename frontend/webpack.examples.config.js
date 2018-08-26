/* global __dirname, require, module*/

const webpack = require('webpack');
//config.optimization.minimize

const path = require('path');
const env = 'dev'; // TODO

let LIBRARY_NAME = 'WBLib';

let plugins = [];

let outputFile = LIBRARY_NAME + '.min.js';


const config = {
  entry: __dirname + '/src/example/index.js',
    mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, '/src/example/build'),
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
