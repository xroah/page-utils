import { toDataURL } from "qrcode";
import { getById } from "./common/utils";
import "../styles/popup.scss";

const qrCodeBtn = getById("showPageQRCode") as HTMLButtonElement;
const clearBtn = getById("clear") as HTMLButtonElement;
const currentEl = getById("onlyCurrent") as HTMLInputElement;
const historyEl = getById("history") as HTMLInputElement;
const cacheEl = getById("cache") as HTMLInputElement;
const cookieEl = getById("cookie") as HTMLInputElement;
const passwordEl = getById("password") as HTMLInputElement;
const downloadEl = getById("download") as HTMLInputElement;
const timeRangeEl = getById("timeRange") as HTMLSelectElement;
const OPTIONS_KEY = "clearOptions";

function switchCheckbox() {
    const onlyCurrent = currentEl.checked;

    downloadEl.disabled = onlyCurrent;
    historyEl.disabled = onlyCurrent;
    passwordEl.disabled = onlyCurrent;

    if (onlyCurrent) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            const tab = tabs[0];

            clearBtn.disabled = !/^https?/.test(tab.url);
        });
    } else {
        clearBtn.disabled = false;
    }
}

function initClearOptions() {
    //read saved options
    chrome.storage.local.get(OPTIONS_KEY, (opts: any = {}) => {
        opts = opts[OPTIONS_KEY] || {};
        historyEl.checked = !!opts.history;
        cacheEl.checked = !!opts.cache;
        cookieEl.checked = !!opts.cookie;
        passwordEl.checked = !!opts.password;
        downloadEl.checked = !!opts.download;
        currentEl.checked = !!opts.current;
        timeRangeEl.value = opts.timeRange;

        if (timeRangeEl.selectedIndex === -1) {
            timeRangeEl.selectedIndex = 0;
        }

        switchCheckbox();
    });
}

function toggleQRCode() {
    const img = getById("qrCode") as HTMLImageElement;
    const imgWrapper = img.parentNode as HTMLElement;

    imgWrapper.classList.toggle("d-none");

    if (imgWrapper.classList.contains("d-none")) {
        this.innerHTML = "显示页面二维码";
    } else {
        this.innerHTML = "隐藏页面二维码";
    }

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs: Array<chrome.tabs.Tab>) => {
        toDataURL(tabs[0].url, {
            width: 160,
            margin: 0
        }, (error: Error, url: string) => {
            if (error) console.error(error);
            img.src = url;
        });
    });
}

function saveOptions() {
    chrome.storage.local.set({
        [OPTIONS_KEY]: {
            timeRange: timeRangeEl.value,
            current: currentEl.checked,
            history: historyEl.checked,
            cache: cacheEl.checked,
            cookie: cookieEl.checked,
            password: passwordEl.checked,
            download: passwordEl.checked
        }
    });
}

function clear() {
    const history = historyEl.checked;
    const cache = cacheEl.checked;
    const cookie = cookieEl.checked;
    const password = passwordEl.checked;
    const download = downloadEl.checked;

    if (
        !history &&
        !cache &&
        !cookie &&
        !password &&
        !download
    ) return;

    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, tabs => {
        const tab = tabs[0];
        const url = tab.url;
        const timeMap = new Map();
        const onlyCurrent = currentEl.checked;
        const others = cookie && !onlyCurrent;
        const mask = getById("cleaning");
        const stat = mask.firstElementChild;
        const a = document.createElement("a");

        stat.classList.remove("complete");
        timeMap.set("h", 60 * 60 * 1000);
        timeMap.set("d", 24 * 60 * 60 * 1000);
        timeMap.set("w", 7 * 24 * 60 * 60 * 1000);
        timeMap.set("m", 4 * 7 * 24 * 60 * 60 * 1000);
        timeMap.set("a", 0);
        saveOptions();

        a.href = url;
        clearBtn.disabled = true;
        mask.style.display = "flex";
        
        chrome.browsingData.remove(
            {
                since: timeMap.get(timeRangeEl.value) || 0,
                origins: onlyCurrent ? [a.origin] : undefined //since chrome 74
            } as any,
            {
                cache,
                cookies: cookie,
                downloads: download && !onlyCurrent,
                formData: others,
                indexedDB: others,
                localStorage: others,
                passwords: password && !onlyCurrent,
                history: history && !onlyCurrent
            },
            () => {
                stat.classList.add("complete");
                setTimeout(() => mask.style.display = "none", 1500);
                clearBtn.disabled = false;
            });
    });
}

chrome.storage.local.get("options", (opts: any = {}) => {
    const { normal = {} } = opts.options || {};

    if (!!normal.disabled) {
        return document.body.innerHTML = '<div style="color: #666;">功能未开启</div>'
    }

    initClearOptions();

    qrCodeBtn.addEventListener("click", toggleQRCode);
    currentEl.addEventListener("change", switchCheckbox);
    clearBtn.addEventListener("click", clear);
    getById("settings").addEventListener("click", evt => {
        chrome.runtime.openOptionsPage();
        evt.preventDefault();
    });
});