import { useLaunch } from '@tarojs/taro'
import './app.scss'
import { polyfill } from '@/src/poly'

function App({ children }) {
  useLaunch(async () => {
    console.log('App launched.')
    await polyfill()
  })
  return children
}

export default App

// import { createApp } from 'vue'
// import { polyfill } from '@/src/poly'

// const app = createApp({

//   async onLaunch () {
//     console.log('App onLaunch.')
//     await polyfill()
//   },
// })

// export default app