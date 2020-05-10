const MiniCssPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require("path");
const getEntries = require("./getEntries");
const getTemplate = require("./getTemplate");

const context = path.resolve(__dirname, "..");
const env = process.env.NODE_ENV;

module.exports = {
    mode: env,
    entry: getEntries(),
    output: {
        path: `${context}/dist`,
        filename: "scripts/[name].js"
    },
    stats: "minimal",
    devtool: env === "development" ? "cheap-source-map" : undefined,
    resolve: {
        extensions: [".js", ".ts"]
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: "ts-loader"
        }, {
            test: /\.s?css$/,
            use: [
                MiniCssPlugin.loader,
                "css-loader",
                "sass-loader"
            ]
        }, {
            test: /\.svg|.png|.jpg$/,
            use: [{
                loader: "url-loader",
                options: {
                    limit: 8192,
                    publicPath: "../"
                }
            }]
        }, {
            test: /\.pug$/,
            use: "pug-loader"
        }]
    },
    plugins: [
        ...getTemplate(),
        new CopyWebpackPlugin([{
            from: "icons/",
            to: "icons/"
        }, {
            from: "./manifest.json",
            to: "manifest.json"
        }]),
        new MiniCssPlugin({
            filename: "styles/[name].css"
        })
    ]
};