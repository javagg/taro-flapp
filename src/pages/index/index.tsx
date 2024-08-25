import {
  useAddToFavorites, useLoad, useResize, useShareAppMessage, useShareTimeline,
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './index.scss'

import { createSignal } from 'solid-js'
import { ckload } from '@/src/ck'
import { flutter } from '@/src/flutter'

export default function Index() {
  const [count, setCount] = createSignal(0);
  const increment = () => setCount((prev) => prev + 1);

  useLoad(async () => {
    console.log('Page loaded.');
    await ckload();
    await flutter();
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
      <div id="host"></div>
    )
  } else {
    return (
      <body>
        <div id="host">
          <span>Count: {count()}</span>{" "}
          <button type="button" onClick={increment}>
            Increment
          </button>
          <div
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
            onFocusOut={() => console.log('onFocusOut')}
          >hahhhhh</div>
        </div>
      </body>
    )
  }
}
