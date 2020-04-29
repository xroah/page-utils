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
    chrome.windows.getCurrent((window: chrome.windows.Window) => {
        chrome.tabs.query({
            windowId: window.id
        }, (tabs: Array<chrome.tabs.Tab>) => {
            let len: number = tabs.length;
            let index:number = 0;
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
    })
}

function handleReset(type: "normal" | "gesture") {
    chrome.storage.sync.get("options", (obj: any) => {
        let options = obj.options;
        options[type] = defaultOptions[type];
        chrome.storage.sync.set({
            options
        });
        chrome.runtime.sendMessage({type: "resetSuccess"});
    })
}

function executeGesture(message: string) {
    switch (message) {
        case "dr": //关闭标签
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs: Array<chrome.tabs.Tab>) => {
                chrome.tabs.remove(tabs[0].id);
            });
            break;
        case "dl": //新建标签
            chrome.tabs.create({
                active: true
            });
            break;
        case "lu"://重新打开关闭的标签或者窗口
            chrome.sessions.restore();
            break;
        case "ul": //左侧标签
            switchTab("left");
            break;
        case "ur": //右侧标签
            switchTab("right");
            break;
        case "dru": //新建窗口
            chrome.windows.create();
            break;
        case "urd": //关闭窗口
            chrome.windows.getCurrent((win: chrome.windows.Window) => {
                chrome.windows.remove(win.id);
            });
            break;
    }
}

function replaceNewTab(tab: chrome.tabs.Tab) {
    if (tab.url === "chrome://newtab/") {
        chrome.storage.sync.get("options", (obj: any) => {
            let {normal} = obj.options;
            if (!normal.disabled && normal.replaceNewTab) {
                chrome.tabs.update(
                    tab.id,
                    {
                        url: chrome.runtime.getURL("") + "newTab.html"
                    }
                );
            }
        });
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
chrome.tabs.onCreated.addListener(replaceNewTab);
chrome.tabs.onUpdated.addListener( (tabId: number, tab: chrome.tabs.Tab) => replaceNewTab(tab));

chrome.runtime.onInstalled.addListener((detail: chrome.runtime.InstalledDetails) => {
    if (detail.reason === "install") {
        chrome.storage.sync.set({
            options: defaultOptions
        });
    }
});