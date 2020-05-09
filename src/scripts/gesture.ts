import { DIR_MAP } from "./variables/constants";
import DOMAPI, { cancelScroll } from "./gestureDOMAPI";
import "../styles/gesture.scss";

let gesture: any = {
    mousedown: false,
    lastPosition: {
        x: 0,
        y: 0
    },
    linuxInterval: 0,
    polyline: null,
    wrapper: null,
    positions: [],
    dirs: [],
    showTrack: true,
    trackColor: "",
    trackWidth: 0,
    trackOpacity: 0,
    showHint: true,
    hintOpacity: 0,
    hintBgColor: "",
    hintTextColor: "",
    hintFontSize: 20,
    disabled: false,
    minDis: 10,
    expire: false,
    expireSecond: 2,
    cancelTimer: null,
    button: 2,
    dirTextMap: {},
    preventContextMenu: false,
    setAttrs(el: HTMLElement, attributes: any) {
        for (let key in attributes) {
            el.setAttribute(key, attributes[key]);
        }

        return this;
    },
    getLastDir() {
        let dirs = this.dirs;

        return dirs[dirs.length - 1];
    },
    createEl(str: string, ns: string) {
        let doc = document;
        return ns ? doc.createElementNS(ns, str) : doc.createElement(str);
    },
    handleMousedown(evt: MouseEvent) {
        const ua: string = navigator.userAgent.toLowerCase();
        const pos: any = this.lastPosition;

        if (evt.button !== this.button) return;

        this.preventContextMenu = false;

        if (ua.indexOf("linux") > -1) {
            //the context menu triggers after mousedown rather than mouseup on linux
            let time = Date.now();

            if (time - this.linuxInterval < 500) return;

            this.preventContextMenu = true;
            this.linuxInterval = time;
        }

        if (this.wrapper) {
            document.body.removeChild(this.wrapper);
            this.wrapper = null;
        }

        this.mousedown = true;
        pos.x = evt.clientX;
        pos.y = evt.clientY;
        this.positions.push(`${pos.x} ${pos.y}`);
    },
    handleContextMenu(evt: MouseEvent) {
        if (this.preventContextMenu) {
            evt.preventDefault();
        }
    },
    handleMouseMove(evt: MouseEvent) {
        if (!this.mousedown) return;

        let pos = this.lastPosition;
        let x = evt.clientX;
        let y = evt.clientY;
        let mx = Math.abs(x - pos.x);
        let my = Math.abs(y - pos.y);
        let dis = Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2));
        let dir;

        if (!this.wrapper) {
            this.initView();
        }

        if (this.showTrack) {
            this.positions.push(`${x} ${y}`);
            this.polyline.setAttribute("points", this.positions.join(", "));
        }

        if (this.expire) {
            this.clearCancelTimer();
            this.cancelTimer = setTimeout(this.reset.bind(this), this.expireSecond * 1000);
        }

        if (dis > this.minDis) {
            if (mx > my) {
                dir = x > pos.x ? "r" : "l";
            } else {
                dir = y > pos.y ? "d" : "u";
            }

            if (this.getLastDir() !== dir) {
                this.dirs.push(dir);
                this.updateDirView(dir);
            }

            this.preventContextMenu = true;
            pos.x = x;
            pos.y = y;
        }
    },
    handleMouseUp(evt: MouseEvent) {
        if (evt.button !== this.button || !this.mousedown) return;

        this
            .execute()
            .reset()
            .clearCancelTimer();
    },
    reset() {
        if (this.wrapper) {
            document.body.removeChild(this.wrapper);
        }

        this.mousedown = false;
        this.wrapper = null;
        this.svgTag = null;
        this.polyline = null;
        this.positions = [];
        this.dirs = [];

        return this;
    },
    initView() {
        let div = this.wrapper = this.createEl("div");
        let hintWrapper = this.createEl("div");

        div.classList.add("bgoiofgfpkhhhlndnfhaplljgjajnell-gesture-wrapper");
        hintWrapper.classList.add("hint-wrapper");

        if (this.showTrack) {
            let svgNS = "http://www.w3.org/2000/svg";
            let polyline = this.polyline = this.createEl("polyline", svgNS);
            let svg = this.svgTag = this.createEl("svg", svgNS);

            this.setAttrs(svg, {
                width: window.innerWidth,
                height: window.innerHeight
            });
            this.setAttrs(polyline, {
                "points": this.positions.join(", "),
                "stroke": this.trackColor,
                "stroke-width": this.trackWidth,
                "stroke-linejoin": "round",
                "fill": "transparent",
                "stroke-opacity": this.trackOpacity
            });

            svg.appendChild(polyline);
            div.appendChild(svg);
        }

        if (this.showHint) {
            let imgWrapper = this.createEl("div");
            let textWrapper = this.createEl("div");

            imgWrapper.classList.add("dir-wrapper");
            hintWrapper.appendChild(imgWrapper);
            textWrapper.classList.add("text-wrapper");
            hintWrapper.appendChild(textWrapper);
            hintWrapper.style.backgroundColor = this.hintBgColor;
            hintWrapper.style.opacity = this.hintOpacity;
            textWrapper.style.color = this.hintTextColor;
            textWrapper.style.fontSize = `${this.hintFontSize}px`;
        }

        div.appendChild(hintWrapper);
        document.body.appendChild(div);
    },
    updateDirView(dir: any) {
        if (!this.showHint) return;

        let dirWrapper = this.wrapper.querySelector(".dir-wrapper");
        let textWrapper = this.wrapper.querySelector(".text-wrapper");
        let dirMap = DIR_MAP as any;
        let dirTextMap = this.dirTextMap as any;
        let img = new Image();
        img.src = chrome.runtime.getURL("") + dirMap[dir];
        dirWrapper.appendChild(img);
        textWrapper.innerHTML = (dirTextMap[this.dirs.join("")] || {}).text || "";

        return this;
    },
    execute() {
        const dirs = this.dirs.join("");
        const gesture = this.dirTextMap[dirs];

        if (!gesture) return this;

        if (gesture.action in DOMAPI) {
            (DOMAPI as any)[gesture.action]();
        } else {
            //others need invoke chrome api
            chrome.runtime.sendMessage({ type: "executeGesture", message: gesture.action });
        }

        return this;
    },
    clearCancelTimer() {
        if (this.cancelTimer !== null) {
            clearTimeout(this.cancelTimer);
            this.cancelTimer = null;
        }

        return this;
    },
    handleKeyEvent(evt: KeyboardEvent) {
        let key = (evt.key || "").toLowerCase(); //sometimes the evt.key is undefined

        if (key === "escape") {
            this.reset();
        }
    },
    handleStorageChange(obj: any) {
        if (!obj.options) return;

        let { normal, gesture } = obj.options.newValue;

        this.removeEvent();
        this.updateProp({ ...normal, ...gesture });

        if (!normal.disabled && normal.enableGesture) {
            this.initEvent();
        }
    },
    initEvent() {
        let doc = document;
        doc.addEventListener("mousedown", this.handleMousedown, true);
        doc.addEventListener("mouseup", this.handleMouseUp, true);
        doc.addEventListener("contextmenu", this.handleContextMenu, true);
        doc.addEventListener("mousemove", this.handleMouseMove, true);
        doc.addEventListener("keydown", this.handleKeyEvent);
    },
    removeEvent() {
        let doc = document;
        doc.removeEventListener("mousedown", this.handleMousedown, true);
        doc.removeEventListener("mouseup", this.handleMouseUp, true);
        doc.removeEventListener("contextmenu", this.handleContextMenu, true);
        doc.removeEventListener("mousemove", this.handleMouseMove, true);
        doc.removeEventListener("keydown", this.handleKeyEvent);
    },
    initSettings() {
        chrome.storage.local.get("options", (obj: any) => {
            let { normal, gesture } = obj.options;

            this.removeEvent();

            if (!normal.disabled && normal.enableGesture) {
                this.initEvent();
                this.updateProp({ ...normal, ...gesture });
            }
        });
    },
    updateProp(props: any) {
        this.minDis = props.minDis;
        this.expire = props.expire;
        this.expireSecond = props.expireSecond;
        this.showTrack = props.showTrack;
        this.trackColor = props.trackColor;
        this.trackWidth = props.trackWidth;
        this.trackOpacity = props.trackOpacity;
        this.showHint = props.showHint;
        this.hintBgColor = props.hintBgColor;
        this.hintOpacity = props.hintOpacity;
        this.hintTextColor = props.hintTextColor;
        this.dirTextMap = props.actions;
    },
    init() {
        this.handleMousedown = this.handleMousedown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyEvent = this.handleKeyEvent.bind(this);
        this.initSettings();

        chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
        window.addEventListener("wheel", cancelScroll);
        window.addEventListener("keydown", cancelScroll)
    }
};

gesture.init();