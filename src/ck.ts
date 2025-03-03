import {install} from './mitex'
// import { install } from './mtex/index'
// import {install} from 'mtex'

export async function ckload() {
  let m = await (
    process.env.TARO_APP_NOFONT === 'true'
      ? import('imports-loader?additionalCode=var%20fetch=window.fetch;var%20HTMLCanvasElement=window.HTMLCanvasElement;var%20OffscreenCanvas=window.OffscreenCanvas;!@/assets/canvaskit-nofont/canvaskit')
      : import('imports-loader?additionalCode=var%20fetch=window.fetch;var%20HTMLCanvasElement=window.HTMLCanvasElement;var%20OffscreenCanvas=window.OffscreenCanvas;!@/flapp/canvaskit/canvaskit')
  )

  let wasm_dir = process.env.TARO_APP_NOFONT === 'true' ? "/assets/canvaskit-nofont" : "/assets/canvaskit"
  const CanvasKitInit = m.default
  // const kit = await CanvasKitInit({ locateFile: (file) => `${wasm_dir}/${file}` })
  const kit = await CanvasKitInit() // used when canvaskit shipped with flutter, good for h5

  if (process.env.TARO_ENV !== 'h5') {
    const oldGetWebGLContext = kit.GetWebGLContext
    kit.GetWebGLContext = function (canvas, attrs) {
      const t = attrs.majorVersion > 1 ? "webgl2" : "webgl"
      const can = canvas[`taro-canvas-${t}`]
      return oldGetWebGLContext(can, attrs)
    }
  }
  window.flutterCanvasKit = kit
  window.flutterCanvasKitLoaded = await Promise.resolve(kit)
  console.log("ck loaded")

  if (process.env.TARO_APP_NOFONT === 'true') {
    // install(kit, 1)
    install(kit, 1, [], {})
  }
}