const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: "development",
    entry: {
        main: './src/index.js'
    },
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, 'src/')
        }
    },
    output: {
        libraryTarget: "var",
        library: "CDP",
        filename: "cdp-web-sdk.js",
        path: path.resolve(__dirname, 'bin/')
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                output: {
                    comments: false,
                },
            },
            extractComments: false
        })]
    }
};
