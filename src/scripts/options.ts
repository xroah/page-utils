import { EventProps } from "./interface/index";
import {
    getById,
    getOptions,
    setOptions
} from "./common/utils";
import gestureSettings from "./common/gestureSettings";
import "../styles/options.scss";

function showMenu(evt: MouseEvent | { currentTarget: HTMLElement }) {
    let btn = evt.currentTarget as HTMLElement;
    let aside = getById("aside");

    btn.classList.toggle("active");
    aside.classList.toggle("visible");
}

function handleChange(evt: Event, type: string) {
    let target = evt.target as HTMLInputElement;

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
            if (target.type === "color") {
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

function handleClick(evt: MouseEvent) {
    let tgt = evt.target as HTMLButtonElement;

    if (tgt.classList.contains("reset")) {
        if (confirm("确定要恢复默认设置吗？")) {
            chrome.runtime.sendMessage({
                type: "reset",
                message: tgt.dataset.type
            });
        }
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
    let cancelAdd = getById("cancelAddGesture");

    showMenuBtn.addEventListener("click", showMenu);
    window.addEventListener("hashchange", handleHashChange);
    basic.addEventListener("change", handleBasicChange);
    gesture.addEventListener("change", handleGestureChange);
    document.addEventListener("click", handleClick);
    cancelAdd.addEventListener("click", gestureSettings.hideGestureDialog);
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

    if (viewId === "gesture") {
        const el = getById("drawGestureWrapper");
        const svg = getById("gestureTrack");

        svg.setAttribute("width", `${el.clientWidth}`);
        svg.setAttribute("height", `${el.clientHeight}`);
    }
}

function initSettings() {
    chrome.storage.local.get("options", (obj: any) => {
        let { normal, gesture } = obj.options;
        let disable = getById("disable") as HTMLInputElement;
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

        disable.checked = !normal.disabled;
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

        gestureSettings.initGestureView(gesture.actions);
    });
}

function init() {
    initSettings();
    initEvent();
    updateView();
}

init();
