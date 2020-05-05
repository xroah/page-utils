import { DIR_TEXT_MAP } from "./constants";

export default {
    normal: {
        disabled: false,
        showTrack: true,
        showDir: true,
        showHint: true,
        enableGesture: true,
        expire: false, 
        expireSecond: 2, 
        minDis: 10
    },
    gesture: {
        actions: DIR_TEXT_MAP,
        showTrack: true,
        trackColor: "#1998ff",
        trackWidth: 5,
        trackOpacity: 1,
        showHint: true,
        hintBgColor: "#1998ff",
        hintTextColor: "#ffffff",
        hintOpacity: 1
    }
}