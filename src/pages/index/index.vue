<template>
  <div>
    <div>
      <!-- <canvas id="weapp-2d" type="2d" width="300" height="300"/> -->
      <canvas id="weapp-webgl" type="webgl" width="300" height="300"/>
      <canvas id="weapp-webgl2" type="webgl2" width="300" height="300"/>
    </div>
    <div id="canlist"></div>
    <div id="host">
    </div>
  </div>
</template>

<script>
import './index.scss'
import Taro from '@tarojs/taro'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'
import { $ } from '@tarojs/extend'
import { window, document, createEvent } from '@tarojs/runtime'
import {
  createTaroCanvas, createCkSurface, createTaroOffscreenCanvas,
  // create2dOffscreenCanvas, createWebglOffscreenCanvas,
  createWebglOffscreenCanvasAndCkSurface,
  createWeappOffscreenCanvasAndCkSurface,
} from '@/src/utils'

export default {
  setup() {
  },
  async onReady() {
    console.log('Page loaded.');
    await ckload();

    const host = $('#host').get(0)
    const { windowWidth, windowHeight, pixelRatio } = await Taro.getWindowInfo()
    host.clientWidth = windowWidth
    host.clientHeight = windowHeight

    const kit = window.flutterCanvasKit
    const canlist = $('#canlist').get(0)

    for (const t of ['2d', 'webgl', 'webgl2']) {
      const can = await createTaroCanvas(canlist, `render-canvas-${t}`, t, 300, 300)
      const ctx = can.getContext(t)
      console.log("taro-ctx", ctx)
      if (t !== '2d') {
        const surface = kit.MakeWebGLCanvasSurface(`render-canvas-${t}`, null, { majorVersion: t === 'webgl2' ? 2 : 1 });
        console.log("surface", surface)
      }
    }

    // for (const t of [
    //   // '2d',
    //  'webgl',
    //   // 'webgl2'
    // ]) {
    //   const canvas = await new Promise((resolve) => {
    //     wx.createSelectorQuery().select(`#weapp-${t}`).fields({ node: true, size: true }).exec((res) =>
    //         {  console.log(res); return resolve(res[0].node)})
    // })
    //   const ctx = canvas.getContext(t)
    //   canvas["taro-canvas"] = canvas
    //   console.log(`weapp-ctx ${t}:`, ctx)
    //      const surface = kit.MakeWebGLCanvasSurface(canvas, null, { majorVersion: t === 'webgl2' ? 2 : 1 });
    //     console.log("surface", surface)
    // }

    // for (const t of [
    //   'webgl',
    //   'webgl2',
    // ]) {

    //   const offscreen = wx.createOffscreenCanvas({
    //     type: t, width: 300, height: 300
    //   })
    //   offscreen["taro-canvas"] = offscreen
    //   console.log(`offscreen ${t}:`, offscreen)
    //   const ctx = offscreen.getContext(t)
    //   console.log(`offscreen ctx ${t}:`, ctx)
    //     const surface = kit.MakeWebGLCanvasSurface(offscreen, null, { majorVersion: t === 'webgl2' ? 2 : 1 });
    //     console.log("surface", surface)
    // }

    // await createWeappOffscreenCanvasAndCkSurface()
    // await flutter({
    //   assetBase: '/',
    //   fontFallbackBaseUrl: '/assets/fonts/',
    //   hostElement: host,
    // });
  },
}
</script>
