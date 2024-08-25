import {
  useAddToFavorites, useLoad, useReady, useResize, useShareAppMessage, useShareTimeline,
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

// import { createSignal } from 'solid-js'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'

import { $ } from '@tarojs/extend'


export default function Index() {
  // const [count, setCount] = createSignal(0);
  // const increment = () => setCount((prev) => prev + 1);

  useReady(async () => {
    console.log('Page loaded.');
    await ckload();

    // const host = $('#host').get(0)
    // await flutter({
    //   assetBase: '/',
    //   fontFallbackBaseUrl: '/assets/fonts/',
    //   hostElement: host,
    // });

    const kit = window.flutterCanvasKit
    console.log(kit)

    const host = $('#host').get(0)
    // console.log("host", host)
    let div = document.createElement("canvas");
    div.setAttribute("width", "300");
    div.setAttribute("height", "300");
    div.setAttribute("id", "cav");
    // const newtext = document.createTextNode("一些文本");
    // newDiv.append(newtext);
    host.appendChild(div)

    const surface = kit.MakeCanvasSurface("cav");
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
  })

  useResize(async (payload) => {
    console.log(`resize: ${JSON.stringify(payload)}`)
  })

  useShareAppMessage(async (payload) => { return {} })

  useShareTimeline(() => { return {} })

  useAddToFavorites((payload) => { return {} })

  Taro.onWindowResize(res => {
    console.log(res)
  })

  if (process.env.TARO_ENV === 'h5') {
    return (
      <div id="host" style="width: 100%; height: 100%;" />
    )
  } else {
    return (
      <body>
        <div id="host" style="width: 100%; height: 100%;"
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
