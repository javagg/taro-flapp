import {
  useReady, useResize
} from '@tarojs/taro'
import './index.scss'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'
import { $ } from '@tarojs/extend'
import { window, createEvent } from '@tarojs/runtime'
import {
  createCanvas, FlutterEventConverter
} from '@/src/utils'

export default function Index() {

  useReady(async () => {
    console.log('Page loaded.');
    await ckload();

    const host = $('#host').get(0)

    if (process.env.TARO_ENV !== 'h5') {
      host.clientWidth = window.innerWidth // windowWidth
      host.clientHeight = window.innerHeight // windowHeight
      const can = await createCanvas("render-canvas-webgl2", 'webgl2')
      window.displayCanvas = can
    }

    // flutter web engine only recognizes pointer events for now.
    if (process.env.TARO_ENV === 'weapp') {
      new FlutterEventConverter().setup(host, () => {
        // we need to get the flutter view after flutter is initialized.
        return window.flutterView ??= $('flutter-view').get(0)
      })
    }

    await flutter({
      assetBase: '/',
      fontFallbackBaseUrl: '/assets/fonts/',
      hostElement: host,
    });
  })

  useResize(async (payload) => {
    console.log(`resize: ${JSON.stringify(payload)}`)
  })

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
      <div id="host" style="height:100%;" />
    )
  } else {
    return (
      <body>
        <canvas id="render-canvas-webgl2" canvas-id="render-canvas-webgl2" type='webgl2' />
        <div id="host" />
      </body>
    )
  }
}
