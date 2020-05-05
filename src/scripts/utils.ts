

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