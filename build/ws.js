//Websocket: communicate with the background
//For reloading the extension once changed

const Websocket = require("ws");

module.exports = function createWS(callback) {
    if (typeof callback !== "function") callback = a => a;

    const wsServer = new Websocket.Server({ 
        port: 8000,
        host: "0.0.0.0"
     });
    
    wsServer.on("connection", ws => {
        callback(ws);
    });
}