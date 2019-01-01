import * as QRcode from "qrcode";

let img:any = document.getElementById("qrCode");

chrome.tabs.query({
    active: true,
    currentWindow: true
}, (tabs:Array<chrome.tabs.Tab>) => {
    QRcode.toDataURL(tabs[0].url, {
        width: 160,
        margin: 0
    },(error: Error, url: string) => {
        if (error) console.error(error);
        img.src = url;
    });
});