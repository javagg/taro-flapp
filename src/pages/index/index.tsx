import {
  useAddToFavorites, useLoad, useResize, useShareAppMessage, useShareTimeline,
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { $ } from '@tarojs/extend'
import { FlutterLoader } from '@/flutter'
import { createSignal } from 'solid-js'

export default function Index() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount((prev) => prev + 1);

  useLoad(async () => {
    console.log('Page loaded.');
    const m = await import("@/canvaskit/pages/init");
    await m.default();
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: async (init) => {
        const host = $('#host').get(0)
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

  Taro.onKeyboardHeightChange(res => {
    console.log(res.height)
  })

  Taro.onWindowResize(res => {
    console.log(res)
  })

  return (
    <body>
      <div>
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
