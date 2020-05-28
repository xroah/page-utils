import "../styles/newTab.scss";
import { emulateTransitionEnd } from "./modules/utils";

function request(url: string, responseType: XMLHttpRequestResponseType = "json") {
    return new Promise((resolve: Function, reject: Function) => {
        let xhr = new XMLHttpRequest();

        xhr.responseType = responseType;
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(xhr.response);
            }

        };
        xhr.onerror = function () {
            console.log("出错了");
            reject(this);
        };

        xhr.open("GET", url, true);
        xhr.send();
    })
}

function getToday() {
    let date = new Date();

    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function search() {
    let input = document.getElementById("keywords") as HTMLInputElement;
    let se = document.getElementById("searchEngine") as HTMLSelectElement;
    let value = input.value;

    if (!value.trim()) {
        input.focus();

        return;
    }

    location.assign(`${se.value}${input.value}`);
}

function fetchImg() {
    let url = `https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&nc=${Date.now()}&pid=hp`;

    request(url)
        .then((res: any) => {
            let img = res.images[0];
            let url = `https://cn.bing.com${img.url}`;
            let backgroundImg = {
                date: getToday(),
                url,
                info: img.copyright
            };

            chrome.storage.local.set({
                backgroundImg
            });
            setBg(backgroundImg);
        });
}

function setBg(bgImg: any) {
    let bgEl = document.getElementById("bg");
    let copyright = document.getElementById("copyright");

    bgEl.style.backgroundImage = `url(${bgImg.url})`;
    copyright.title = bgImg.info;
}

function fetchSentence() {
    request("http://open.iciba.com/dsapi/")
        .then((res: any) => {
            const dailySentence = {
                date: getToday(),
                content: res.content,
                note: res.note
            }

            chrome.storage.local.set({
                dailySentence
            });

            setSentence(dailySentence);
        });
}

function setSentence(sentence: any) {
    const el = document.getElementById("sentence");

    el.innerHTML = sentence.content;
    el.title = sentence.note;
}


function showLinkLayer() {
    const list = document.getElementById("quickList");

    if (list.classList.contains("show")) return;

    list.style.display = "block";
    list.offsetHeight;
    list.classList.add("show");
}

function hideLinkLayer() {
    const list = document.getElementById("quickList");

    if (!list.classList.contains("show")) return;

    list.classList.remove("show");
    emulateTransitionEnd(list, () => {
        list.style.display = "none";
    });
}

function toggleLinkLayer() {
    const list = document.getElementById("quickList");

    if (list.classList.contains("show")) {
        hideLinkLayer();
    } else {
        showLinkLayer();
    }
}

function initEvent() {
    const searchBtn = document.getElementById("search");
    const input = document.getElementById("keywords");
    const toggle = document.getElementById("toggleLink");

    searchBtn.addEventListener("click", search);
    input.addEventListener("keydown", evt => {
        if (evt.key.toLowerCase() === "enter") {
            search();
        }
    });
    toggle.addEventListener("click", toggleLinkLayer);
    document.addEventListener("click", evt => {
        const target = evt.target as HTMLElement;
        const list = document.getElementById("quickList");

        if (
            target !== toggle &&
            target !== list &&
            !list.contains(target)
        ) {
            return hideLinkLayer();
        }

        if (target.classList.contains("quick-link-item")) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                const tab = tabs[0];

                chrome.tabs.update(tab.id, {
                    url: target.dataset.href
                });
            });
        }
    });
}

function initDate() {
    const date = new Date();
    const weeks = ["日", "一", "二", "三", "四", "五", "六"];
    const weekDay = `星期${weeks[date.getDay()]}`;
    const el = document.getElementById("date");

    el.innerHTML = `${date.getMonth() + 1}月${date.getDate()}日 ${weekDay}`;
}

function initTime() {
    const el = document.getElementById("time");
    const loop = () => {
        const date = new Date();
        const convertNum = (num: number) => (num + 100).toString().substring(1);
        const h = convertNum(date.getHours());
        const m = convertNum(date.getMinutes());
        const s = convertNum(date.getSeconds());
        el.innerHTML = `${h}:${m}:${s}`;;

        setTimeout(loop, 1000);
    };

    loop();
}

(function () {
    chrome.storage.local.get("backgroundImg", item => {
        let bg = item.backgroundImg;

        if (bg && bg.date === getToday()) {
            setBg(bg)
        } else {
            fetchImg();
        }
    });

    chrome.storage.local.get("dailySentence", item => {
        let sentence = item.dailySentence;

        if (sentence && sentence.date === getToday()) {
            setSentence(sentence);
        } else {
            fetchSentence();
        }
    });

    initEvent();
    initDate();
    initTime();
})();