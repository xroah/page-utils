function showMenu(evt) {
    let btn = evt.currentTarget;
    let aside = document.getElementById("aside");
    btn.classList.toggle("active");
    aside.classList.toggle("visible");
}

function handleChange(evt) {
    let target = evt.target;
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
                opts.normal[target.id] = checked;
            }
            setOptions(opts);
        });
    } else if (target.type === "range") {
        let valueEl = target.nextElementSibling;
        let value = target.value;
        valueEl.innerHTML = value;
        getOptions().then(opts => {
            opts.normal[target.id] = +value;
            setOptions(opts);
        });
    }
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

function initEvent() {
    let showMenuBtn = document.getElementById("showMenuBtn");
    showMenuBtn.addEventListener("click", showMenu);
    window.addEventListener("hashchange", handleHashChange);
    document.body.addEventListener("change", handleChange);
}

function handleHashChange() {
    let btn = document.getElementById("showMenuBtn");
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
    let titleEl = document.getElementById("title");
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
    document.getElementById(viewId).classList.remove("hidden");
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
        let { normal } = obj.options;
        let disable = getById("disable");
        let replaceNewTab = getById("replaceNewTab");
        let enableGesture = getById("enableGesture");
        let expireCheckbox = getById("expire");
        let expireSlider = getById("expireSlider");
        let expireValue = expireSlider.querySelector(".range-value");
        let expireSecond = getById("expireSecond");
        let minDisInput = getById("minDis");
        let minDisValue = getById("minDisValue");
        disable.checked = !normal.disabled;
        replaceNewTab.checked = normal.replaceNewTab;
        enableGesture.checked = normal.enableGesture;
        expireCheckbox.checked = normal.expire;
        expireSecond.value = expireValue.innerHTML = normal.expireSecond;
        minDisValue.innerHTML = minDisInput.value = normal.minDis;
        if (!normal.expire) {
            expireSlider.classList.add("hidden");
        }
    });
}

function init() {
    initSettings();
    initEvent();
    updateView();
}

init();
