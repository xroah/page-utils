!function () {
    function request(url, reponseType) {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.responseType = reponseType || "json";
            xhr.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    resolve(xhr.response);
                }
            };

            xhr.onerror = function () {
                console.log("出错了");
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
        let input = document.getElementById("keywords");
        let se = document.getElementById("searchEngine");
        let value = input.value;
        if (!value.trim()) {
            input.focus();
            return;
        }
        location.assign(`${se.value}${input.value}`);
    }

    function fetchImg() {
        request("https://cn.bing.com/HPImageArchive.aspx?format=js&n=1")
            .then(res => {
                let url = `https://cn.bing.com${res.images[0].url}`;
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

    function fetchDailySentence() {
        request("http://open.iciba.com/dsapi/")
            .then(res => {
                let sentence = {
                    chinese: res.note,
                    english: res.content,
                    date: getToday()
                };
                chrome.storage.local.set({
                    sentence
                });
                updateSentence(sentence)
            })
    }

    function updateSentence(sentence) {
        let sEl = document.getElementById("sentence");
        sEl.innerHTML = sentence.english;
        sEl.title = sentence.chinese;
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
                setBg(bg.img)
            } else {
                fetchImg();
            }
        });
        chrome.storage.local.get("sentence", function (item) {
            let sentence = item.sentence;
            if (sentence && sentence.date === getToday()) {
                updateSentence(sentence);
            } else {
                fetchDailySentence();
            }
        });
        initEvent();
    }

    request("https://www.baidu.com/home/other/data/weatherInfo?city=%E6%9D%AD%E5%B7%9E").then(res => {
       console.log(res)
    });

    init();

}();