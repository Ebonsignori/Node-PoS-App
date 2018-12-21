/*** webpack.config.js ***/
// const debug = process.env.NODE_ENV !== "production";

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    // devtool alternative : "cheap-module-eval-source-map" inline-sourcemap,
    devtool: "source-map",

    // Change loading point based on production or development
    entry: [
            'babel-polyfill',
            './src/app.js'
        ],
    mode: 'development',
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'index.min.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {minimize: true}
                    }
                ]
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract(
                    {
                        fallback: 'style-loader',
                        use: ['css-loader']
                    })
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({filename: 'style.css'})
    ],
    devServer: {
        historyApiFallback: true,
        stats: 'minimal',
        compress: true,
        // inline: true,
        contentBase: './dist',
        port: process.env.CLIENT_HTTP_PORT,
        host: "0.0.0.0",
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        },
        hot: false,
        inline: false,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        }
    }
};