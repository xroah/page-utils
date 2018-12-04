chrome.tabs.query({
    active: true,
    currentWindow: true
}, tabs => {
    new QRCode(document.getElementById("qrcode"), {
        text: tabs[0].url,
        width: 100,
        height: 100
    });
});