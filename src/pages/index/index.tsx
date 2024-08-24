import {
  useAddToFavorites, useLoad, useResize, useShareAppMessage, useShareTimeline,
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { $ } from '@tarojs/extend'
import { FlutterLoader } from '@/flutter'
import { createSignal } from 'solid-js'

// import CanvasKitInit from '@/assets/canvaskit/canvaskit'

// import CanvasKitInit from 'node_modules/canvaskit-wasm/bin/canvaskit';

export default function Index() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount((prev) => prev + 1);

  useLoad(async () => {
    console.log('Page loaded.');

    if (process.env.TARO_ENV === 'h5') {
    } else if (process.env.TARO_ENV === 'weapp') {
      globalThis.WebAssembly = globalThis.WXWebAssembly;
      const orignalInstantiate = globalThis.WXWebAssembly.instantiate
      globalThis.WXWebAssembly.instantiate = function (bufferSource, importObject) {
        const path = new TextDecoder().decode(bufferSource)
        console.log(`use wasm from path: ${path}`)
        return orignalInstantiate(path, importObject)
      }
    } else {
    }

    // let m = process.env.TARO_ENV === 'h5' ? await import('@/flapp/canvaskit/canvaskit') : await import('@/canvaskit/canvaskit')

    let m: any
    let CanvasKitInit: any
    // if (process.env.TARO_APP_NOFONT === "true") {
    m = await import('@/assets/canvaskit-nofont/canvaskit')
    CanvasKitInit = m.default
    // } else {
    // m = await import('node_modules/canvaskit-wasm/bin/canvaskit');
    // CanvasKitInit = m.default
    // }
    // let wasm_dir = process.env.TARO_APP_NOFONT === "true" ? "/assets/canvaskit-nofont" : "/assets/canvaskit"
    let wasm_dir = "/assets/canvaskit-nofont"
    // CanvasKitInit = m.default
    const kit = await CanvasKitInit({ locateFile: (file: string) => `${wasm_dir}/${file}` });
    // const mintex = await import('../../mitex')
    // mintex.install(kit);
    window.flutterCanvasKit = kit
    window.flutterCanvasKitLoaded = await Promise.resolve(kit);

    // const m = await import("@/canvaskit/pages/init");
    // const m = await import("../../canvaskit_init");
    // await m.default();
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: async (init) => {
        const host = $('#host').get(0)
        console.log(host)
        const runner = await init.initializeEngine({
          assetBase: '/',
          fontFallbackBaseUrl: '/assets/fonts/',
          // renderer: 'html',
          // hostElement: host,
        });
        runner.runApp();
      }
    });
  })

  useResize(async (payload) => {
    console.log(`resize: ${JSON.stringify(payload)}`)
  })

  useShareAppMessage(async (payload) => { return {} })

  useShareTimeline(() => { return {} })

  useAddToFavorites((payload) => { return {} })

  Taro.onWindowResize(res => {
    console.log(res)
  })

  if (process.env.TARO_ENV === 'h5') {
    return (
      <div id="host"></div>
    )
  } else {
    return (
      <body>
        <div id="host">
          <span>Count: {count()}</span>{" "}
          <button type="button" onClick={increment}>
            Increment
          </button>
          <div
            onTouchStart={() => console.log('onTouchStart')}
            onTouchMove={() => console.log('onTouchMove')}
            onTouchEnd={() => console.log('onTouchEnd')}
            onPointerUp={() => console.log('onPointerUp')}
            onPointerDown={() => console.log('onPointerDown')}
            onPointerOut={() => console.log('onPointerOut')}
            onPointerMove={() => console.log('onPointerMove')}
            onPointerOver={() => console.log('onPointerOver')}
            onKeyUp={() => console.log('onKeyUp')}
            onKeyDown={() => console.log('onKeyDown')}
            onFocusIn={() => console.log('onFocusIn')}
            onFocusOut={() => console.log('onFocusOut')}
          >hahhhhh</div>
        </div>
      </body>
    )
  }
}
