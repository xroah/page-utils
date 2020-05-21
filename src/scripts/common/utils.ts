export function getOptions() {
    return new Promise(resolve => {
        chrome.storage.local.get(
            "options",
            obj => resolve(obj.options || { normal: {}, gesture: {} })
        );
    });
}

export function setOptions(options: any, callback?: () => void) {
    chrome.storage.local.set({ options }, callback);
}

export function getById(id: string) {
    return document.getElementById(id);
}

export function emulateTransitionEnd(el: HTMLElement, fn: () => void) {
    let called = false;
    const callback = () => {
        if (called) return;

        called = true;

        fn();
        cancel();
    };
    const cancel = () => {
        if (timer != undefined) {
            clearTimeout(timer);
        }

        el.removeEventListener("transitionend", callback);
    };
    const timer = setTimeout(callback, 300);

    el.addEventListener("transitionend", callback);

    return cancel;
}
