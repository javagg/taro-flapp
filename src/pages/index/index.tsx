import {
  useReady,
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'
import { $ } from '@tarojs/extend'
import { window } from '@tarojs/runtime'
import {
  createCanvas,
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
        <canvas id="render-canvas-webgl2" canvas-id="render-canvas-webgl2" type='webgl2' />
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
