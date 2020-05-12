import defaultOptions from "./variables/defaultOptions";
import { EventProps } from "./interface/index";
import chromeAPI from "./modules/gestures/gestureChromeAPI";

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
        (chromeAPI as any)[message]();
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
    (function () {
        let ws;

        try {
            ws = new WebSocket("ws://localhost:8000");
        } catch (error) {
            return;
        }

        ws.onerror = () => console.log("error");
        ws.onmessage = () => chrome.runtime.reload();
    })();
}