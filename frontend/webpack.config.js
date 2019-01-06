/* global __dirname, require, module*/

const webpack = require('webpack');

const path = require('path');

let LIBRARY_NAME = 'WBLib';

module.exports = env => {

    let BUILD_MODE;

    let plugins = [], OUTPUT_FILE;

    if (env === 'build') {
        OUTPUT_FILE = LIBRARY_NAME + '.min.js';
        BUILD_MODE = 'production';
    } else {
        OUTPUT_FILE = LIBRARY_NAME + '.js';
        BUILD_MODE = 'development';
    }


    return {
        entry: __dirname + '/src/index.js',
        mode: BUILD_MODE,
        devtool: 'source-map',
        output: {
            path: path.resolve(__dirname, '..', 'django_project', 'core', 'base_static', 'js', 'build'),
            filename: OUTPUT_FILE,
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
                path.resolve(__dirname, 'src'),
                path.resolve('./node_modules')

            ],
            extensions: ['.json', '.js']
        },
        // will not be added to the output build, TODO d3
        // TODO add imports to files / there were some issues with this kind of includes (find / check that issue on webpacks git if resolved)
        externals:
            {
                "jquery": "jQuery",
                "lodash": {
                    commonjs: 'lodash',
                    commonjs2: 'lodash',
                    amd: 'lodash',
                    root: '_',
                }
            },
        plugins: plugins
    };
};
