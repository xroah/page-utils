let cancel: number | null = null;

const body = document.body;
const html = document.documentElement

export function cancelScroll() {
    if (cancel) {
        cancelAnimationFrame(cancel);
        cancel = null;
    }
}

function scrollTo(pos: number) {
    const max = body.scrollHeight - window.innerHeight;

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
        const sTop = html.scrollTop;
        const sLeft = html.scrollLeft;
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
        scrollTo(html.scrollTop - window.innerHeight + 50);
    },
    scrollDown() {
        scrollTo(html.scrollTop + window.innerHeight - 50)
    },
    scrollTop() {
        scrollTo(0);
    },
    scrollBottom() {
        scrollTo(body.scrollHeight - window.innerHeight);
    }
};