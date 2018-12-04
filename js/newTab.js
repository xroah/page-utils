function request(url) {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();

        xhr.response = "json";
        xhr.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(xhr.response)
            }
        };

        xhr.onerror = function () {
            console.log("出错了")
        };

        xhr.open("GET", url, true);

        xhr.send();
    })
}

function getToday() {
    let date = new Date();
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function init() {
    chrome.storage.local.get("backgroundImg", function (item) {
        let bg = item.backgroundImg;
        if (bg && bg.date === getToday()) {
            setBg(bg.img)
        } else {
            fetchImg();
        }
    })
}

function fetchImg() {
    request("https://cn.bing.com/HPImageArchive.aspx?format=js&n=1")
        .then(res => {
            let obj = JSON.parse(res);
            let url = `https://cn.bing.com${obj.images[0].url}`;
            chrome.storage.local.set({
                backgroundImg: {
                    date: getToday(),
                    img: url
                }
            });
            setBg(url);
        });
}

function setBg(url) {
    let bgEl = document.getElementById("bg");
    bgEl.style.backgroundImage = `url(${url})`;
}

init();

