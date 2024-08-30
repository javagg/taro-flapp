import { window, TaroElement, TaroEvent, TaroNode, PROPS, OBJECT, DATASET, STYLE } from '@tarojs/runtime';
import Taro from '@tarojs/taro';
import { ReadableStream } from "web-streams-polyfill";
import { Blob, FileReader } from 'blob-polyfill';
import { MutationObserver } from './mutation-observer';
import fontManifest from '@/flapp/assets/FontManifest.json'
import { $ } from '@tarojs/extend'

export function cloneNode(this: TaroNode, isDeep = false) {
    const document = this.ownerDocument
    let newNode

    if (this.nodeType === 1 /*NodeType.ELEMENT_NODE*/) {
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

class CanvasRenderingContext2D {
    constructor(private canvas: Taro.OffscreenCanvas) {
    }
    putImageData(imageData: ImageData, dx, dy) {
        let d = this.canvas.getContext("webgl").getImageData()
        console.log(d)
        d.data = imageData.data
        // this.canvas.
        this.canvas.getContext('2d').putImageData(d, dx, dy)
    }
    putImageData(imageData, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
        // let d = this.canvas.getContext("webgl").getImageData()
        // console.log(d)
        // console.log(this.canvas)
        let d = this.canvas.createImageData()
        console.log(d)
        d.data = imageData.data
        this.canvas.getContext('2d').putImageData(d, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight)
    }
}

class WebGLRenderingContext {
}

class HTMLCanvasElement extends TaroElement {
    canvas: Taro.OffscreenCanvas
    // ctx: Taro.RenderingContext
    w: number = 150
    h: number = 150

    usedAsOffscreen = false

    constructor() {
        super()
        this.tagName = "CANVAS"
        this.nodeName = "canvas"
        // console.log(this.getAttribute("type"))
        // if (this.getAttribute("type") === "undefined") {
        this.setAttribute("type", "webgl")
        // }
        // let t = "webgl" //this.getAttribute("type") ?? "webgl"
        // let w = this.style.getPropertyValue("width") ?? 150
        // let h = this.style.getPropertyValue("height") ?? 150
        // console.log("cid",this.getAttribute("canvas-id"))
        // console.log(this.id)
        // let can = $(this.id).get(0)
        // console.log("can", can)
        // this.canvas = Taro.createOffscreenCanvas({
        //     type: t, width: w, height: h,
        //     // ...attrs
        // });

    }

    set id(val) {
        super.id = val
        this.setAttribute("canvas-id", val)
    }

    get width(): number {
        return this.w
    }

    set width(val) {
        this.w = val
    }

    get height(): number {
        return this.h
    }

    set height(val) {
        this.h = val
    }

    getContext(type: "2d" | "webgl" | "webgl2", attrs?) {
        console.log("getContext", type)
        if (type === '2d' || type === 'webgl') {
            this.canvas = Taro.createOffscreenCanvas({
                type: type, width: this.w, height: this.h
            })

            if (type === "webgl") {
                let taroCtx = this.canvas.getContext(type)
                console.log("taroCtx", taroCtx)
                 // WebGLRenderingContext.prototype =
                // Object.setPrototypeOf(WebGLRenderingContext.p, Object.getPrototypeOf(taroCtx))

                // console.log( taroCtx.getExtension)
                // console.log(taroCtx.constructor.prototype.__proto__)
                // taroCtx.constructor = WebGLRenderingContext
                // let cc = new WebGLRenderingContext()
                // console.log(cc)
                // console.log(cc instanceof WebGLRenderingContext)
                // cc = Object.assign(cc, taroCtx)
                // console.log(cc.getExtension)
                // cc.getExtension = taroCtx.getExtension
                //    WebGLRenderingContext.__proto__ = Object.create(taroCtx.__proto__, {
                // 如果不将 Rectangle.prototype.constructor 设置为 Rectangle，
                // 它将采用 Shape（父类）的 prototype.constructor。
                // 为避免这种情况，我们将 prototype.constructor 设置为 Rectangle（子类）。
                // constructor: {
                //   value: WebGLRenderingContext,
                //   enumerable: false,
                //   writable: true,
                //   configurable: true,
                // },
                return taroCtx
            };
            //   console.log("ccccc")
            //   let  cc = new WebGLRenderingContext()
            //   console.log(cc)
            //   console.log(cc instanceof WebGLRenderingContext)
            //   Object.assign(cc, taroCtx)
            //   console.log(cc)

            //    console.log(taroCtx)

            //    console.log(typeof taroCtx)
            //    console.log(typeof taroCtx.__proto__)
            //    let  cc = new WebGLRenderingContext()
            //    console.log(typeof cc)
            //    
            //    cc.__proto__ =  WebGLRenderingContext.__proto__
            //    console.log(cc instanceof WebGLRenderingContext)
            //    console.log(typeof cc)
            // WebGLRenderingContext.__proto__ = taroCtx.__proto__
            // let ctx = new WebGLRenderingContext()
            // Object.assign(ctx, taroCtx)
            // console.log(ctx instanceof WebGLRenderingContext)
            // return cc
        }
        return this.canvas.getContext(type)
    }
        // if (type === "webgl") {
        //     this.canvas = Taro.createOffscreenCanvas({
        //         type: type, width: this.w, height: this.h
        //     })
        //     // return new CanvasRenderingContext2D(this.canvas)
        //     return this.canvas.getContext(type)
        // }
        //     throw new Error('not supported')
        // if (type === "webgl2") {
        //     type = "webgl"
        //     console.warn("webgl2 not supported in weapp")
        // }
        // console.log("cid", this.getAttribute("canvas-id"))
        // console.log(this.id)

        // let res = offcan.getContext(type, attrs)
        // console.log(res)
        // let can = $(`#${this.id}`).get(0)

        // Taro.createSelectorQuery()
        //   .select(`#${this.id}`)  
        //   .fields({
        //     node: true,
        //     size: true
        //   })
        //   .exec(async (res) => {
        //     let can = res[0].node
        //     console.log("can", can)
        //   }
        // this.canvas ??= Taro.createOffscreenCanvas({
        //     type: type, width: this.w, height: this.h,
        //     ...attrs
        // });
        // console.log(this.canvas.width)
        // return res
        // if (type === "2d") {
        //     return new CanvasRenderingContext2D(this.canvas)
        // } else if (type === "webgl") {
        //     let res = this.canvas.getContext(type)
        //     res.__proto__ = WebGLRenderingContext.prototype
        //     // console.log(WebGLRenderingContext)
        //     // console.log( res instanceof WebGLRenderingContext)
        //     // console.log( typeof res)
        //     return res
        // }
    //     return null
    // }

setAttribute(qualifiedName: string, value: any): void {
    super.setAttribute(qualifiedName, value)
        if(qualifiedName === 'aria-hidden' && value === 'true') {
    this.usedAsOffscreen = true
}
    }
}

class ImageData {
    d: any
    w: number
    h: number

    constructor(data: any, width: number, height: number) {
        this.w = width
        this.h = height
        this.d = data
    }

    get data(): Uint8ClampedArray {
        return this.d;
    }

    get width(): number {
        return this.width

    }

    get height(): number { return this.height }
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
                    return new HTMLCanvasElement()
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
        };
        // self.window.MutationObserver ??= MutationObserver
        self.document.currentScript ??= { src: "/", getAttribute: function () { }, };
        self.document.querySelector ??= function () { }
        // self.document.querySelectorAll ??= function () { }
        self.document.fonts ??= globalThis.document.fonts
        self.document.head ??= globalThis.document.head
        self.document.execCommand ??= (commandId) => console.log(`TODO: implement this: ${commandId}`)

        const oldGetElementById = self.document.getElementById
        self.document.getElementById = function (idOrElement: any) {
            if (idOrElement.hasOwnProperty('is_taro_canvas') && idOrElement.is_taro_canvas) { console.log("return weapp canvas"); return idOrElement }
            return oldGetElementById.call(this, idOrElement)
        }
        TaroEvent.prototype.initEvent ??= function () { }
        TaroNode.extend('cloneNode', cloneNode)
        TaroElement.extend("append", function (param1) { this.appendChild(param1) })
        TaroElement.extend("prepend", function (param1) { this.insertBefore(param1, this.firstChild) })
        TaroElement.extend("querySelectorAll", () => [])
        TaroElement.extend("attachShadow", (options) => new TaroElement())
        // TaroElement.prototype.append ??= function (param1) { this.appendChild(param1) }
        // TaroElement.prototype.prepend ??= function (param1) { this.insertBefore(param1, this.firstChild) }
        // TaroElement.prototype.querySelectorAll ??= () => [];
        // TaroElement.prototype.attachShadow ??= (options) => new TaroElement();

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

        // TaroElement.prototype.getBoundingClientRect ??= function () {
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
        // PointerSupportDetector needs this defination.
        self.window.PointerEvent ??= {};
        self.window.dispatchEvent = () => true;
        self.window.ResizeObserver ??= ResizeObserver;
        self.window.HTMLCanvasElement = HTMLCanvasElement;
        self.window.CanvasRenderingContext2D = CanvasRenderingContext2D;
        self.window.ImageData = ImageData;

        // console.log("Replace window.FontFace.prototype.load...")
        // const oldLoad = self.window.FontFace.prototype.load
        // self.window.FontFace.prototype.load = async function () {
        //     console.log("FontFace load nothing")
        //     console.log(fontData);
        //     const myFont = new self.window.FontFace(this.family, Uint8Array.from(atob(fontData), (m) => m.codePointAt(0)),);
        //     oldLoad.apply(myFont)
        //     return myFont;
        // }
        async function fileExist(path: string) {
            const fs = Taro.getFileSystemManager();
            return await new Promise((resolve) => {
                fs.getFileInfo({
                    filePath: path,
                    success: () => resolve(true),
                    fail: () => resolve(false),
                })
            })
        };

        self.window.fetch ??= async function (url: string, headers) {
            console.log(`Fetch from: ${url} with headers ${JSON.stringify(headers)}`)
            try {
                if (url.startsWith("/assets/FontManifest.json")) {
                    const str = JSON.stringify(fontManifest)
                    const data = new TextEncoder().encode(str)
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