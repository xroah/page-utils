function switchTab(dir: string) {
    chrome.tabs.query(
        {
            windowId: chrome.windows.WINDOW_ID_CURRENT
        },
        tabs => {
            let len = tabs.length;
            let index = 0;

            if (len === 1) return;

            index = tabs.findIndex(tab => tab.active);

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

            chrome.tabs.update(tabs[index].id, {
                active: true
            });
        }
    );
}

function getCurrentTab(
    callback: (tab: chrome.tabs.Tab) => void
) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => callback(tabs[0]));
}

function getInactiveTabs(
    type: "all" | "left" | "right",
    callback: (tabs: chrome.tabs.Tab[]) => void
) {
    chrome.tabs.query({
        active: false,
        currentWindow: true
    }, tabs => {
        let leftTabs: chrome.tabs.Tab[] = [];
        let rightTabs: chrome.tabs.Tab[] = [];

        if (type === "all") return callback(tabs);

        getCurrentTab(tab => {
            tabs.forEach(t => {
                if (t.id < tab.id) {
                    leftTabs.push(t);
                } else if (t.id > tab.id) {
                    rightTabs.push(t);
                }
            });

            callback(type === "left" ? leftTabs : rightTabs);
        });
    });
}

function removeTabs(tabs: chrome.tabs.Tab[]) {
    return chrome.tabs.remove(tabs.map(tab => tab.id));
}

export default {
    openSettings() {
        chrome.runtime.openOptionsPage();
    },
    closeTab() {
        getCurrentTab(tab => chrome.tabs.remove(tab.id));
    },
    createTab() {
        chrome.tabs.create({
            active: true
        });
    },
    closeOthers() {
        getInactiveTabs("all", removeTabs);
    },
    closeLeft() {
        getInactiveTabs("left", removeTabs);
    },
    closeRight() {
        getInactiveTabs("right", removeTabs);
    },
    restore() {
        chrome.sessions.restore();
    },
    switchLeft() {
        switchTab("left");
    },
    switchRight() {
        switchTab("right");
    },
    createWindow() {
        chrome.windows.create();
    },
    closeWindow() {
        chrome.windows.remove(chrome.windows.WINDOW_ID_CURRENT);
    },
    createIncognito() {
        chrome.windows.create({
            incognito: true
        });
    },
    refreshAllTab() {
        chrome.tabs.query({}, tabs => {
            tabs.forEach(
                t => chrome.tabs.reload(t.id, {bypassCache: true})
            );
        });
    },
    forceRefresh() {
        getCurrentTab(t => {
            chrome.tabs.reload(t.id, {bypassCache: true});
        });
    },
    maximum() {
        chrome.windows.update(
            chrome.windows.WINDOW_ID_CURRENT,
            {
                state: "maximized"
            }
        );
    },
    minimum() {
        chrome.windows.update(
            chrome.windows.WINDOW_ID_CURRENT,
            {
                state: "minimized"
            }
        );
    },
    fullscreen() {
        chrome.windows.update(
            chrome.windows.WINDOW_ID_CURRENT,
            {
                state: "fullscreen"
            }
        );
    },
    createBookmark() {
        getCurrentTab(tab => {
            chrome.bookmarks.create({
                url: tab.url,
                title: tab.title
            });
        });
    }
};