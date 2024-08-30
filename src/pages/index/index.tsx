import {
  useAddToFavorites, useLoad, useReady, useResize, useShareAppMessage, useShareTimeline,
  useUnload
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'
import { $ } from '@tarojs/extend'
import { window, createEvent } from '@tarojs/runtime'

export default function Index() {

  useReady(async () => {
    console.log('Page loaded.');
    await ckload();

    const kit = window.flutterCanvasKit
    if (process.env.TARO_ENV === 'weapp') {
      const canlist = $('#canlist').get(0)
      let can = document.createElement("canvas");
      can.id = "master"
      can.style.width = "300px"
      can.style.height = "300px"
      canlist.appendChild(can)
      await new Promise<void>((resolve) => {
        Taro.createSelectorQuery()
          .select("#master")
          .fields({
            node: true,
            size: true
          }).exec(async (res) => {
            let canvas = res[0].node;
            console.log(canvas)
            Object.defineProperty(canvas, 'is_taro_canvas', { value: true, writable: false, });
            window.displayCanvas = canvas
            const surface = kit.MakeWebGLCanvasSurface(canvas, null, { majorVersion: 1 });
            console.log(surface)
            const paint = new kit.Paint();
            paint.setColor(kit.Color4f(0.9, 0, 0, 1.0));
            paint.setStyle(kit.PaintStyle.Fill);
            paint.setAntiAlias(true);
            const rr = kit.RRectXY(kit.LTRBRect(10, 60, 210, 260), 25, 15);
            function draw(canvas) {
              canvas.clear(kit.WHITE);
              canvas.drawRRect(rr, paint);
            }
            surface.drawOnce(draw);
            resolve()
          });
      })
    }
    console.log(window.displayCanvas)

    const host = $('#host').get(0)
    const { windowWidth, windowHeight, pixelRatio } = await Taro.getWindowInfo()
    host.clientWidth = windowWidth
    host.clientHeight = windowHeight

    const offscreen = Taro.createOffscreenCanvas({ type: 'webgl' })
    offscreen.is_taro_canvas = true
    const surface = kit.MakeWebGLCanvasSurface(offscreen, null, { majorVersion: 1 });
    console.log("offscreen", surface)

    await flutter({
      assetBase: '/',
      fontFallbackBaseUrl: '/assets/fonts/',
      hostElement: host,
    });
  })

  useResize(async (payload) => {
    console.log(`resize: ${JSON.stringify(payload)}`)
  })

  useShareAppMessage(async (payload) => { return {} })

  useShareTimeline(() => { return {} })

  useAddToFavorites((payload) => { return {} })

  Taro.onWindowResize(res => {
    const { size } = res;
    console.log(res)
    window.trigger("resize", createEvent("resize"))
  })

  useLoad(async (param) => {
    let res = await Taro.getSystemInfo();
    console.log(res.windowHeight)

    Taro.onKeyboardHeightChange(res => {
      console.log(res)
    })
  })

  useUnload(async () => {
    Taro.offKeyboardHeightChange(res => {
      console.log(res)
    })
  })

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
