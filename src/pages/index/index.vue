<template>
  <div>
    <div id="canlist">
      <canvas id="displayCanvas" canvas-id="displayCanvas" type="webgl2" style="width: 100%; height: 100%;"/>
    </div>
    <div id="host"/>
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

    // const can = await createTaroCanvas(canlist, `render-canvas`, 'webgl2', host.clientWidth , host.clientHeight)
    // console.log(can)
    const canvas = await new Promise((resolve) => {
        Taro.createSelectorQuery().select(`#displayCanvas`).fields({ node: true, size: true }).exec((res) => resolve(res[0].node))
    })
    window.displayCanvas = canvas
    console.log(canvas)
    updateLogicalHtmlCanvasSize(canlist, host.clientWidth, host.clientHeight)

    // await createTestCanvas(canlist)
    // await testDrawToCanvas()
    await flutter({
      assetBase: '/',
      fontFallbackBaseUrl: '/assets/fonts/',
      hostElement: host,
    });
  },
}

</script>
