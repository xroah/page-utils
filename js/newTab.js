!function () {
    function request(url, responseType = "json") {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.responseType = responseType;

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
        let time = Date.now();
        //防止缓存
        let url = `https://cn.bing.com/HPImageArchive.aspx?format=js&n=1&__time=${time}`;
        request(url)
            .then(res => {
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

    function setBg(bgImg) {
        let bgEl = document.getElementById("bg");
        let copyright = document.getElementById("copyright");
        bgEl.style.backgroundImage = `url(${bgImg.url})`;
        copyright.title = bgImg.info;
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
        sEl.classList.remove("scale-invisible");
    }

    function initEvent() {
        let searchBtn = document.getElementById("search");
        let input = document.getElementById("keywords");
        let weather = document.getElementById("weather");

        searchBtn.addEventListener("click", search);
        input.addEventListener("keydown", evt => {
            if (evt.key.toLowerCase() === "enter") {
                search();
            }
        });
        weather.addEventListener("click", function () {
            let url = `http://www.weather.com.cn/weather1d/${this.getAttribute("data-cityId")}.shtml`;
            location.assign(url);
        });
    }

    function fetchArticles() {//获取掘金前端热门文章
        let url = "https://timeline-merger-ms.juejin.im/v1/get_entry_by_rank?src=web&category=5562b415e4b00c57d9b94ac8";
        request(url).then(res => {
            let list = res.d.entrylist;
            let el = document.getElementById("articles");
            let frag = document.createDocumentFragment();
            for (let item of list) {
                let a = document.createElement("a");
                a.href = item.originalUrl;
                a.innerHTML = item.title;
                frag.appendChild(a);
            }
            el.appendChild(frag);
        });
    }

    function fetchWeather() {
        function handleRes(res) {
            let el = document.getElementById("weather");
            let city = el.querySelector(".city");
            let img = el.querySelector("img");
            let pName = el.querySelector(".pollution-name");
            let pValue = el.querySelector(".pollution-value");
            let temp = el.querySelector(".temperature");
            let today = res.data[0];
            let imgs = ["晴", "多云", "阴", "阵雨", "雷阵雨", "雷阵雨伴有冰雹", "雨夹雪", "小雨", "中雨", "大雨", "暴雨", "大暴雨", "特大暴雨", "阵雪", "小雪", "中雪", "大雪", "暴雪", "雾", "冻雨", "沙尘暴", "小雨转中雨", "中雨转大雨", "大雨转暴雨", "暴雨转大暴雨", "小雪转中雪", "中雪转大雪", "大雪转暴雪", "浮尘", "扬沙", "强沙尘暴", "霾"];
            city.innerHTML = res.city;
            for (let i of imgs) {
                if (new RegExp(`^${i}`).test(today.wea)) {
                    img.src = `${chrome.runtime.getURL("")}images/weather/${i}.png`;
                    break;
                }
            }
            el.setAttribute("data-cityId", res.cityid);
            img.title = today.wea;
            pName.innerHTML = today.air_level;
            pName.title = today.air_tips;
            pValue.innerHTML = today.air;
            temp.innerHTML = `${today.tem1}-${today.tem2}`;
            el.classList.remove("scale-invisible");
        }
        request("http://pv.sohu.com/cityjson", "text").then(res => {
            let reg = /{.*}/;
            let cityInfo = JSON.parse(res.match(reg)[0]);
            return Promise.resolve(cityInfo)
        }).then(cityInfo => {
            return request(`https://www.tianqiapi.com/api/?version=v1&ip=${cityInfo.cip}`)
        }).then(handleRes);
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
        chrome.storage.local.get("sentence", function (item) {
            let sentence = item.sentence;
            if (sentence && sentence.date === getToday()) {
                updateSentence(sentence);
            } else {
                fetchDailySentence();
            }
        });
        fetchWeather();
        fetchArticles();
        initEvent();
    }

    init();

}();
