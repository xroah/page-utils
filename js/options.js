function showMenu(evt) {
    let btn = evt.currentTarget;
    let aside = document.getElementById("aside");
    btn.classList.toggle("active");
    aside.classList.toggle("visible");
}

function handleChange(evt) {
    let target = evt.target;
    if (target.nodeName.toLowerCase() !== "input") return;
    let checked = target.checked;
    getOptions().then(opts => {
        switch (target.id) {
            case "disable":
                opts.normal.disabled = !checked;
                break;
            case "replaceNewTab":
                opts.normal.replaceNewTab = checked;
                break;
            case "enableGesture":
                opts.normal.enableGesture = checked;
                break;
        }
        setOptions(opts);
    });
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
    document.addEventListener("change", handleChange);
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

function initSettings() {
    chrome.storage.sync.get("options", obj => {
        let options = obj.options;
        let disable = document.getElementById("disable");
        let replaceNewTab = document.getElementById("replaceNewTab");
        let enableGesture = document.getElementById("enableGesture");
        disable.checked = !options.normal.disabled;
        replaceNewTab.checked = options.normal.replaceNewTab;
        enableGesture.checked = options.normal.enableGesture;
    });
}

function init() {
    initSettings();
    initEvent();
    updateView();
}

init();
