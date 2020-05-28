const DIR_MAP = {
    u: "icons/a_up.png",
    r: "icons/a_right.png",
    d: "icons/a_down.png",
    l: "icons/a_left.png"
};
const DIR_TEXT_MAP = {
    l: {
        action: "back",
        text: "后退"
    },
    r: {
        action: "forward",
        text: "前进"
    },
    d: {
        action: "scrollDown",
        text: "向下滚动"
    },
    u: {
        action: "scrollUp",
        text: "向上滚动"
    },
    dr: {
        action: "closeTab",
        text: "关闭标签"
    },
    dl: {
        action: "createTab",
        text: "新建标签"
    },
    lu: {
        action: "restore",
        text: "重新打开"
    },
    rd: {
        action: "scrollBottom",
        text: "到底部"
    },
    ru: {
        action: "scrollTop",
        text: "到顶部"
    },
    ul: {
        action: "switchLeft",
        text: "左侧标签"
    },
    ur: {
        action: "switchRight",
        text: "右侧标签"
    },
    ud: {
        action: "refresh",
        text: "刷新"
    },
    udu: {
        action: "forceRefresh",
        text: "强制刷新"
    },
    dru: {
        action: "createWindow",
        text: "新建窗口"
    },
    urd: {
        action: "closeWindow",
        text: "关闭窗口"
    }
};

let timestamp = Date.now();

Object.keys(DIR_TEXT_MAP).forEach(
    key => (DIR_TEXT_MAP as any)[key].timestamp = timestamp + 1
);

const allGestureFns = Object.values(DIR_TEXT_MAP).concat([{
    action: "closeLeft",
    text: "关闭左侧标签"
}, {
    action: "closeRight",
    text: "关闭右侧标签"
}, {
    action: "closeOthers",
    text: "关闭其他标签"
}, {
    action: "maximum",
    text: "窗口最大化"
}, {
    action: "minimum",
    text: "窗口最小化"
}, {
    action: "fullscreen",
    text: "全屏"
}, {
    action: "createIncognito",
    text: "新建隐私窗口"
}, {
    action: "openSettings",
    text: "打开设置"
}, {
    action: "refreshAllTab",
    text: "刷新所有标签"
}, {
    action: "createBookmark",
    text: "添加书签"
}]);

export {
    DIR_MAP,
    DIR_TEXT_MAP,
    allGestureFns
}