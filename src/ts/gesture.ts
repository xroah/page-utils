import {DIR_MAP, DIR_TEXT_MAP} from "./variables/constants";
import "../sass/gesture.scss";

let gesture: any = {
    mouseDown: false,
    lastPosition: {
        x: 0,
        y: 0
    },
    linuxInterval: 0, //Linux下会先触发contextmenu事件
    svgTag: null,
    polyline: null,
    wrapper: null,
    preventContextMenu: false,
    positions: [],
    dirs: [],
    moveTimer: null,
    showTrack: true, //是否显示轨迹
    trackColor: "", //轨迹颜色
    trackWidth: 0, //轨迹宽度
    trackOpacity: 0, //轨迹透明度
    showHint: true, //是否显示提示
    hintOpacity: 0, //提示透明度,
    hintBgColor: "", //提示背景色
    hintTextColor: "", //提示文字颜色
    hintFontSize: 20,
    disabled: false, //是否禁用
    minDis: 10, //手势生效的最小长度
    expire: false, //是否超时取消
    expireSecond: 2,//超时取消时间
    cancelTimer: null,
    button: 2, //触发手势鼠标按键
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
    handleMouseDown(evt: MouseEvent) {
        let ua: string = navigator.userAgent.toLowerCase();
        if (evt.button !== this.button) return;
        this.preventContextMenu = false;
        if (this.button === 1) {
            //按下的是鼠标中键,阻止默认行为否则页面会滚动
            evt.preventDefault();
        } else if (this.button === 2) {
            if (ua.indexOf("linux") > -1) {//linux系统中
                let time = Date.now();
                if (time - this.linuxInterval < 500) {//双击小于500毫秒才触发contextmenu
                    return;
                }
                this.preventContextMenu = true;
                this.linuxInterval = time;
            }
        }
        if (this.wrapper) {
            document.body.removeChild(this.wrapper);
            this.wrapper = null;
        }
        let pos: any = this.lastPosition;
        pos.x = evt.clientX;
        pos.y = evt.clientY;
        this.positions.push(`${pos.x} ${pos.y}`);
        this.mouseDown = true;
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
            this.moveTimer = null;
        }
    },
    reset() {
        if (this.wrapper) {
            document.body.removeChild(this.wrapper);
        }
        if (this.dirs.length) {
            this.preventContextMenu = true;
        }
        this.mouseDown = false;
        this.wrapper = null;
        this.svgTag = null;
        this.polyline = null;
        this.positions = [];
        this.dirs = [];
        return this;
    },
    handleMouseUp(evt: MouseEvent) {
        if (evt.button !== this.button || !this.mouseDown) return;
        this.execute().reset().clearCancelTimer();
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
        let dirTextMap = DIR_TEXT_MAP as any;
        let img = new Image();
        img.src = chrome.runtime.getURL("") + dirMap[dir];
        dirWrapper.appendChild(img);
        textWrapper.innerHTML = dirTextMap[this.dirs.join("")] || "";
        return this;
    },
    scrollPage(dis: number) {
        let moved = 0;
        let _dis = Math.abs(dis);
        let sTop = document.documentElement.scrollTop;
        if (
            (dis < 0 && sTop === 0) ||
            (dis > 0) && sTop === document.body.scrollHeight - window.innerHeight
        ) return;
        this.moveTimer = setInterval(() => {
            let speed = (_dis - moved) / 5;
            moved += speed;
            if (dis < 0) {
                document.documentElement.scrollTop -= speed;
            } else {
                document.documentElement.scrollTop += speed;
            }
            if (Math.ceil(moved) >= _dis) {
                clearInterval(this.moveTimer);
                this.moveTimer = null;
            }
        }, 20);
        return this;
    },
    execute() {
        let dirs = this.dirs.join("");
        if (!dirs) return this;
        switch (dirs) {
            case "l": //后退
                history.back();
                break;
            case "r": //前进
                history.forward();
                break;
            case "ud": //刷新
                location.reload();
                break;
            case "udu": //强制刷新
                location.reload(true);
                break;
            case "u": //向上滚动
                this.scrollPage(-window.innerHeight);
                break;
            case "d": //向下滚动
                this.scrollPage(window.innerHeight);
                break;
            case "rd"://到底部
                this.scrollPage(document.body.scrollHeight);
                break;
            case "ru": //到顶部
                this.scrollPage(-document.body.scrollHeight);
                break;
            default: //其他需要调用chrome api的操作
                chrome.runtime.sendMessage({type: "executeGesture", message: dirs});
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
    handleMouseMove(evt: MouseEvent) {
        if (!this.mouseDown) return;
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
            pos.x = x;
            pos.y = y;
        }
    },
    handleContextMenu(evt: Event) {
        if (this.preventContextMenu) {
            evt.preventDefault();
        }
    },
    handleKeyEvent(evt: KeyboardEvent) {
        let key = (evt.key || "").toLowerCase(); //sometimes the evt.key is undefined
        if (key === "escape") {
            this.reset();
        }
    },
    handleStorageChange(obj: any) {
        if (!obj.options) return;
        let {normal, gesture} = obj.options.newValue;
        if (normal.disabled || !normal.enableGesture) {
            this.removeEvent()
        } else {
            this.initEvent();
        }
        this.updateProp({...normal, ...gesture});
    },
    initEvent() {
        let doc = document;
        doc.addEventListener("mousedown", this.handleMouseDown, true);
        doc.addEventListener("mouseup", this.handleMouseUp, true);
        doc.addEventListener("mousemove", this.handleMouseMove, true);
        doc.addEventListener("contextmenu", this.handleContextMenu);
        doc.addEventListener("keydown", this.handleKeyEvent);
    },
    removeEvent() {
        let doc = document;
        doc.removeEventListener("mousedown", this.handleMouseDown, true);
        doc.removeEventListener("mouseup", this.handleMouseUp, true);
        doc.removeEventListener("mousemove", this.handleMouseMove, true);
        doc.removeEventListener("contextmenu", this.handleContextMenu);
        doc.removeEventListener("keydown", this.handleKeyEvent);
    },
    initSettings() {
        chrome.storage.sync.get("options", (obj: any) => {
            let {normal, gesture} = obj.options;
            if (!normal.disabled && normal.enableGesture) {
                this.initEvent();
            }
            this.updateProp({...normal, ...gesture});
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
        this.button = props.button;
    },
    init() {
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleKeyEvent = this.handleKeyEvent.bind(this);
        chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
        this.initSettings();
    }
};

gesture.init();