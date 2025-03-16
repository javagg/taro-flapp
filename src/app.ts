import { useLaunch } from '@tarojs/taro'
import './app.scss'
import { polyfill } from '@/src/poly'
// import { ckload } from './ck'

function App({ children }) {
  useLaunch(async () => {
    console.log('App launched.')
    await polyfill()
    // await ckload()
  })
  return children
}

export default App