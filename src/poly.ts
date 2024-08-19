import { window, document, TaroElement, TaroEvent } from '@tarojs/runtime';
import Taro from '@tarojs/taro';
import { ReadableStream } from "web-streams-polyfill";
import { Blob, FileReader } from 'blob-polyfill';
// import ResizeObserver from 'resize-observer-polyfill';
import { MutationObserver } from './mutation-observer';

import fontManifest from '@/flapp/assets/FontManifest.json'
import fontData from '@/flapp/assets/fonts/MaterialIcons-Regular.otf'

class TaroCanvasElement extends TaroElement {
    backend?: any
    constructor() {
        super()
        this.tagName = "CANVAS"
        this.nodeName = "canvas"
    }
    getContext(type, attrs?) {
        this.backend ??= Taro.createOffscreenCanvas({
            type: "2d",
            // height: 
            // w
        });
        return this.backend?.getContext(type, attrs)
    }
}

if (process.env.TARO_ENV === 'weapp') {
    const orginalWindow = globalThis
    const orginalDocument = globalThis.document
    console.log("original window: %o", orginalWindow) // window
    console.log("original document: %o", orginalDocument) // document
    console.log(window) // taro window
    console.log(window.window) // window
    console.log(window.document) // taro document
    self = window
    console.log(self.window) // window
    self.window = window
    console.log(self.window) // taro window
    console.log(self.window.document) // taro document

    console.log(self.window.navigator.vendor)

    const oldCreateElement = self.window.document.createElement
    self.window.document.createElement = function (type: string) {
        const nodeName = type.toLowerCase()
        let element: TaroElement
        switch (true) {
            case nodeName === "canvas":
                element = new TaroCanvasElement()
                return element
            default:
                return oldCreateElement.call(this, ...arguments)
        }
        throw new Error("dead code")
    }

    self.window.Blob ??= Blob;
    self.window.ReadableStream ??= ReadableStream;
    self.window.FileReader ??= FileReader;
    self.window.devicePixelRatio ??= Taro.getSystemInfoSync().pixelRatio;
    self.window.innerWidth ??= Taro.getSystemInfoSync().windowWidth;
    self.window.matchMedia ??= function(query) {
        // const _highContrastMediaQueryString = '(forced-colors: active)'
        return { matches: false, addListener: () => {}, removeListener: () =>{} };
    };
    // self.window.MutationObserver ??= MutationObserver
    self.document.currentScript ??= { src: "/", getAttribute: function () { }, };
    self.document.querySelector ??= function () { }
    // self.document.querySelectorAll ??= function () { }

    self.document.fonts ??= globalThis.document.fonts
    self.document.head ??= globalThis.document.head

    self.document.execCommand ??= (commandId) => console.log(`TODO: implement this: ${commandId}`)

    TaroEvent.prototype.initEvent ??= function() {}
    TaroElement.prototype.append ??= function (param1) { this.appendChild(param1) }
    TaroElement.prototype.prepend ??= function (param1) { this.insertBefore(param1, this.firstChild) }
    TaroElement.prototype.querySelectorAll ??= () => [];
    TaroElement.prototype.attachShadow ??= (options) => new TaroElement();
    // TaroElement.prototype.getBoundingClientRect = () => {
    //     return {
    //         x: 0,
    //         y: 0,
    //         width: 100,
    //         height: 100,
    //         left: 0,
    //         top: 0,
    //         right: 100,
    //         bottom: 100,
    //     };
    // };
    self.window.TouchEvent ??= {};
    self.window.PointerEvent ??= {};
    self.window.dispatchEvent = () => true;

    console.log("Replace window.FontFace.prototype.load...")
    const oldLoad = self.window.FontFace.prototype.load
    self.window.FontFace.prototype.load = async function () {
        console.log("FontFace load nothing")
        console.log(fontData);
        const myFont = new self.window.FontFace(this.family, Uint8Array.from(atob(fontData), (m) => m.codePointAt(0)), );
        oldLoad.apply(myFont)
        return myFont;
    }

    self.window.fetch ??= async function (url, headers) {
        console.log(`Fetch from: ${url}`)
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