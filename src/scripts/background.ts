import defaultOptions from "./variables/defaultOptions";
import { EventProps } from "./interface/index";
import { chromeAPI } from "./gestureFunctions";

function handleReset(type: "normal" | "gesture") {
    chrome.storage.local.get("options", (obj: any) => {
        let options = obj.options;
        options[type] = defaultOptions[type];
        chrome.storage.local.set({
            options
        });
        chrome.runtime.sendMessage({ type: "resetSuccess" });
    })
}

function executeGesture(message: string) {
    if (message in chromeAPI) {
        chromeAPI[message]();
    }
}

function handleMessage(evt: EventProps) {
    switch (evt.type) {
        case "executeGesture":
            executeGesture(evt.message);
            break;
        case "reset":
            handleReset(evt.message as ("normal" | "gesture"));
            break;
    }
}

chrome.runtime.onMessage.addListener(handleMessage);
chrome.runtime.onInstalled.addListener((detail: chrome.runtime.InstalledDetails) => {
    if (detail.reason === "install") {
        chrome.storage.local.set({
            options: defaultOptions
        });
    }
});

//reload the extension
if (process.env.NODE_ENV === "development") {
    const ws = new WebSocket("ws://localhost:8000");

    ws.onerror = () => console.log("error");
    ws.onmessage = evt => {
        const data = JSON.parse(evt.data);

        if (data.status === 0 && data.message === "reload") {
            chrome.runtime.reload();
            console.log("Extension has reloaded successfully!");
        }
    };
}