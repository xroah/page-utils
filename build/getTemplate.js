const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = function getTemplate() {
    let dir = path.join(__dirname, "../template");
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