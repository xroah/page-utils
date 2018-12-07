chrome.contextMenus.create({
    title: "查看图片",
    contexts: ["image"],
    onclick(img) {
        chrome.tabs.create({
            url: img.srcUrl,
            active: true
        });
    }
});

function switchTab(dir) {
    chrome.windows.getCurrent(window => {
        chrome.tabs.query({
            windowId: window.id
        }, tabs => {
            let len = tabs.length;
            let index = 0;
            let tab;
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
    });
}

function handleMessage(evt, sender, sendResponse) {
    switch(evt.type) {
        case "executeGesture":
            executeGesture(evt.message);
            break;
    }
    sendResponse();
}

function executeGesture(message) {
    switch(message) {
        case "dr": //关闭标签
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
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
            chrome.windows.getCurrent(window => {
                chrome.windows.remove(window.id);
            });
            break;
    }
}

chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onCreated.addListener(function(tab) {
    if (tab.url === "chrome://newtab/") {
        /*chrome.tabs.update(
            tab.id,
            {
                url: chrome.runtime.getURL("") + "newTab.html"
            }
        );*/
    }
});