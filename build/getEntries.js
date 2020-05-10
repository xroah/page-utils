const fs = require("fs");
const path = require("path");

module.exports = function getEntries() {
    let dir = path.join(__dirname, "../src/scripts");
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