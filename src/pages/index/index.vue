<template>
  <body>
    <div id="canlist"></div>
    <div id="host">
    </div>
  </body>
</template>

<script>
import { ref } from 'vue'
import './index.scss'
import Taro from '@tarojs/taro'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'
import { $ } from '@tarojs/extend'
import { window, createEvent } from '@tarojs/runtime'

export default {
  setup() {
    const msg = ref('Hello world')
    return {
      msg
    }
  },
  async onReady() {
    console.log('Page loaded.');
    await ckload();

    const host = $('#host').get(0)
    const { windowWidth, windowHeight, pixelRatio } = await Taro.getWindowInfo()
    host.clientWidth = windowWidth
    host.clientHeight = windowHeight

    const kit = window.flutterCanvasKit
    if (process.env.TARO_ENV === 'weapp') {
      const canlist = $('#canlist').get(0)
      let can = document.createElement("canvas");
      can.id = "master"
      can.style.width = `${host.clientWidth}px`
      can.style.height = `${host.clientHeight}px`
      canlist.appendChild(can)
      await new Promise((resolve) => {
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

    const offscreen = Taro.createOffscreenCanvas({ type: 'webgl' })
    offscreen.is_taro_canvas = true
    const surface = kit.MakeWebGLCanvasSurface(offscreen, null, { majorVersion: 1 });
    console.log("offscreen", surface)

    await flutter({
      assetBase: '/',
      fontFallbackBaseUrl: '/assets/fonts/',
      hostElement: host,
    });
  },
}
</script>
