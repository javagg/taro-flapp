<template>
  <div>
    <div id="canlist">
      <canvas id="render" canvas-id="render" type="2d"  style="width: 100%; height: 100%"/>
    </div>
    <!-- <div style="width: 100%; height: 400px">
    </div> -->
   
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
  createTaroCanvas, createTestCanvas, updateLogicalHtmlCanvasSize, testDrawToCanvas
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

     // await createTaroCanvas(canlist, `render-canvas`, '2d', host.clientWidth , host.clientHeight)
    const canvas = await new Promise((resolve) => {
        Taro.createSelectorQuery().select(`#render`).fields({ node: true, size: true }).exec((res) => resolve(res[0].node))
    })
    window.renderCanvas = canvas
    console.log(canvas)
    updateLogicalHtmlCanvasSize(canlist, host.clientWidth, host.clientHeight)

    await testDrawToCanvas()
    // await flutter({
    //   assetBase: '/',
    //   fontFallbackBaseUrl: '/assets/fonts/',
    //   hostElement: host,
    // });
  },
}

</script>
