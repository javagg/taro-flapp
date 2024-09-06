<template>
  <div>
    <div id="canlist"/>
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

    const can = await createTaroCanvas(canlist, `render-canvas`, 'webgl2', host.clientWidth , host.clientHeight)
    canlist.removeChild(can)
    host.appendChild(can)
    const a = $('#render-canvas').get(0)
    console.log(host.childNodes[0].getContext('webgl2'))
    // console.log(can)
    // const canvas = await new Promise((resolve) => {
    //     Taro.createSelectorQuery().select(`#displayCanvas`).fields({ node: true, size: true }).exec((res) => resolve(res[0].node))
    // })
    // window.displayCanvas = canvas
    // console.log(canvas)
    // updateLogicalHtmlCanvasSize(canlist, host.clientWidth, host.clientHeight)

    // await createTestCanvas(canlist)
    // await testDrawToCanvas()
    // await flutter({
    //   assetBase: '/',
    //   fontFallbackBaseUrl: '/assets/fonts/',
    //   hostElement: host,
    // });
  },
}

</script>
