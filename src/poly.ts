// import { window, document } from '@tarojs/runtime';
import Taro from '@tarojs/taro';
import fontManifest from '@/flapp/assets/FontManifest.json'
import { ReadableStream } from "web-streams-polyfill";
import { Blob, FileReader } from 'blob-polyfill';

if (process.env.TARO_ENV === 'weapp') {
    self = globalThis

    if (typeof self.window.Blob === 'undefined') {
        console.log("Patch window.Blob...")
        self.window.Blob = Blob;
    }

    if (typeof self.window.ReadableStream === 'undefined') {
        console.log("Patch window.ReadableStream...")
        self.window.ReadableStream = ReadableStream;
    }

    if (typeof self.window.FileReader === 'undefined') {
        console.log("Patch window.FileReader...")
        self.window.FileReader = FileReader;
    }

    if (typeof self.window.devicePixelRatio === 'undefined') {
        console.log("Patch window.devicePixelRatio...")
        self.window.devicePixelRatio = () => Taro.getSystemInfoSync().pixelRatio;
    }

    if (typeof self.window.innerWidth === 'undefined') {
        console.log("Patch window.innerWidth...")
        self.window.innerWidth = () => Taro.getSystemInfoSync().windowWidth;
    }

    if (typeof self.window.matchMedia === 'undefined') {
        console.log("Patch window.matchMedia...")
        self.window.matchMedia = function () {
            return {
                matches: false,
                addListener: () => { },
            };
        };
    }

    if (typeof document.currentScript === "undefined") {
        console.log("Patch document.currentScript...")
        document.currentScript = {
            src: "/",
            getAttribute: function () { },
        };
    }

    // if (typeof self.document.querySelector === "undefined") {
    //     console.log("Patch document.querySelector...")
    //     self.document.querySelector = function () { }
    // }

    self.window.FontFace.prototype.load =  async function() {
        console.log("FontFace load nothing")
        return {}
    }

    if (typeof self.window.fetch === "undefined") {
        console.log("Patch window.fetch...")
        self.window.fetch = async function (url, headers) {
            console.log(url)
            if (url.startsWith("/assets/FontManifest.json")) {
                return {
                    ok: true,
                    status: 200,
                    body: new ReadableStream({
                        start(controller) {
                            controller.enqueue(new TextEncoder().encode(JSON.stringify(fontManifest)))
                            controller.close()
                        }
                    }),
                };
            }
        }
    }
}