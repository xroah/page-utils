let gesture = {
    mouseDown: false,
    lastPosition: {
        x: 0,
        y: 0
    },
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
    disabled: false, //是否禁用
    minDis: 10, //手势生效的最小长度
    expire: false, //是否超时取消
    expireSecond: 2,//超时取消时间
    cancelTimer: null,
    setAttributes(el, attributes) {
        for (let key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
        return this;
    },
    getLastDir() {
        let dirs = this.dirs;
        return dirs[dirs.length - 1];
    },
    createEl(str, ns) {
        let doc = document;
        return ns ? doc.createElementNS(ns, str) : doc.createElement(str);
    },
    handleMouseDown(evt) {
        this.preventContextMenu = false;
        if (this.wrapper) {
            document.body.removeChild(this.wrapper);
        }
        if (evt.button !== 2) return; //按下的不是鼠标右键
        let pos = this.lastPosition;
        pos.x = evt.clientX;
        pos.y = evt.clientY;
        this.positions.push(`${pos.x} ${pos.y}`);
        this.mouseDown = true;
        this.initView();
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
            this.moveTimer = null;
        }
    },
    reset() {
        if (this.wrapper) {
            document.body.removeChild(this.wrapper);
        }
        this.mouseDown = false;
        this.wrapper = null;
        this.svgTag = null;
        this.polyline = null;
        this.positions = [];
        this.dirs = [];
        return this;
    },
    handleMouseUp(evt) {
        if (evt.button !== 2 || !this.mouseDown) return;
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
            this.setAttributes(svg, {
                width: window.innerWidth,
                height: window.innerHeight
            });
            this.setAttributes(polyline, {
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
        }
        div.appendChild(hintWrapper);
        document.body.appendChild(div);
    },
    updateDirView(dir) {
        if (!this.showHint) return;
        let dirWrapper = this.wrapper.querySelector(".dir-wrapper");
        let textWrapper = this.wrapper.querySelector(".text-wrapper");
        let dirMap = {
            u: "images/a_up.png",
            r: "images/a_right.png",
            d: "images/a_down.png",
            l: "images/a_left.png"
        };
        let dirTextMap = {
            l: "后退",
            r: "前进",
            d: "向下滚动",
            u: "向上滚动",
            dr: "关闭标签",
            dl: "新建标签",
            lu: "重新打开",
            rd: "到底部",
            ru: "到顶部",
            ul: "左侧标签",
            ur: "右侧标签",
            ud: "刷新",
            udu: "强制刷新",
            dru: "新建窗口",
            urd: "关闭窗口"
        };
        let img = new Image();
        img.src = chrome.runtime.getURL("") + dirMap[dir];
        dirWrapper.appendChild(img);
        textWrapper.innerHTML = dirTextMap[this.dirs.join("")] || "";
        return this;
    },
    scrollPage(dis) {
        let moved = 0;
        let _dis = Math.abs(dis);
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
        this.preventContextMenu = true;
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
    handleMouseMove(evt) {
        if (!this.mouseDown) return;
        let pos = this.lastPosition;
        let x = evt.clientX;
        let y = evt.clientY;
        let mx = Math.abs(x - pos.x);
        let my = Math.abs(y - pos.y);
        let dis = Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2));
        let dir;
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
    handleContextMenu(evt) {
        if (this.preventContextMenu) {
            evt.preventDefault();
        }
    },
    handleKeyEvent(evt) {
        let key = evt.key.toLowerCase();
        if (key === "escape") {
            this.reset();
        }
    },
    handleStorageChange(obj) {
        let { normal, gesture } = obj.options.newValue;
        if (normal.disabled || !normal.enableGesture) {
            this.removeEvent()
        } else {
            this.initEvent();
        }
        this.updateProp(Object.assign({}, normal, gesture));
    },
    initEvent() {
        let doc = document;
        doc.addEventListener("mousedown", this.handleMouseDown);
        doc.addEventListener("mouseup", this.handleMouseUp);
        doc.addEventListener("mousemove", this.handleMouseMove);
        doc.addEventListener("contextmenu", this.handleContextMenu);
        doc.addEventListener("keydown", this.handleKeyEvent);
    },
    removeEvent() {
        let doc = document;
        doc.removeEventListener("mousedown", this.handleMouseDown);
        doc.removeEventListener("mouseup", this.handleMouseUp);
        doc.removeEventListener("mousemove", this.handleMouseMove);
        doc.removeEventListener("contextmenu", this.handleContextMenu);
        doc.removeEventListener("keydown", this.handleKeyEvent);
    },
    initSettings() {
        chrome.storage.sync.get("options", obj => {
            let {normal, gesture} = obj.options;
            if (!normal.disabled && normal.enableGesture) {
                this.initEvent();
            }
            this.updateProp(Object.assign({}, normal, gesture));
        });
    },
    updateProp(props) {
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