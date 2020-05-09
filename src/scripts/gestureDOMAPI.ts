let cancel: number | null = null;

export function cancelScroll() {
    if (cancel) {
        cancelAnimationFrame(cancel);
        cancel = null;
    }
}

function scrollTo(pos: number) {
    const max = document.body.scrollHeight - window.innerHeight;
    if (pos < 0) {
        pos = 0;
    } else if(pos > max) {
        pos = max;
    }

    const scroll = () => {
        const sTop = document.documentElement.scrollTop;
        const dis = Math.floor((pos - sTop) / 10);
        const absDis = Math.abs(dis);
        let _dis = dis;
        
        if (absDis > 0) {
            cancel = requestAnimationFrame(scroll);

            if (absDis < 10) {
                _dis = dis < 0 ? -10 : 10;
            }

            window.scrollTo(0, sTop + _dis);
        } else {
            window.scrollTo(0, pos);
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
        scrollTo(document.documentElement.scrollTop - window.innerHeight);
    },
    scrollDown() {
        scrollTo(document.documentElement.scrollTop + window.innerHeight)
    },
    scrollTop() {
        scrollTo(0);
    },
    scrollBottom() {
        scrollTo(document.body.scrollHeight - window.innerHeight);
    }
};