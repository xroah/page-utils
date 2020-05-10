import {
    getById,
    getOptions,
    setOptions
} from "./utils";
import { DIR_MAP, allGestureFns } from "../variables/constants";

const saveGesture = getById("saveGesture");
const gestureEl = getById("drawGestureWrapper");
const svg = getById("gestureTrack");
const fnsEl = getById("gestureFunctions") as HTMLSelectElement;
let list = getById("gestureList");
const polyline = svg.firstElementChild;
const updateGesture = (dir: string) => {
    const gEl = getById("newGestures");
    const img = new Image();
    img.src = chrome.runtime.getURL("") + (DIR_MAP as any)[dir]

    gEl.appendChild(img);
}

let origDirs = "";
let isEdit = false;
let mousedown = false;
let start = {
    x: 0,
    y: 0
};
let points: string[] = [];
let dirs: string[] = [];

gestureEl.addEventListener("mousedown", evt => {
    start.x = evt.clientX;
    start.y = evt.clientY;
    mousedown = true;
    points = [];
    dirs = [];

    getById("newGestures").innerHTML = "";

    polyline.setAttribute("points", "");
});
gestureEl.addEventListener("contextmenu", evt => evt.preventDefault());
document.addEventListener("mouseup", evt => {
    if (!mousedown) return;

    mousedown = false;
});
document.addEventListener("mousemove", evt => {
    if (!mousedown) return;

    const x = evt.clientX;
    const y = evt.clientY;
    const disX = x - start.x;
    const disY = y - start.y;
    const rect = svg.getBoundingClientRect();
    const dis = Math.sqrt(Math.pow(disX, 2) + Math.pow(disY, 2));
    let dir = "";

    if (dis >= 10) {
        const len = dirs.length;

        if (Math.abs(disX) > Math.abs(disY)) {
            dir = x > start.x ? "r" : "l";
        } else {
            dir = y > start.y ? "d" : "u"
        }

        if (len < 5 && dir !== dirs[len - 1]) {
            dirs.push(dir);
            updateGesture(dir);
        }

        start.x = x;
        start.y = y;
    }

    points.push(`${x - rect.left} ${y - rect.top}`);
    polyline.setAttribute("points", points.join(","));
});

saveGesture.addEventListener("click", () => {
    const selected = fnsEl.selectedOptions[0];
    const dirStr = dirs.join("");

    if (!selected || !selected.value) return alert("请选择手势功能！");

    if (!dirStr) return alert("请绘制手势");

    getOptions().then((opts: any) => {
        const {
            gesture: { actions = {} }
        } = opts;
        let save = true;
        const obj = {
            action: selected.value,
            text: selected.text,
            timestamp: Date.now()
        };

        if (
            (dirStr in actions) &&
            (
                !isEdit ||
                dirStr !== origDirs
            )
        ) {
            if (save = confirm("该手势已存在，是否要替换？")) {
                actions[dirStr] = obj;
            }
        } {
            actions[dirStr] = obj;
        }

        if (save) {
            setOptions(opts, () => {
                gestureSettings.initGestureView(actions);
                gestureSettings.hideGestureDialog();
            });
        }
    });
});

list.addEventListener("click", evt => {
    const btn = evt.target as any;

    if (btn.classList.contains("remove-gesture")) {
        if (confirm("确定要删除该手势吗?")) {
            getOptions().then((opts: any) => {
                const {
                    gesture: { actions = {} }
                } = opts;

                delete actions[btn.dirs];

                setOptions(opts, () => {
                    chrome.runtime.sendMessage({
                        type: "updateGestures"
                    });
                });

                btn.parentNode.parentNode.removeChild(btn.parentNode);
            });
        }
    } else if (btn.classList.contains("edit-gesture")) {
        gestureSettings.showGestureDialog();
        gestureSettings.initGestureDialog(btn.fn, btn.dirs);
    }
});

const gestureSettings = {
    initGestureView(gestures: any) {
        let keys = Object.keys(gestures);
        let dm = DIR_MAP as any;
        let urlPrefix = chrome.runtime.getURL("");
        let frag = document.createDocumentFragment();
        let con = document.getElementById("gestureList");
        let addCon = document.createElement("div");
        let selFrag = document.createDocumentFragment();
        con.innerHTML = "";

        keys.sort(
            (a, b) => (gestures[a].timestamp || 0) - (gestures[b].timestamp || 0)
        );

        for (let k of keys) {
            let div = document.createElement("div");
            let dl = document.createElement("dl");
            let dt = document.createElement("dt");
            let dd = document.createElement("dd");
            let closeBtn = document.createElement("button");
            let editBtn = document.createElement("button");
            let optWrapper = document.createElement("div");
            let dirs = k.split("");

            for (let d of dirs) {
                let img = new Image();
                img.src = `${urlPrefix}${dm[d]}`;
                dt.appendChild(img);
            }

            Object.defineProperty(closeBtn, "dirs", {
                value: dirs.join("")
            });
            Object.defineProperties(editBtn, {
                dirs: {
                    value: dirs.join("")
                },
                fn: {
                    value: gestures[k].action
                }
            });
            optWrapper.classList.add("operation-wrapper");
            editBtn.classList.add("operation-btn", "edit-gesture", "mr-10");
            editBtn.setAttribute("title", "编辑");
            closeBtn.classList.add("operation-btn", "remove-gesture");
            closeBtn.setAttribute("title", "删除手势");
            dd.innerHTML = gestures[k].text;
            optWrapper.appendChild(editBtn);
            optWrapper.appendChild(closeBtn);
            dl.appendChild(dt);
            dl.appendChild(dd);
            div.classList.add("gesture-item");
            div.appendChild(dl);
            div.appendChild(optWrapper);
            frag.appendChild(div);
        }

        selFrag.appendChild(new Option("请选择", ""));
        allGestureFns.forEach(a => {
            let option = new Option(a.text, a.action);

            selFrag.appendChild(option);
        });

        addCon.classList.add("add-gesture", "gesture-item");
        addCon.setAttribute("title", "添加手势");
        addCon.addEventListener("click", gestureSettings.showGestureDialog);
        frag.appendChild(addCon);
        con.appendChild(frag);
        fnsEl.appendChild(selFrag);
    },
    initGestureDialog(fn: string, initDirs: string) {
        fnsEl.value = fn;
        dirs = initDirs.split("");
        isEdit = true;
        origDirs = initDirs;

        dirs.forEach(dir => updateGesture(dir));
    },
    showGestureDialog() {
        dirs = [];
        points = [];
        isEdit = false;
        fnsEl.selectedIndex = 0;

        getById("newGestures").innerHTML = "";

        polyline.setAttribute("points", "");
        getById("gesturePopup").classList.add("show");
    },
    hideGestureDialog() {
        getById("gesturePopup").classList.remove("show");
    }
}

export default gestureSettings;