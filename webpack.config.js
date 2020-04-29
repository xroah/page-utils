const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const fs = require("fs");
const path = require("path");

let context = path.resolve(__dirname);

function getEntries() {
    let dir = "./src/ts";
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

        if (name !== "popup") {
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

function readdir(dir) {
    if (path.isAbsolute(dir)) {
        dir = path.resolve(dir);
    }

    return fs.readdirSync(dir).map(p => `${dir}/${p}`);
}

function rmDir(dir) {
    dir = path.resolve(dir);

    if (
        !fs.existsSync(dir) ||
        !fs.lstatSync(dir).isDirectory()
    ) return;

    let dirs = [dir];
    let files = readdir(dir);

    while (files.length) {
        let f = files.pop();
        stat = fs.statSync(f);
        if (stat.isDirectory()) {
            files.push(...readdir(f));
            dirs.push(path.resolve(f));
        } else {
            fs.unlinkSync(f);
        }
    }

    while (dirs.length) {
        fs.rmdirSync(dirs.pop());
    }
}

let plugins = getTemplate();

let cfg = {
    mode: "development",
    entry: getEntries(),
    output: {
        path: `${context}/dist`,
        filename: "js/[name].js"
    },
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
        filename: "css/[name].css"
    })
);

rmDir("dist");

cfg.plugins = plugins;

module.exports = cfg;