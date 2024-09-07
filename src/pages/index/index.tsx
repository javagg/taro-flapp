import {
  // useAddToFavorites, useLoad,
   useReady,
  //  useResize, useShareAppMessage, useShareTimeline,
  // useUnload
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'
import { $ } from '@tarojs/extend'
import { window, createEvent } from '@tarojs/runtime'
import {
  createTaroCanvas, createTestCanvas, updateLogicalHtmlCanvasSize, testDrawToCanvas
} from '@/src/utils'

export default function Index() {

  useReady(async () => {
    console.log('Page loaded.');
    await ckload();

    const host = $('#host').get(0)

    const kit = window.flutterCanvasKit

    if (process.env.TARO_ENV !== 'h5') {
      const { windowWidth, windowHeight, pixelRatio } = await Taro.getWindowInfo()
      host.clientWidth = windowWidth
      host.clientHeight = windowHeight
      window.devicePixelRatio = pixelRatio
      const canlist = $('#canlist').get(0)
      const can = await createTaroCanvas(canlist, `display-canvas`, 'webgl2', host.clientWidth , host.clientHeight)
      window.displayCanvas = can
    }
    await flutter({
      assetBase: '/',
      fontFallbackBaseUrl: '/assets/fonts/',
      hostElement: host,
    });
  })

  // useResize(async (payload) => {
  //   console.log(`resize: ${JSON.stringify(payload)}`)
  // })

  // useShareAppMessage(async (payload) => { return {} })

  // useShareTimeline(() => { return {} })

  // useAddToFavorites((payload) => { return {} })

  // Taro.onWindowResize(res => {
  //   const { size } = res;
  //   console.log(res)
  //   window.trigger("resize", createEvent("resize"))
  // })

  // useLoad(async (param) => {
  //   let res = await Taro.getSystemInfo();
  //   console.log(res.windowHeight)

  //   Taro.onKeyboardHeightChange(res => {
  //     console.log(res)
  //   })
  // })

  // useUnload(async () => {
  //   Taro.offKeyboardHeightChange(res => {
  //     console.log(res)
  //   })
  // })

  if (process.env.TARO_ENV === 'h5') {
    return (
      <div id="host" style="width: 100%; height: 100%;" />
    )
  } else {
    return (
      <body>
        <div id="canlist"></div>
        <div id="host"
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
          onFocusOut={() => console.log('onFocusOut')} >
        </div>
      </body>
    )
  }
}
