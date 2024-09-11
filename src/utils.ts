import { TaroElement, TaroEvent } from '@tarojs/runtime';
import Taro from '@tarojs/taro'

export const encodeImage = async (
    rawRgba,
    width: number,
    height: number,
    format,
    quality,
    callback
) => {
    const canvas = Taro.createOffscreenCanvas({ type: "2d", width, height });
    const context = canvas.getContext("2d");
    const imageData = context.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < rawRgba.length; i += 4) {
        data[i] = rawRgba[i];
        data[i + 1] = rawRgba[i + 1];
        data[i + 2] = rawRgba[i + 2];
        data[i + 3] = rawRgba[i + 3];
    }
    context.putImageData(imageData, 0, 0);
    return callback(canvas.toDataURL(format, quality));
};

export const encodeImageToFilePath = async (
    rawRgba,
    width: number,
    height: number,
    format,
    quality,
    filePath,
    callback
) => {
    let _filePath = filePath;
    if (_filePath.indexOf("/") < 0) {
        _filePath = wx.env.USER_DATA_PATH + "/" + filePath;
    }
    const canvas = Taro.createOffscreenCanvas({ type: "2d", width, height });
    const context = canvas.getContext("2d");
    const imageData = context.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < rawRgba.length; i += 4) {
        data[i] = rawRgba[i];
        data[i + 1] = rawRgba[i + 1];
        data[i + 2] = rawRgba[i + 2];
        data[i + 3] = rawRgba[i + 3];
    }
    context.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL(format, quality);
    Taro.getFileSystemManager().writeFileSync({
        filePath: _filePath,
        data: dataUrl.split("base64,")[1],
        encoding: "base64",
    });
};

export async function createCanvas(id: string) {
    return await new Promise((resolve) => {
        Taro.createSelectorQuery().select(`#${id}`).fields({ node: true, size: true }).exec((res) => resolve(res[0].node))
    })
}

export async function createTaroCanvas(host: TaroElement, id: string, type: '2d' | 'webgl' | 'webgl2', w: number, h: number) {
    let can = document.createElement("canvas");
    can.id = id
    can.setAttribute("type", type)
    host.appendChild(can)
    const canvas = await new Promise((resolve) => {
        Taro.createSelectorQuery().select(`#${id}`).fields({ node: true, size: true }).exec((res) => resolve(res[0].node))
    })
    can[`taro-canvas-${type}`] = canvas
    can.setAttribute(`taro-canvas-${type}`, canvas)
    return can
}

export async function createTestCanvas(host: any) {
    const kit = window.flutterCanvasKit
    for (const t of ['2d', 'webgl', 'webgl2']) {
        const can = await createTaroCanvas(host, `render-canvas-${t}`, t, 300, 300)
        if (t !== '2d') {
            const surface = kit.MakeWebGLCanvasSurface(`render-canvas-${t}`, null, { majorVersion: t === 'webgl2' ? 2 : 1 });
            console.log("surface", surface)
        }
    }
    for (const t of ['2d', 'webgl', 'webgl2']) {
        let offscreen = document.createElement("offscreencanvas");
        console.log(offscreen)
        if (t !== '2d') {
            const surface = kit.MakeWebGLCanvasSurface(offscreen, null, { majorVersion: t === 'webgl2' ? 2 : 1 });
            console.log("surface", surface)
            const paint = new kit.Paint();
            paint.setColor(kit.Color4f(0.9, 0, 0, 1.0));
            paint.setStyle(kit.PaintStyle.Fill);
            paint.setAntiAlias(true);
            const rr = kit.RRectXY(kit.LTRBRect(10, 60, 210, 260), 25, 15);
            function draw(c) {
                c.clear(kit.WHITE);
                c.drawRRect(rr, paint);
            }
            surface.drawOnce(draw);
        }
    }
}

export async function testDrawToCanvas() {
    const kit = window.flutterCanvasKit
    let offscreen = document.createElement("offscreencanvas");
    const surface = kit.MakeWebGLCanvasSurface(offscreen, null, { majorVersion: 2 });
    console.log("surface", surface)
    const paint = new kit.Paint();
    paint.setColor(kit.Color4f(0.9, 0, 0, 1.0));
    paint.setStyle(kit.PaintStyle.Fill);
    paint.setAntiAlias(true);
    const rr = kit.RRectXY(kit.LTRBRect(10, 60, 210, 260), 25, 15);
    function draw(c) {
        c.clear(kit.WHITE);
        c.drawRRect(rr, paint);

    }
    surface.drawOnce(draw);
    const ctx = offscreen.getContext("webgl2")
    const data = offscreen.getImageData(0, 0, 300, 150)
    console.log(data)
    const canvas = window.renderCanvas

    const ctx1 = canvas.getContext("2d")
    // const imageData = ctx.getImageData(0,0,300,150)
    // console.log(imageData)
    const imageData = ctx1.createImageData(100, 100);
    for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 0] = 190; // R 值
        imageData.data[i + 1] = 0; // G 值
        imageData.data[i + 2] = 210; // B 值
        imageData.data[i + 3] = 255; // A 值
    }
    ctx1.putImageData(imageData, 20, 20);
    // ctx.drawImage(img, canvas.width, canvas.height)
}

export function updateLogicalHtmlCanvasSize(canvas: any, pxw: number, pxh: number) {
    let dpr = window.devicePixelRatio
    dpr = 1
    const w = Math.round(pxw / dpr)
    const h = Math.round(pxh / dpr)
    canvas.width = pxw
    canvas.height = pxh
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
}

export function testDrawCanvas(canvas: any) {
    const kit = window.flutterCanvasKit
    const surface = kit.MakeWebGLCanvasSurface(canvas, null, { majorVersion: 2 });
    console.log("surface", surface)
    const paint = new kit.Paint();
    paint.setColor(kit.Color4f(0.9, 0, 0, 1.0));
    paint.setStyle(kit.PaintStyle.Fill);
    paint.setAntiAlias(true);
    const rr = kit.RRectXY(kit.LTRBRect(10, 60, 210, 260), 25, 15);
    function draw(c) {
        c.clear(kit.WHITE);
        c.drawRRect(rr, paint);
    }
    surface.drawOnce(draw);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function safeArea(ms: number) {
    const { safeArea, windowHeight, statusBarHeight } = await Taro.getSystemInfoAsync()
    if (safeArea) {
        safeAreaInsetTop = Math.max(safeArea.top, statusBarHeight)
        safeAreaInsetBottom = windowHeight - safeArea.bottom
    } else {
        safeAreaInsetTop = 0
        safeAreaInsetBottom = 0
    }
}

class PointerEvent extends TaroEvent {
    _ze: any

    tiltX = 0
    tiltY = 0
    // get altKey() { return false }
    ctrlKey = false
    // get metaKey() { return false }
    // get shiftKey() { return false }

    clientX: number
    clientY: number

    offsetX: number
    offsetY: number

    pageX: number
    pageY: number

    constructor(type, event) {
        super(type, {})
        this._ze = event
        this.button = this._ze.button
    }

    // get screenX() { }
    // get screenY() { }

    getModifierState(key) { return false }

    get pointerId() { return 0 }
    get buttons() { return this.type === "pointerstart" || this.type === "pointermove" ? 1 : 0 }
    get pointerType() { return "touch" }
}

function translateEvent(e: TaroEvent): PointerEvent {
    const touches = e.mpEvent.changedTouches
    const first = touches[0]
    let type = "";
    switch (e.type) {
        case "touchstart": type = "pointerdown"; break;
        case "touchmove": type = "pointermove"; break;
        case "touchend": type = "pointerup"; break;
        case "touchcancel": type = "pointercancel"; break;
        default: throw new Error("invalid touch event");
    }
    const pe = new PointerEvent(type, e)
    pe.clientX = first.clientX
    pe.clientY = first.clientY
    pe.offsetX = first.offsetX
    pe.offsetY = first.offsetY
    pe.pageX = first.pageX
    pe.pageY = first.pageY
    return pe;
}

export class FlutterEventConverter {
    setup(host: TaroElement, fv: () => TaroElement) {
        const handler = (e) => {
            const v = fv()
            if (v) v.dispatchEvent(translateEvent(e))
        }
        host.addEventListener("touchstart", handler)
        host.addEventListener("touchend", handler)
        host.addEventListener("touchmove", handler)
        host.addEventListener("touchcancel", handler)
    }
}