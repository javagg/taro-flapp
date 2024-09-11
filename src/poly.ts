import { window, TaroElement, TaroEvent, TaroNode, Style } from '@tarojs/runtime';
import Taro from '@tarojs/taro';
import { ReadableStream } from "web-streams-polyfill";
import { Blob, FileReader } from 'blob-polyfill';
import { MutationObserver } from '@tarojs/runtime';
import fontManifest from '@/flapp/assets/FontManifest.json'
import { $ } from '@tarojs/extend'

// export class MutationObserver {
  
//     constructor (callback: MutationCallback) {
//     }
  
//     public observe (...args: [any]) {
//         console.log("MutationObserver observe")
//     }
  
//     public disconnect () {
//         console.log("MutationObserver disconnect")       
//     }
  
//     public takeRecords () {
//         console.log("MutationObserver takeRecords")
//     }
// }

class TaroShadowRoot extends TaroElement {
    constructor() {
        super()
        this.nodeName = "shadowroot"
    }
}

class OffscreenCanvas extends TaroElement {
    _2d_backend: any
    _webgl_backend: any
    _webgl2_backend: any
    constructor(private w?, private h?) {
        super()
        this.tagName = "OFFSCREENCANVAS"
        this.nodeName = "offscreencanvas"
        this._webgl_backend = Taro.createOffscreenCanvas({
            type: "webgl", width: this.w, height: this.h
        })
        this._webgl2_backend = Taro.createOffscreenCanvas({
            type: "webgl2", width: this.w, height: this.h
        })
        this["taro-canvas-webgl"]= this._webgl_backend;
        this["taro-canvas-webgl2"]= this._webgl2_backend;
    }

    get width(): number {
        return this.w ?? 150
    }

    set width(val) {
        this.w = val
    }

    get height(): number {
        return this.h ?? 150
    }

    set height(val) {
        this.h = val
    }

    getContext(type: "2d" | "webgl" | "webgl2", attrs?) {
        console.log("offcanvas getContext", type)
        this.setAttribute("type", type)
        if (type === "2d") {
            this._2d_backend ??= Taro.createOffscreenCanvas({
                type: "2d", width: this.w, height: this.h
            })
            this._webgl_backend = null
            this._webgl2_backend = null
            return this._2d_backend.getContext("2d")
        }
        if (type === "webgl") {
            this._webgl2_backend = null
            return this._webgl_backend.getContext("webgl")
        }
        if (type === "webgl2") {
            this._webgl_backend = null
            return this._webgl2_backend.getContext("webgl2")
        }
        return null
    }
}

// class HTMLCanvasElement extends TaroElement {
//     w: number = 150
//     h: number = 150

//     constructor() {
//         super()
//         this.tagName = "CANVAS"
//         this.nodeName = "canvas"
//         // this._webgl_backend = Taro.createOffscreenCanvas({
//         //     type: "webgl", width: this.w, height: this.h
//         // })
//         // this._webgl2_backend = window.displayCanvas
//         // this["taro-canvas-webgl"]= this._webgl_backend;
//         // this["taro-canvas-webgl2"]=  window.displayCanvas;
//     }

//     set id(val) {
//         super.id = val
//         this.setAttribute("canvas-id", val)
//     }

//     get width(): number {
//         return this.w
//     }

//     set width(val) {
//         this.w = val
//     }

//     get height(): number {
//         return this.h
//     }

//     set height(val) {
//         this.h = val
//     }

//     getContext(type: "2d" | "webgl" | "webgl2", attrs?) {
//         // flutter is detecting the webgl version, just return a non-null object
//         // if ((type === 'webgl' || type === 'webgl2') && this.w === 1 && this.h === 1) return {}
//         const backend = this.getAttribute(`taro-canvas-${type}`)
//         return backend.getContext(type)
//     }
//     // getContext(type: "2d" | "webgl" | "webgl2", attrs?) {
//     //     console.log("HTMLCanvasElement getContext", type)
//     //     // flutter is detecting the webgl version, just return a non-null object
//     //     if ((type === 'webgl' || type === 'webgl2') && this.w === 1 && this.h === 1) return {}

//     //     const attr = `taro-canvas-${type}`
//     //     if (this.hasAttribute(attr)) {
//     //         const backend = this.getAttribute(attr)
//     //         const ctx = backend.getContext(type)
//     //         if (type === 'webgl2') {
//     //             console.log("patch ctx getParameter")
//     //             const originGetParameter = ctx.getParameter.bind(ctx);
//     //             ctx.getParameter = function (v) {
//     //               if (v === this.VERSION) {
//     //                 const value = originGetParameter(v);
//     //                 if (value.indexOf("OpenGL ES 3.2") > 0) {
//     //                   return "WebGL 2.0 (OpenGL ES 3.2 Chromium)";
//     //                 } else {
//     //                   return value;
//     //                 }
//     //               } else if (v === this.SHADING_LANGUAGE_VERSION) {
//     //                 const value = originGetParameter(v);
//     //                 if (value.indexOf("GLSL ES") < 0) {
//     //                   return "WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.2 Chromium)";
//     //                 }
//     //                 else if (value.indexOf("OpenGL ES 3.2") > 0) {
//     //                   return "WebGL GLSL ES 3.00 (OpenGL ES GLSL ES 3.2 Chromium)";
//     //                 } else {
//     //                   return value;
//     //                 }
//     //               }
//     //               return originGetParameter(v);
//     //             };
//     //         }
//     //         return ctx
//     //     }
//     // }

//     // setAttribute(qualifiedName: string, value: any): void {
//     //     super.setAttribute(qualifiedName, value)
//     //     if (qualifiedName === 'aria-hidden' && value === 'true') {
//     //     }
//     // }

//     remove(options) {
//         console.log("HTMLCanvasElement remove, options", options)
//         super.remove(options)
//     }
// }

class StyleEx extends Style {
    constructor(element) {
        super(element)
    }

    setProperty(propertyName: string, value?: string | null) {
        super.setProperty(propertyName, value)
        this._element.onStylePropertySet(propertyName, value)
    }

    getPropertyValue(propertyName: string) {
        const val = this._element.onStylePropertyValueGet(propertyName)
        return super.getPropertyValue(propertyName)
    }
}

const CAN_ID = "taro-canvas-webgl2"
class TaroCanvasElement extends TaroElement {
    backend: any
    proxied: any
    constructor() {
        super()
        this.tagName = "PROXYCANVAS"
        this.nodeName = "proxycanvas"
        this.backend = window.displayCanvas;
        this[CAN_ID] = this.backend
        this.style = new StyleEx(this)
        this.proxied = $(`#render-canvas-webgl2`).get(0)
    }

    onStylePropertySet(propertyName: string, value?: string | null) {
        this.proxied.style[propertyName] = value
    }

    onStylePropertyValueGet(propertyName: string) {
        return this.proxied.style[propertyName]
    }

    setAttribute(qualifiedName: string, value: any) {
        super.setAttribute(qualifiedName, value)
        if (qualifiedName === 'aria-hidden' && value === 'true') {
            console.log("aria-hidden = true")
        }
    }

    getAttribute(qualifiedName: string) {
        return super.getAttribute(qualifiedName)
    }

    get width(): number {
        return this.proxied.width
    }

    set width(val) {
        this.backend.width = val
        this.proxied.width = val
    }

    get height(): number {
        return this.proxied.height
    }

    set height(val) {
        this.backend.height = val
        this.proxied.height = val
    }

    getContext(type: "2d" | "webgl" | "webgl2", attrs?) {
        return this.backend.getContext(type, attrs)
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
    constructor() { super() }
    addListener() { }
    removeListener() { }
}

class ResizeObserver {
    observe(target: any, options?: any) { }
    unobserve(target: any) { }
    disconnect() { }
}

export async function readAsText(path: string) {
    const TMPFILE = "taro_temp.txt"
    const fs = Taro.getFileSystemManager()
    const tmp = Taro.env.USER_DATA_PATH + "/" + TMPFILE
    const ab = fs.readCompressedFileSync({ filePath: path, compressionAlgorithm: "br" })
    fs.writeFileSync(tmp, ab);
    const txt = fs.readFileSync(tmp, "utf8");
    fs.removeSavedFile({ filePath: tmp });
    return txt;
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
            "/assets/packages/cupertino_icons/assets/CupertinoIcons.ttf",
            "/assets/FontManifest.json"
        ]
        const orginalWindow = globalThis
        const orginalDocument = globalThis.document
        // console.log("original window: %o", orginalWindow) // window
        // console.log("original document: %o", orginalDocument) // document
        // console.log(window) // taro window
        // console.log(window.window) // window
        // console.log(window.document) // taro document
        self = window
        // console.log(self.window) // window
        self.window = window
        // console.log(self.window) // taro window
        // console.log(self.window.document) // taro document
        // console.log(self.window.navigator.vendor)
        self.window.devicePixelRatio = Taro.getSystemInfoSync().pixelRatio
        const oldCreateElement = self.window.document.createElement
        self.window.document.createElement = function (type: string) {
            const nodeName = type.toLowerCase()
            switch (true) {
                case nodeName === "canvas":
                    if (window.displayCanvas) {
                        console.log("canvas backend created, return proxy")
                        return new TaroCanvasElement()
                    }
                    break
                case nodeName === "offscreencanvas":
                    return new OffscreenCanvas()
            }
            return oldCreateElement.call(this, ...arguments)
        }
        // NOTE: to use multisurface rasterizer, vendor must not be google
        self.window.navigator.vendor = 'Apple Computer, Inc.'
        self.window.Blob ??= Blob;
        self.window.ReadableStream ??= ReadableStream;
        self.window.FileReader ??= FileReader;
        self.window.matchMedia ??= function (query) {
            return new MediaQueryList();
        };
        self.window.MutationObserver = MutationObserver
        self.document.currentScript = { src: "/" };
        self.document.execCommand ??= (commandId) => console.log(`TODO: implement this: ${commandId}`)
        TaroEvent.prototype.initEvent ??= function(type, bubbles, cancelable) {
            this.type = type
            this.bubbles = bubbles
            this.cancelable = cancelable
        }
        TaroElement.extend("append", function (param1) { this.appendChild(param1) })
        TaroElement.extend("prepend", function (param1) { this.insertBefore(param1, this.firstChild) })
        TaroElement.prototype.attachShadow = function(options) {
            const root = new TaroShadowRoot()
            this.appendChild(root)
            return root
        }
        TaroNode.extend("contains", function () {  return false; })
        const originalAddEventListener = TaroElement.prototype.addEventListener
        TaroElement.prototype.addEventListener = function (type: any, handler: any, options: any): void {
            console.log(`${this.tagName || this.nodeName} addEventListener ${type}`)
        //     if (this.tagName && this.tagName.toUpperCase() === "FLUTTER-VIEW") {
        //         if (type === "touchstart" || type === "pointerdown") {
        //             //   FlutterHostView.shared.ontouchstart = callback;
        //         } else if (type === "touchmove" || type === "pointermove") {
        //             //   FlutterHostView.shared.ontouchmove = callback;
        //         } else if (type === "touchend" || type === "pointercancel") {
        //             //   FlutterHostView.shared.ontouchend = callback;
        //         } else if (type === "touchcancel") {
        //             //   FlutterHostView.shared.ontouchcancel = callback;
        //         }
        //     } else if (this.tagName && this.tagName.toUpperCase() === "CANVAS") {
        //         if (type === "webglcontextlost") {
        //             //   if (!this.isOffscreenCanvas) {
        //             //     FlutterHostView.shared.onwebglcontextlost = () => {
        //             //       const event = new Event();
        //             //       event.target = this;
        //             //       callback(event);
        //             //     };
        //             //   }
        //             //   this.onwebglcontextlost = () => {
        //             //     const event = new Event();
        //             //     event.target = this;
        //             //     callback(event);
        //             //   }
        //         } else if (type === "webglcontextrestored") {
        //             //   if (!this.isOffscreenCanvas) {
        //             //     FlutterHostView.shared.onwebglcontextrestored = () => {
        //             //       const event = new Event();
        //             //       event.target = this;
        //             //       callback(event);
        //             //     };
        //             //   }
        //             //   this.onwebglcontextrestored = () => {
        //             //     const event = new Event();
        //             //     event.target = this;
        //             //     callback(event);
        //             //   }
        //         }
        //     }
            originalAddEventListener.call(this, type, handler, options)
        }
        TaroElement.extend("getBoundingClientRect", function () {
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
        })
        // TaroElement.prototype.sheet = {
        //     cssRules: [],
        //     insertRule: () => {
        //         return 0.0;
        //     },
        // };

        // const originalremoveEventListener = TaroElement.prototype.removeEventListener
        // TaroElement.prototype.removeEventListener = function (type: any, handler: any, sideEffect?: boolean): void {
        //     originalremoveEventListener.call(this, type, handler, sideEffect)
        // }

        self.window.TouchEvent = {};
        // PointerSupportDetector needs this defination.
        self.window.PointerEvent = {};
        self.window.dispatchEvent = () => true;
        self.window.ResizeObserver = ResizeObserver;
        // self.window.HTMLCanvasElement = HTMLCanvasElement;
        // self.window.OffscreenCanvas = OffscreenCanvas;

        async function fileExist(path: string) {
            return await new Promise((resolve) => {
                Taro.getFileSystemManager().getFileInfo({
                    filePath: path,
                    success: () => resolve(true),
                    fail: (r) => resolve(false),
                })
            })
        };

        self.window.fetch ??= async function (url: string, headers) {
            console.log(`Fetch from: ${url} with headers ${JSON.stringify(headers)}`)
            try {
                // if (url.startsWith("/assets/FontManifest.json")) {
                //     const str = JSON.stringify(fontManifest)
                //     const data = new TextEncoder().encode(str)
                //     return {
                //         ok: true,
                //         status: 200,
                //         arrayBuffer: () => data.buffer,
                //         text: async () => str,
                //         body: new ReadableStream({
                //             start(controller) {
                //                 controller.enqueue(data)
                //                 controller.close()
                //             }
                //         }),
                //     };
                // }
                if (["/assets/canvaskit/canvaskit.wasm", "/assets/canvaskit-nofont/canvaskit.wasm"].includes(url)) {
                    return {
                        ok: true,
                        status: 200,
                        arrayBuffer: async () => new TextEncoder().encode(`${url}.br`).buffer,
                    };
                } else if (ASSETS.includes(url)) {
                    const fs = Taro.getFileSystemManager();
                    const data = (await fileExist(url)) ?  fs.readFileSync(url) : fs.readCompressedFileSync({ filePath: `${url}.br`, compressionAlgorithm: "br" })
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
    console.log("runtime patched")
}