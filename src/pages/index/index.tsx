import {
  useAddToFavorites, useLoad, useReady, useResize, useShareAppMessage, useShareTimeline,
  useUnload, SelectorQuery
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

// import { createSignal } from 'solid-js'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'

import { $ } from '@tarojs/extend'
import { window, TaroEvent, createEvent } from '@tarojs/runtime'

function wait2(milliseconds: number, cb) {

  cb()
  const start = new Date().getTime();
  while (true) {
    if (new Date().getTime() - start >= milliseconds) {
      // console.log("Good, looped for 2 seconds");
      break;
    }
  }
}

// let result:any
// function execSync(q: SelectorQuery, timeout: number = 1000): any {
//   result= null
//   const start = new Date().getTime();
//   q.exec((res) =>{ 
//     result = res
//     console.log("res:",result)
//     console.log(`used: ${new Date().getTime() - start} ms`)
//   })
//   while (true) {
//     // console.log("waiting...")
//     if (new Date().getTime() - start >= timeout) break;
//     if (result) break
//   }
//   return result
// }

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

    const host = $('#host').get(0)
    console.log("host", host)
    let div = document.createElement("canvas");
    div.id = "cav"
    div.style.width = "300px"
    div.style.height = "300px"
    host.appendChild(div)

    const kit = window.flutterCanvasKit
    Taro.createSelectorQuery()
      .select("#cav")
      .fields({
        node: true,
        size: true
      }).exec(async (res) => {
        let canvas = res[0].node;
        const surface = kit.MakeCanvasSurface(canvas, null, { majorVersion: 1 });
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
      });


    // const context = Taro.createCanvasContext("cav")
    // const a = context._context
    // console.log(a)
    // // console.log(context._context)
    // console.log(context)
    // context.setStrokeStyle("#00ff00")
    // context.setLineWidth(5)
    // context.rect(0, 0, 200, 200)
    // context.stroke()
    // context.setStrokeStyle("#ff0000")
    // context.setLineWidth(2)
    // context.moveTo(160, 100)
    // context.arc(100, 100, 60, 0, 2 * Math.PI, true)
    // context.moveTo(140, 100)
    // context.arc(100, 100, 40, 0, Math.PI, false)
    // context.moveTo(85, 80)
    // context.arc(80, 80, 5, 0, 2 * Math.PI, true)
    // context.moveTo(125, 80)
    // context.arc(120, 80, 5, 0, 2 * Math.PI, true)
    // context.stroke()
    // context.draw()
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
