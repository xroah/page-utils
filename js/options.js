function showMenu(evt) {
    let btn = evt.currentTarget;
    let aside = document.getElementById("aside");
    btn.classList.toggle("active");
    aside.classList.toggle("visible");
}

function initEvent() {
    let showMenuBtn = document.getElementById("showMenuBtn");
    showMenuBtn.addEventListener("click", showMenu);
    window.addEventListener("hashchange", handleHashChange);
}

function handleHashChange() {
    let btn = document.getElementById("showMenuBtn");
    updateView();
    //如果菜单显示则将其隐藏
    if (btn.classList.contains("active")) {
        showMenu({
            currentTarget: btn
        });
    }
}

function updateView(hash = location.hash) {
    let routerMap = {
        "#/basic": "basic",
        "#/gesture": "gesture",
        "#/about": "about"
    };
    let titleEl = document.getElementById("title");
    let viewId;
    let links = document.querySelectorAll("#nav .router-link");
    let currentView = document.querySelector(".view:not(.hidden)");
    if (hash in routerMap) {
        viewId = routerMap[hash];
    } else {
        viewId = "basic";
        hash = "#/basic";
    }
    if (currentView) {
        currentView.classList.add("hidden");
    }
    document.getElementById(viewId).classList.remove("hidden");
    for (let link of links) {
        let parent = link.parentNode;
        if (link.hash === hash) {
            parent.classList.add("active");
            titleEl.innerHTML = link.innerHTML;
        } else {
            parent.classList.remove("active");
        }
    }
}

function init() {
    initEvent();
    updateView();
}

init();