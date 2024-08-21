import { window } from '@tarojs/runtime';
// if (process.env.TARO_ENV === 'weapp') { globalThis.WebAssembly =  globalThis.WXWebAssembly; }

export default async function() {
    let opts: any
    let CanvasKitInit: any
    if (process.env.TARO_ENV === 'h5') {
        const m = await import('../../../node_modules/canvaskit-wasm/bin/canvaskit')
        CanvasKitInit = m.default
        opts = { locateFile: (file: string) => `/assets/${file}` }
    } else if (process.env.TARO_ENV === 'weapp') {
        globalThis.WebAssembly =  globalThis.WXWebAssembly;
        // const m = await import('@/canvaskit/pages/canvaskit')
        const m = await import('../../../node_modules/canvaskit-wasm/bin/canvaskit')
        CanvasKitInit = m.default
        // console.log( m.default)
        const orignalInstantiate = globalThis.WXWebAssembly.instantiate
        globalThis.WXWebAssembly.instantiate = function() {
            return orignalInstantiate.call(arguments)
        }
        opts = "canvaskit/pages/canvaskit.wasm.br"
    } else {
        opts = {}
    }
    const kit = await CanvasKitInit(opts);
    (window._flutter ??= {}).flutterCanvasKit = kit
    window._flutter.flutterCanvasKitLoaded = await Promise.resolve(kit)
}