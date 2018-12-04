chrome.contextMenus.create({
    title: "查看图片",
    contexts: ["image"],
    onclick(img) {
        chrome.tabs.create({
            url: img.srcUrl,
            active: true
        });
    }
});


