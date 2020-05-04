import { toDataURL } from "qrcode";
import "../styles/popup.scss";

const img = document.getElementById("qrCode") as HTMLImageElement;
const btn = document.getElementById("showPageQRCode") as HTMLButtonElement;
const clearBtn = document.getElementById("clear") as HTMLButtonElement;
const current = document.getElementById("onlyCurrent") as HTMLInputElement;
const historyEl = document.getElementById("history") as HTMLInputElement;
const cacheEl = document.getElementById("cache") as HTMLInputElement;
const cookieEl = document.getElementById("cookie") as HTMLInputElement;
const passwordEl = document.getElementById("password") as HTMLInputElement;
const downloadEl = document.getElementById("download") as HTMLInputElement;
const timeRangeEl = document.getElementById("timeRange") as HTMLSelectElement;
const OPTIONS_KEY = "clearOptions";

chrome.storage.local.get(OPTIONS_KEY, (opts: any = {}) => {
    historyEl.checked = !!opts.history;
    cacheEl.checked = !!opts.cache;
    cookieEl.checked = !!opts.cookie;
    passwordEl.checked = !!opts.password;
    downloadEl.checked = !!opts.download;

});

btn.addEventListener("click", function () {
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
});

function switchCheckbox() {
    downloadEl.disabled = current.checked;
    historyEl.disabled = current.checked;
}

function saveOptions() {
    chrome.storage.local.set({
        [OPTIONS_KEY]: {
            history: historyEl.checked,
            cache: cacheEl.checked,
            cookie: cookieEl.checked,
            password: passwordEl.checked,
            download: passwordEl.checked
        }
    });
}

current.addEventListener("change", switchCheckbox);

clearBtn.addEventListener("click", () => {
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

        timeMap.set("h", 60 * 60 * 1000);
        timeMap.set("d", 24 * 60 * 60 * 1000);
        timeMap.set("w", 7 * 24 * 60 * 60 * 1000);
        timeMap.set("m", 4 * 7 * 24 * 60 * 60 * 1000);
        timeMap.set("a", 0);
        saveOptions();

        if (!/^https?/.test(url) && current.checked) return;

        const a = document.createElement("a");
        a.href = url;
        clearBtn.innerHTML = "正在清理...";
        clearBtn.disabled = true;

        chrome.browsingData.remove(
            {
                since: timeMap.get(timeRangeEl.value),
                origins: current.checked ? [a.origin] : undefined
            } as any,
            {
                cache,
                cookies: cookie,
                downloads: download && !current.checked,
                formData: cookie,
                indexedDB: cookie,
                localStorage: cookie,
                passwords: password,
                history: history && !current.checked
            },
            () => {
                clearBtn.innerHTML = "清理";
                clearBtn.disabled = false;
            });
    });
});

switchCheckbox();