export async function ckload() {
  let m = await (
    process.env.TARO_APP_NOFONT === 'true'
      ? import('imports-loader?additionalCode=var%20fetch=window.fetch;var%20HTMLCanvasElement=window.HTMLCanvasElement;var%20OffscreenCanvas=window.OffscreenCanvas;!@/assets/canvaskit-nofont/canvaskit')
      : import('imports-loader?additionalCode=var%20fetch=window.fetch;var%20HTMLCanvasElement=window.HTMLCanvasElement;var%20OffscreenCanvas=window.OffscreenCanvas;!../node_modules/canvaskit-wasm/bin/canvaskit')
  )

  let wasm_dir = process.env.TARO_APP_NOFONT === 'true' ? "/assets/canvaskit-nofont" : "/assets/canvaskit"
  const CanvasKitInit = m.default
  const kit = await CanvasKitInit({ locateFile: (file: string) => `${wasm_dir}/${file}` })

  const oldGetWebGLContext = kit.GetWebGLContext
  kit.GetWebGLContext = function(canvas, attrs) {
    const t = attrs.majorVersion > 1 ? "webgl2" : "webgl"
    const can = canvas[`taro-canvas-${t}`]
    return oldGetWebGLContext(can, attrs)
  }
  // if (process.env.TARO_APP_MINTEX === 'true') { (await import('@/src/mitex')).install(kit) }
  window.flutterCanvasKit = kit
  window.flutterCanvasKitLoaded = await Promise.resolve(kit)
  console.log("ck loaded")
}