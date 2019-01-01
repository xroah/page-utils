import { EventProps } from "./interface/index";
import {DIR_MAP, DIR_TEXT_MAP} from "./variables/constants"
import "../sass/options.scss";

function showMenu(evt: MouseEvent | {currentTarget: HTMLElement}) {
    let btn = evt.currentTarget as HTMLElement;
    let aside = getById("aside");
    btn.classList.toggle("active");
    aside.classList.toggle("visible");
}

function handleChange(evt: Event, type: string) {
    let target = evt.target as HTMLInputElement;
    if (target.id === "mouseBtnSel") {
        getOptions().then((opts: any) => {
            opts.gesture.button = +target.value;
            setOptions(opts);
        });
        return;
    }
    if (target.nodeName.toLowerCase() !== "input") return;
    if (target.type === "checkbox") {
        let checked = target.checked;
        let ref: string | HTMLElement = target.getAttribute("data-ref");
        if (ref) {
            ref = getById(ref);
            checked ? ref.classList.remove("hidden") : ref.classList.add("hidden");
        }
        getOptions().then((opts: any) => {
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
        getOptions().then((opts: any) => {
            if(target.type === "color") {
                opts[type][target.id] = value;
            } else {
                opts[type][target.id] = +value;
            }
            setOptions(opts);
        });
    }
}

function handleBasicChange(evt: Event) {
    handleChange(evt, "normal");
}

function handleGestureChange(evt: Event) {
    handleChange(evt, "gesture");
}

function getOptions() {
    return new Promise(resolve => {
        chrome.storage.sync.get("options", obj => resolve(obj.options));
    });
}

function setOptions(options: any) {
    chrome.storage.sync.set({
        options
    });
}

function handleClick(evt: MouseEvent) {
    let tgt = evt.target as HTMLButtonElement;
    if (tgt.classList.contains("reset")) {
        chrome.runtime.sendMessage({
            type: "reset",
            message: tgt.dataset.type
        });
    }
}

function handleMessage(evt: EventProps) {
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
    let routerMap: any = {
        "#/basic": "basic",
        "#/gesture": "gesture",
        "#/about": "about"
    };
    let titleEl = getById("title");
    let viewId;
    let links: Array<Node> = Array.from(document.querySelectorAll("#nav .router-link"));
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
        let l = link as HTMLAnchorElement;
        let parent = link.parentNode as HTMLElement;
        if (l.hash === hash) {
            parent.classList.add("active");
            titleEl.innerHTML = l.innerHTML;
        } else {
            parent.classList.remove("active");
        }
    }
}

function getById(id: string) {
    return document.getElementById(id);
}

function initSettings() {
    chrome.storage.sync.get("options", (obj: any) => {
        let { normal, gesture } = obj.options;
        let disable = getById("disable") as HTMLInputElement;
        let replaceNewTab = getById("replaceNewTab") as HTMLInputElement;
        let enableGesture = getById("enableGesture") as HTMLInputElement;
        let expireCheckbox = getById("expire") as HTMLInputElement;
        let expireSlider = getById("expireSlider");
        let expireValue = expireSlider.querySelector(".range-value");
        let expireSecond = getById("expireSecond") as HTMLInputElement;
        let minDisInput = getById("minDis") as HTMLInputElement;
        let minDisValue = getById("minDisValue");
        let showTrack = getById("showTrack") as HTMLInputElement;
        let trackColor = getById("trackColor") as HTMLInputElement;
        let trackOpacity = getById("trackOpacity") as HTMLInputElement;
        let trackOpacityValue = getById("trackOpacityValue");
        let trackWidth = getById("trackWidth") as HTMLInputElement;
        let trackWidthValue = getById("trackWidthValue");
        let showHint = getById("showHint") as HTMLInputElement;
        let hintBgColor = getById("hintBgColor") as HTMLInputElement;
        let hintOpacity = getById("hintOpacity") as HTMLInputElement;
        let hintOpacityValue = getById("hintOpacityValue");
        let hintTextColor = getById("hintTextColor") as HTMLInputElement;
        let mouseSel = getById("mouseBtnSel") as HTMLSelectElement;
        disable.checked = !normal.disabled;
        replaceNewTab.checked = normal.replaceNewTab;
        enableGesture.checked = normal.enableGesture;
        expireSecond.value = expireValue.innerHTML = normal.expireSecond;
        minDisValue.innerHTML = minDisInput.value = normal.minDis;
        if (!(expireCheckbox.checked = normal.expire)) {
            expireSlider.classList.add("hidden");
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
    let dm = DIR_MAP as any;
    let dtm = DIR_TEXT_MAP as any;
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
            img.src = `${urlPrefix}${dm[d]}`;
            dt.appendChild(img);
        }
        dd.innerHTML = dtm[k];
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
