const fs = require("fs");
const path = require("path");

function readdir(dir) {
    if (path.isAbsolute(dir)) {
        dir = path.resolve(dir);
    }

    return fs.readdirSync(dir).map(p => `${dir}/${p}`);
}

function rmdir(dir) {
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

module.exports = rmdir;