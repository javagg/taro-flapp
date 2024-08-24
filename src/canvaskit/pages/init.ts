export default async function() {
    let CanvasKitInit: any
    if (process.env.TARO_ENV === 'h5') {
    } else if (process.env.TARO_ENV === 'weapp') {
        globalThis.WebAssembly =  globalThis.WXWebAssembly;
        const orignalInstantiate = globalThis.WXWebAssembly.instantiate
        globalThis.WXWebAssembly.instantiate = function(bufferSource, importObject) {
            const path = new TextDecoder().decode(bufferSource)
            console.log(`use wasm from path: ${path}`)
            return orignalInstantiate(path, importObject)
        }
    } else {
    }
    let m: any
    if (process.env.TARO_ENV === 'h5') {
        m = await import('@/flapp/canvaskit/canvaskit')
    } else  {
        m = await import('@/canvaskit/canvaskit')
    }
    CanvasKitInit = m.default
    const kit = await CanvasKitInit({ locateFile: (file: string) => `/assets/${file}` });
    const mintex = await import('../../mitex')
    mintex.install(kit);
    window.flutterCanvasKit = kit
    window.flutterCanvasKitLoaded = await Promise.resolve(kit)
}