let cancel: number | null = null;

export function cancelScroll() {
    if (cancel) {
        cancelAnimationFrame(cancel);
        cancel = null;
    }
}

function scrollTo(pos: number) {
    const max = document.body.scrollHeight - window.innerHeight;

    if (max < 0) {
        return
    }

    if (pos < 0) {
        pos = 0;
    } else if(pos > max) {
        pos = max;
    }

    const scroll = () => {
        const THRESHOLD = 10;
        const sTop = document.documentElement.scrollTop;
        const sLeft = document.documentElement.scrollLeft;
        const dis = pos - sTop;
        let speed = Math.floor((pos - sTop) / 10);
        
        if (Math.abs(speed) > 0) {
            cancel = requestAnimationFrame(scroll);

            if (Math.abs(dis) < THRESHOLD * 10) {
                speed = dis < 0 ? -10 : 10;
            }

            window.scrollTo(sLeft, sTop + speed);
        } else {
            window.scrollTo(sLeft, pos);
        }
    };

    cancelScroll();
    scroll();

    return this;
}

export default {
    back() {
        history.back()
    },
    forward() {
        history.forward();
    },
    refresh() {
        location.reload();
    },
    scrollUp() {
        scrollTo(document.documentElement.scrollTop - window.innerHeight + 50);
    },
    scrollDown() {
        scrollTo(document.documentElement.scrollTop + window.innerHeight - 50)
    },
    scrollTop() {
        scrollTo(0);
    },
    scrollBottom() {
        scrollTo(document.body.scrollHeight - window.innerHeight);
    }
};