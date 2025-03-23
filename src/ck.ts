// import { install } from './mtex/index'

export async function ckload() {
  let m = await (
    process.env.TARO_APP_CANVASKIT_JS === 'true'
      ? import("@/src/mtex/index")
      : process.env.TARO_APP_NOFONT === 'true'
        ? import('@/assets/canvaskit-nofont/canvaskit')
        : import('@/flapp/canvaskit/canvaskit')
  )
  const CanvasKitInit = m.default
  const kit = await CanvasKitInit() // used when canvaskit shipped with flutter, good for h5
  console.log(kit)
  // if (process.env.TARO_ENV !== 'h5') {
  //   const oldGetWebGLContext = kit.GetWebGLContext
  //   kit.GetWebGLContext = function (canvas, attrs) {
  //     const t = attrs.majorVersion > 1 ? "webgl2" : "webgl"
  //     const can = canvas[`taro-canvas-${t}`]
  //     return oldGetWebGLContext(can, attrs)
  //   }
  // }
  window.flutterCanvasKit = kit
  window.flutterCanvasKitLoaded = await Promise.resolve(kit)
  console.log("ck loaded")
  // if (process.env.TARO_APP_NOFONT === 'true') {
  //   install(kit)
  // }
}