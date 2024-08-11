import { window, document } from '@tarojs/runtime';
import Taro from '@tarojs/taro';

// var self;

class Blob {
    arrayBuffer() {

    }
}

class FileReader {
    readAsDataURL(blob: Blob) {
    }
}
if (process.env.TARO_ENV === 'weapp') {
    // @ts-ignore
    self = window;
    window.Blob = Blob;
    window.FileReader = FileReader;
    
    window.devicePixelRatio = function () {
        return Taro.getSystemInfoSync().pixelRatio
    }
    window.innerWidth = function () {
        return Taro.getSystemInfoSync().windowWidth;
    }
    window.innerHeight = function () {
        return Taro.getSystemInfoSync();
    }
    window.matchMedia = function () {
        return {
            matches: false,
            addListener: () => { },
        };
    }
    if (typeof document.currentScript == "undefined") {
        document.currentScript = {
            src: "/",
            getAttribute: function () { },
        };
    }
}