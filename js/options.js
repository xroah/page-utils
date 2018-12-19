function showMenu(evt) {
    let btn = evt.currentTarget;
    let aside = getById("aside");
    btn.classList.toggle("active");
    aside.classList.toggle("visible");
}

function handleChange(evt, type) {
    let target = evt.target;
    if (target.id === "mouseBtnSel") {
        getOptions().then(opts => {
            opts.gesture.button = +target.value;
            setOptions(opts);
        });
        return;
    }
    if (target.nodeName.toLowerCase() !== "input") return;
    if (target.type === "checkbox") {
        let checked = target.checked;
        let ref = target.getAttribute("data-ref");
        if (ref) {
            ref = getById(ref);
            checked ? ref.classList.remove("hidden") : ref.classList.add("hidden");
        }
        getOptions().then(opts => {
            if (target.id === "disable") {
                opts.normal.disabled = !checked;
            } else {
                opts[type][target.id] = checked;
            }
            setOptions(opts);
        });
    } else {
        let valueEl = target.nextElementSibling;
        let value = target.value;
        if (valueEl) {
            valueEl.innerHTML = value;
        }
        getOptions().then(opts => {
            if(target.type === "color") {
                opts[type][target.id] = value;
            } else {
                opts[type][target.id] = +value;
            }
            setOptions(opts);
        });
    }
}

function handleBasicChange(evt) {
    handleChange(evt, "normal");
}

function handleGestureChange(evt) {
    handleChange(evt, "gesture");
}

function getOptions() {
    return new Promise(resolve => {
        chrome.storage.sync.get("options", obj => resolve(obj.options));
    });
}

function setOptions(options) {
    chrome.storage.sync.set({
        options
    });
}

function handleClick(evt) {
    let tgt = evt.target;
    if (tgt.classList.contains("reset")) {
        chrome.runtime.sendMessage({
            type: "reset",
            message: tgt.dataset.type
        });
    }
}

function handleMessage(evt, sender, sendResponse) {
    switch (evt.type) {
        case "resetSuccess":
            initSettings();
            break;
    }
}

function initEvent() {
    let showMenuBtn = getById("showMenuBtn");
    let basic = getById("basic");
    let gesture = getById("gesture");
    showMenuBtn.addEventListener("click", showMenu);
    window.addEventListener("hashchange", handleHashChange);
    basic.addEventListener("change", handleBasicChange);
    gesture.addEventListener("change", handleGestureChange);
    document.addEventListener("click", handleClick);
    chrome.runtime.onMessage.addListener(handleMessage);
}

function handleHashChange() {
    let btn = getById("showMenuBtn");
    updateView();
    //如果菜单显示则将其隐藏
    if (btn.classList.contains("active")) {
        showMenu({
            currentTarget: btn
        });
    }
}

function updateView(hash = location.hash) {
    let routerMap = {
        "#/basic": "basic",
        "#/gesture": "gesture",
        "#/about": "about"
    };
    let titleEl = getById("title");
    let viewId;
    let links = document.querySelectorAll("#nav .router-link");
    let currentView = document.querySelector(".view:not(.hidden)");
    if (hash in routerMap) {
        viewId = routerMap[hash];
    } else {
        viewId = "basic";
        hash = "#/basic";
    }
    if (currentView) {
        currentView.classList.add("hidden");
    }
    getById(viewId).classList.remove("hidden");
    for (let link of links) {
        let parent = link.parentNode;
        if (link.hash === hash) {
            parent.classList.add("active");
            titleEl.innerHTML = link.innerHTML;
        } else {
            parent.classList.remove("active");
        }
    }
}

function getById(id) {
    return document.getElementById(id);
}

function initSettings() {
    chrome.storage.sync.get("options", obj => {
        let { normal, gesture } = obj.options;
        let disable = getById("disable");
        let replaceNewTab = getById("replaceNewTab");
        let enableGesture = getById("enableGesture");
        let expireCheckbox = getById("expire");
        let expireValue = expireSlider.querySelector(".range-value");
        let expireSecond = getById("expireSecond");
        let minDisInput = getById("minDis");
        let minDisValue = getById("minDisValue");
        let showTrack = getById("showTrack");
        let trackColor = getById("trackColor");
        let trackOpacity = getById("trackOpacity");
        let trackOpacityValue = getById("trackOpacityValue");
        let trackWidth = getById("trackWidth");
        let trackWidthValue = getById("trackWidthValue");
        let showHint = getById("showHint");
        let hintBgColor = getById("hintBgColor");
        let hintOpacity = getById("hintOpacity");
        let hintOpacityValue = getById("hintOpacityValue");
        let hintTextColor = getById("hintTextColor");
        let mouseSel = getById("mouseBtnSel");
        disable.checked = !normal.disabled;
        replaceNewTab.checked = normal.replaceNewTab;
        enableGesture.checked = normal.enableGesture;
        expireSecond.value = expireValue.innerHTML = normal.expireSecond;
        minDisValue.innerHTML = minDisInput.value = normal.minDis;
        if (!(expireCheckbox.checked = normal.expire)) {
            getById("expireSlider").classList.add("hidden");
        }

        if (!(showTrack.checked = gesture.showTrack)) {
            getById("trackWrapper").classList.add("hidden");
        }
        trackColor.value = gesture.trackColor;
        trackOpacity.value = trackOpacityValue.innerHTML = gesture.trackOpacity;
        trackWidth.value = trackWidthValue.innerHTML = gesture.trackWidth;
        if (!(showHint.checked = gesture.showHint)) {
            getById("hintWrapper").classList.add("hidden");
        }
        hintBgColor.value = gesture.hintBgColor;
        hintOpacity.value = hintOpacityValue.innerHTML = gesture.hintOpacity;
        hintTextColor.value = gesture.hintTextColor;
        mouseSel.value = gesture.button;
    });
}

function initGestureView() {
    let keys = Object.keys(DIR_TEXT_MAP);
    let urlPrefix = chrome.runtime.getURL("");
    let frag = document.createDocumentFragment();
    let con = document.getElementById("gestureList");
    for (let k of keys) {
        let div = document.createElement("div");
        let dl = document.createElement("dl");
        let dt = document.createElement("dt");
        let dd = document.createElement("dd");
        let dirs = k.split("");
        for (let d of dirs) {
            let img = new Image();
            img.src = `${urlPrefix}${DIR_MAP[d]}`;
            dt.appendChild(img);
        }
        dd.innerHTML = DIR_TEXT_MAP[k];
        dl.appendChild(dt);
        dl.appendChild(dd);
        div.appendChild(dl);
        frag.appendChild(div);
    }
    con.appendChild(frag);
}

function init() {
    initSettings();
    initGestureView();
    initEvent();
    updateView();
}

init();
