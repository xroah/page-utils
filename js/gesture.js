const MIN_DISTANCE = 10; //移动的最小距离 触发手势
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
        let div = this.wrapper = this.createEl("div");
        let svgNS = "http://www.w3.org/2000/svg";
        let svg = this.svgTag = this.createEl("svg", svgNS);
        let polyline = this.polyline = this.createEl("polyline", svgNS);
        pos.x = evt.clientX;
        pos.y = evt.clientY;
        this.positions.push(`${pos.x} ${pos.y}`);
        div.classList.add("bgoiofgfpkhhhlndnfhaplljgjajnell-gesture-wrapper");
        this.setAttributes(svg, {
            width: window.innerWidth,
            height: window.innerHeight
        });
        this.setAttributes(polyline, {
            "points": this.positions.join(", "),
            "stroke": "skyblue",
            "stroke-width": "5",
            "stroke-linejoin": "round",
            "fill": "transparent"
        });
        svg.appendChild(polyline);
        div.appendChild(svg);
        document.body.appendChild(div);
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
        this.execute().reset();
    },
    updateDirView(dir) {
        let div = this.wrapper.querySelector(".dir-wrapper");
        let imgWrapper;
        let textWrapper;
        let img = new Image();
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
        img.src = chrome.runtime.getURL("") + dirMap[dir];
        if (!div) {
            div = this.createEl("div");
            imgWrapper = this.createEl("div");
            textWrapper = this.createEl("div");
            imgWrapper.classList.add("img-wrapper");
            textWrapper.classList.add("text-wrapper");
            div.classList.add("dir-wrapper");
            div.appendChild(imgWrapper);
            div.appendChild(textWrapper);
            this.wrapper.appendChild(div);
        } else {
            imgWrapper = div.querySelector(".img-wrapper");
            textWrapper = div.querySelector(".text-wrapper");
        }
        imgWrapper.appendChild(img);
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
        if (dirs) {
            this.preventContextMenu = true;
        }
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
    handleMouseMove(evt) {
        if (!this.mouseDown) return;
        let pos = this.lastPosition;
        let x = evt.clientX;
        let y = evt.clientY;
        let mx = Math.abs(x - pos.x);
        let my = Math.abs(y - pos.y);
        let dis = Math.sqrt(Math.pow(mx, 2) + Math.pow(my, 2));
        let dir;
        this.positions.push(`${x} ${y}`);
        this.polyline.setAttribute("points", this.positions.join(", "));
        if (dis > MIN_DISTANCE) {
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
    initEvent() {
        let doc = document;
        doc.addEventListener("mousedown", this._handleMouseDown);
        doc.addEventListener("mouseup", this._handleMouseUp);
        doc.addEventListener("mousemove", this._handleMouseMove);
        doc.addEventListener("contextmenu", this._handleContextMenu);
        doc.addEventListener("keydown", this._handleKeyEvent);
    },
    init() {
        this._handleMouseDown = this.handleMouseDown.bind(this);
        this._handleMouseUp = this.handleMouseUp.bind(this);
        this._handleMouseMove = this.handleMouseMove.bind(this);
        this._handleContextMenu = this.handleContextMenu.bind(this);
        this._handleKeyEvent = this.handleKeyEvent.bind(this);
        this.initEvent();
    }
};

gesture.init();