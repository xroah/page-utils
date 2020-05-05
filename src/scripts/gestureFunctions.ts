function switchTab(dir: string) {
    chrome.tabs.query({
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, tabs => {
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
    });
}

function scrollTo(pos: number) {
    const scroll = () => {
        const sTop = document.documentElement.scrollTop;
        const dis = Math.floor((pos - sTop) / 10);
        const absDis = Math.abs(dis);
        let _dis = dis;

        if (absDis > 0) {
            requestAnimationFrame(scroll);

            if (absDis < 10) {
                _dis = dis < 0 ? -10 : 10;
            }

            window.scrollTo(0, sTop + _dis);
        } else {
            window.scrollTo(0, pos);
        }
    };

    scroll();

    return this;
}

export const page: any = {
    back() {
        history.back()
    },
    forward() {
        history.forward();
    },
    refresh() {
        location.reload();
    },
    forceRefresh() {
        location.reload(true);
    },
    scrollUp() {
        scrollTo(document.documentElement.scrollTop - window.innerHeight);
    },
    scrollDown() {
        scrollTo(document.documentElement.scrollTop + window.innerHeight)
    },
    scrollTop() {
        scrollTo(0);
    },
    scrollBottom() {
        scrollTo(document.body.scrollHeight - window.innerHeight);
    }
};

function getCurrentTab(callback: (tab: chrome.tabs.Tab) => void) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => callback(tabs[0]));
}

function getInactiveTabs(type: "all" | "left" | "right", callback: (tabs: chrome.tabs.Tab[]) => void) {
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

export const chromeAPI: any = {
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
            incognito:  true
        });
    },
    maximum() {
        chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {
            state: "maximized"
        });
    },
    minimum() {
        chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {
            state: "minimized"
        });
    },
    fullscreen() {
        chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT, {
            state: "fullscreen"
        });
    }
};