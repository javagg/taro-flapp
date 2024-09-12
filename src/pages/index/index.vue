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
import { window } from '@tarojs/runtime'
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
    const { windowWidth, windowHeight, pixelRatio, statusBarHeight } = await Taro.getWindowInfo()
    host.style.top = statusBarHeight
    host.clientWidth = window.innerWidth // windowWidth
    host.clientHeight = window.innerHeight - statusBarHeight // windowHeight
    window.devicePixelRatio = pixelRatio

    // const kit = window.flutterCanvasKit
    // const canlist = $('#canlist').get(0)
    // const can = await createTaroCanvas(canlist, `display-canvas`, 'webgl2', host.clientWidth , host.clientHeight)
    // window.displayCanvas = can
    // const ctx = can.getContext('webgl2')

    // updateLogicalHtmlCanvasSize(canlist, host.clientWidth, host.clientHeight)

    // await flutter({
    //   assetBase: '/',
    //   fontFallbackBaseUrl: '/assets/fonts/',
    //   hostElement: host,
    // });
  },
}

</script>
