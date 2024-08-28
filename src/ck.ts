export async function ckload() {
  let m = await (
    process.env.TARO_APP_NOFONT === 'true'
      ? import('@/assets/canvaskit-nofont/canvaskit')
      : import('../node_modules/canvaskit-wasm/bin/canvaskit')
  )

  let wasm_dir = process.env.TARO_APP_NOFONT === 'true' ? "/assets/canvaskit-nofont" : "/assets/canvaskit"
  const CanvasKitInit = m.default
  const kit = await CanvasKitInit({ locateFile: (file: string) => `${wasm_dir}/${file}` })
  // if (process.env.TARO_APP_MINTEX === 'true') { (await import('@/src/mitex')).install(kit) }
  window.flutterCanvasKit = kit
  window.flutterCanvasKitLoaded = await Promise.resolve(kit)
}