const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const rmdir = require("./rmdir");
const createWS = require("./ws");
const WebSocket = require("ws");

const fs = require("fs");
const path = require("path");

let context = path.resolve(__dirname);

function getEntries() {
    let dir = "./src/scripts";
    let entries = fs.readdirSync(dir);
    let ret = {};

    for (let file of entries) {
        let f = `${dir}/${file}`;;
        let stat = fs.statSync(f);
        if (stat.isDirectory()) continue;
        let name = path.parse(file).name;
        ret[name] = f;
    }

    return ret;
}

function getTemplate() {
    let dir = "template";
    return fs.readdirSync(dir).filter(f => {
        let stat = fs.statSync(`${dir}/${f}`);

        return stat.isFile();
    }).map(f => {
        let name = path.parse(f).name;
        let chunks = [name];

        if (name === "newTab") {
            chunks.push("gesture");
        }

        return new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: `${dir}/${f}`,
            hash: true,
            chunks
        });
    });
}

let plugins = getTemplate();

let cfg = {
    mode: process.env.NODE_ENV,
    entry: getEntries(),
    output: {
        path: `${context}/dist`,
        filename: "scripts/[name].js"
    },
    stats: "minimal",
    resolve: {
        extensions: [".js", ".ts"]
    },
    devtool: "cheap-source-map",
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
    }
};

plugins.push(
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
);

cfg.plugins = plugins;

rmdir(cfg.output.path);

function handleError(err, stats) {
    if (err || stats.hasErrors()) {
        if (err) throw err;

        console.log(stats.compilation.errors.map(e => e.message).join("\n\n"));

        return true;
    }

    return false;
}

if (process.env.NODE_ENV === "development") {
    const compiler = webpack(cfg);
    let requests = [];

    createWS(ws => requests.push(ws));

    compiler.hooks.done.tap("done", stats => {
        if (stats.hasErrors()) return;

        requests.forEach((req, i) => {
            if (req.readyState === req.CLOSED) {
                return requests.splice(i, 1);
            }

            req.send(JSON.stringify({
                status: 0,
                message: "reload"
            }));
        });

        console.log("updated");
    });

    compiler.watch({}, handleError);
} else {
    webpack(cfg, handleError);
}