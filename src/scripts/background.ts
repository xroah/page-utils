import defaultOptions from "./variables/defaultOptions";
import { EventProps } from "./interface/index";

chrome.contextMenus.create({
    title: "下载",
    contexts: ["image"],
    onclick(img: chrome.contextMenus.OnClickData) {
        chrome.downloads.download({
            url: img.srcUrl
        });
    }
});

function switchTab(dir: string) {
    chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, (tabs: Array<chrome.tabs.Tab>) => {
        let len: number = tabs.length;
        let index: number = 0;
        let tab: chrome.tabs.Tab;

        for (let i = 0; i < len; i++) {
            if (tabs[i].active) {
                index = i;
                break;
            }
        }

        if (dir === "left") {
            if (index === 0) {
                index = len - 1;
            } else {
                index -= 1;
            }
        } else {
            if (index === len - 1) {
                index = 0;
            } else {
                index += 1;
            }
        }

        tab = tabs[index];

        chrome.tabs.update(tab.id, {
            active: true
        });
    });
}

function handleReset(type: "normal" | "gesture") {
    chrome.storage.sync.get("options", (obj: any) => {
        let options = obj.options;
        options[type] = defaultOptions[type];

        chrome.storage.sync.set({
            options
        });
        chrome.runtime.sendMessage({ type: "resetSuccess" });
    })
}

function executeGesture(message: string) {
    switch (message) {
        case "dr": //close the tab
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs: Array<chrome.tabs.Tab>) => {
                chrome.tabs.remove(tabs[0].id);
            });
            break;
        case "dl": //new tab
            chrome.tabs.create({
                active: true
            });
            break;
        case "lu"://reopen tab or window
            chrome.sessions.restore();
            break;
        case "ul": //left tab
            switchTab("left");
            break;
        case "ur": //right tab
            switchTab("right");
            break;
        case "dru": //new window
            chrome.windows.create();
            break;
        case "urd": //close the window
            chrome.windows.getCurrent((win: chrome.windows.Window) => {
                chrome.windows.remove(win.id);
            });
            break;
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
        chrome.storage.sync.set({
            options: defaultOptions
        });
    }
});