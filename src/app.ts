import { ParentProps } from 'solid-js'
import { useLaunch } from '@tarojs/taro'
import './app.scss'
import { polyfill } from '@/src/poly'

function App({ children }: ParentProps) {
  useLaunch(async () => {
    console.log('App launched.')
    await polyfill()
  })
  return children
}

export default App
