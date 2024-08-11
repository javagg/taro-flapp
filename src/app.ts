
import { ParentProps } from 'solid-js'
import { useLaunch } from '@tarojs/taro'

import './app.scss'

function App({ children }: ParentProps) {
  useLaunch(() => {
    console.log('App launched.')
  })
  return children
}

export default App
