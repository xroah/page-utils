const webpack = require("webpack");
const rmdir = require("./rmdir");
const createWS = require("./ws");
const cfg = require("./config");

rmdir(cfg.output.path);

function handleError(err, stats) {
    if (err || stats.hasErrors()) {
        if (err) throw err;

        console.log(stats.compilation.errors.map(e => e.message).join("\n\n"));

        return true;
    }

    return false;
}

if (cfg.mode === "development") {
    const compiler = webpack(cfg);
    let requests = [];

    createWS(ws => {
        console.log("WebSocket connected");
        requests.push(ws);
    });
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