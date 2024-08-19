import { useLoad, } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { FlutterLoader } from '@/flutter'
import Taro from '@tarojs/taro'
import { $ } from '@tarojs/extend'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.');
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: async (init) => {
        const host = $('#host')[0]
        console.log(host.tagName)
        const runner = await init.initializeEngine({
          assetBase: '/',
          renderer: 'html',
          hostElement: host,
        });
        runner.runApp();
      }
    });
  })

  return (
      <div id="host"></div>
  )
}
