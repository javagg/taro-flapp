import { window, TaroElement, TaroEvent, TaroNode, PROPS, OBJECT, DATASET, STYLE } from '@tarojs/runtime';
import Taro from '@tarojs/taro';
import { ReadableStream } from "web-streams-polyfill";
import { Blob, FileReader } from 'blob-polyfill';
import { MutationObserver } from './mutation-observer';
import fontManifest from '@/flapp/assets/FontManifest.json'

export function cloneNode (this: TaroNode, isDeep = false) {
    const document = this.ownerDocument
    let newNode
  
    if (this.nodeType === 1 /*NodeType.ELEMENT_NODE*/ ) {
      newNode = document.createElement(this.nodeName)
    } else if (this.nodeType === 3  /*NodeType.TEXT_NODE*/) {
      newNode = document.createTextNode('')
    }
  
    for (const key in this) {
      const value: any = this[key]
      // eslint-disable-next-line valid-typeof
      if ([PROPS, DATASET].includes(key) && typeof value === OBJECT) {
        newNode[key] = { ...value }
      } else if (key === '_value') {
        newNode[key] = value
      } else if (key === STYLE) {
        newNode.style._value = { ...value._value }
        newNode.style._usedStyleProp = new Set(Array.from(value._usedStyleProp))
      }
    }
  
    if (isDeep) {
      newNode.childNodes = this.childNodes.map(node => (node as any).cloneNode(true))
    }
  
    return newNode
  }

class TaroCanvasElement extends TaroElement {
    backend?: any
    // ctx?: any

    constructor() {
        super()
        this.tagName = "CANVAS"
        this.nodeName = "canvas"
    }

    getContext(type, attrs?) {
        if (type === '2d') 
            throw new Error('not supported')
        if (type === "webgl2") {
            type = "webgl"
            console.warn("webgl2 not supported in weapp")
        }
        this.ctx ??= Taro.createOffscreenCanvas({ type: type, ...attrs });
        let c = this.ctx?.getContext(type)
        c.__proto__ = WebGLRenderingContext.prototype
        return c
    }
    setAttribute(qualifiedName: string, value: any): void {
        super.setAttribute(qualifiedName, value)
        if (qualifiedName === 'aria-hidden') {

        }
    }
}

class TaroTextAreaElement extends TaroElement {
    constructor() {
        super()
        this.tagName = "TEXTAREA"
        this.nodeName = "textarea"
    }
}

class TaroInputElement extends TaroElement {
    constructor() {
        super()
        this.tagName = "INPUT"
        this.nodeName = "input"
    }
}

class TaroFormElement extends TaroElement {
    constructor() {
        super()
        this.tagName = "FORM"
        this.nodeName = "form"
    }
}

class MediaQueryList extends TaroNode {
    matches = false
    constructor() {  super() }
    addListener() { }
    removeListener() { }
}

class ResizeObserver {
    observe(target: any, options?: any) {}
    unobserve(target: any) {}
    disconnect() {}
}

async function polyWasm() {
    if (process.env.TARO_ENV === 'weapp') {
        globalThis.WebAssembly = globalThis.WXWebAssembly;
        const orignalInstantiate = globalThis.WXWebAssembly.instantiate
        globalThis.WXWebAssembly.instantiate = function (bufferSource, importObject) {
            const path = new TextDecoder().decode(bufferSource)
            console.log(`use wasm from path: ${path}`)
            return orignalInstantiate(path, importObject)
        }
    }
}

export async function polyfill() {
    if (process.env.TARO_ENV === 'weapp') {
        const ASSETS = [
            "/assets/fonts/MaterialIcons-Regular.otf",
            "/assets/fonts/roboto/v20/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
            "/assets/packages/cupertino_icons/assets/CupertinoIcons.ttf"
        ]
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
                    console.log("create TaroCanvasElement")
                    return new TaroCanvasElement()
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
        self.window.matchMedia ??= function (query) {
            // const _highContrastMediaQueryString = '(forced-colors: active)'
            return new MediaQueryList();
            
            // { matches: false, addListener: () => { }, removeListener: () => { } };
        };
        // self.window.MutationObserver ??= MutationObserver
        self.document.currentScript ??= { src: "/", getAttribute: function () { }, };
        self.document.querySelector ??= function () { }
        // self.document.querySelectorAll ??= function () { }

        self.document.fonts ??= globalThis.document.fonts
        self.document.head ??= globalThis.document.head

        self.document.execCommand ??= (commandId) => console.log(`TODO: implement this: ${commandId}`)

        TaroEvent.prototype.initEvent ??= function () { }
        TaroNode.extend('cloneNode', cloneNode)

        // TaroNode.prototype.cloneNode ??= function (deep: boolean) {
        //     // return cloneNodeDeep(this)
        //     // return  structuredClone(this);
        // }
        TaroElement.prototype.append ??= function (param1) { this.appendChild(param1) }
        TaroElement.prototype.prepend ??= function (param1) { this.insertBefore(param1, this.firstChild) }
        TaroElement.prototype.querySelectorAll ??= () => [];
        TaroElement.prototype.attachShadow ??= (options) => new TaroElement();

        const originalAddEventListener = TaroElement.prototype.addEventListener
        TaroElement.prototype.addEventListener = function (type: any, handler: any, options: any): void {
            console.log(`${this.tagName} addEventListener ${type}`)
            if (this.tagName === "flutter-view") {
                if (type === "touchstart" || type === "pointerdown") {
                    //   FlutterHostView.shared.ontouchstart = callback;
                } else if (type === "touchmove" || type === "pointermove") {
                    //   FlutterHostView.shared.ontouchmove = callback;
                } else if (type === "touchend" || type === "pointercancel") {
                    //   FlutterHostView.shared.ontouchend = callback;
                } else if (type === "touchcancel") {
                    //   FlutterHostView.shared.ontouchcancel = callback;
                }
            } else if (this.tagName === "canvas") {
                if (type === "webglcontextlost") {
                    //   if (!this.isOffscreenCanvas) {
                    //     FlutterHostView.shared.onwebglcontextlost = () => {
                    //       const event = new Event();
                    //       event.target = this;
                    //       callback(event);
                    //     };
                    //   }
                    //   this.onwebglcontextlost = () => {
                    //     const event = new Event();
                    //     event.target = this;
                    //     callback(event);
                    //   }
                } else if (type === "webglcontextrestored") {
                    //   if (!this.isOffscreenCanvas) {
                    //     FlutterHostView.shared.onwebglcontextrestored = () => {
                    //       const event = new Event();
                    //       event.target = this;
                    //       callback(event);
                    //     };
                    //   }
                    //   this.onwebglcontextrestored = () => {
                    //     const event = new Event();
                    //     event.target = this;
                    //     callback(event);
                    //   }
                }
            }
            originalAddEventListener.call(this, type, handler, options)
        }
        TaroElement.prototype.getBoundingClientRect ??= function () {
            // throw new Error("not implemented")
            return {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                left: 0,
                top: 0,
                right: 100,
                bottom: 100,
            };
        }
        TaroElement.prototype.sheet = {
            cssRules: [],
            insertRule: () => {
                return 0.0;
            },
        };

        const originalremoveEventListener = TaroElement.prototype.removeEventListener
        TaroElement.prototype.removeEventListener = function (type: any, handler: any, sideEffect?: boolean): void {
            originalremoveEventListener.call(this, type, handler, sideEffect)
        }

        self.window.TouchEvent ??= {};
        self.window.PointerEvent ??= {};
        self.window.dispatchEvent = () => true;
        self.window.ResizeObserver ??= ResizeObserver;
        
        // console.log("Replace window.FontFace.prototype.load...")
        // const oldLoad = self.window.FontFace.prototype.load
        // self.window.FontFace.prototype.load = async function () {
        //     console.log("FontFace load nothing")
        //     console.log(fontData);
        //     const myFont = new self.window.FontFace(this.family, Uint8Array.from(atob(fontData), (m) => m.codePointAt(0)),);
        //     oldLoad.apply(myFont)
        //     return myFont;
        // }
        self.window.fetch ??= async function (url: string, headers) {
            console.log(`Fetch from: ${url} with headers ${JSON.stringify(headers)}`)
            try {
                if (url.startsWith("/assets/FontManifest.json")) {
                    const str = JSON.stringify(fontManifest)
                    const data = new TextEncoder().encode(str)
                    // return {}
                    return {
                        ok: true,
                        status: 200,
                        arrayBuffer: () => data.buffer,
                        text: async () => str,
                        body: new ReadableStream({
                            start(controller) {
                                controller.enqueue(data)
                                controller.close()
                            }
                        }),
                    };
                } else if (["/assets/canvaskit/canvaskit.wasm", "/assets/canvaskit-nofont/canvaskit.wasm"].includes(url)) {
                    return {
                        ok: true,
                        status: 200,
                        arrayBuffer: async () => new TextEncoder().encode(`${url}.br`).buffer,
                    };
                } else if (ASSETS.includes(url)) {
                    const fs = Taro.getFileSystemManager();
                    const data = fs.readCompressedFileSync({ filePath: `${url}.br`, compressionAlgorithm: "br" })
                    return {
                        ok: true,
                        status: 200,
                        arrayBuffer: async () => data,
                        body: new ReadableStream({
                            start(controller) {
                                controller.enqueue(new Uint8Array(data))
                                controller.close()
                            }
                        }),
                    };
                } else {
                    throw new Error("can't fetch")
                }
            } catch (e) {
                console.error(e)
                throw new Error(`my fetch error: ${e}`)
            }
        }
    }
    await polyWasm()
}