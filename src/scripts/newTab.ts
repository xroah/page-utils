import "../styles/newTab.scss";

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
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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
    let time = Date.now();
    //防止缓存
    let url = `https://cn.bing.com/HPImageArchive.aspx?format=js&n=1&__time=${time}`;
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

function initEvent() {
    let searchBtn = document.getElementById("search");
    let input = document.getElementById("keywords");

    searchBtn.addEventListener("click", search);
    input.addEventListener("keydown", evt => {
        if (evt.key.toLowerCase() === "enter") {
            search();
        }
    });
}

function init() {
    chrome.storage.local.get("backgroundImg", function (item) {
        let bg = item.backgroundImg;
        if (bg && bg.date === getToday()) {
            setBg(bg)
        } else {
            fetchImg();
        }
    });

    initEvent();
}

init();