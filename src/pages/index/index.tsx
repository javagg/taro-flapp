import { useLoad, } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { FlutterLoader } from '@/flutter'
import Taro from '@tarojs/taro'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.');
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: async (init) => {
        Taro.createSelectorQuery().select('#host').fields({}).exec(async function(res){
          console.log(res)
          const host = res[0]
          console.log(host)
          const runner = await init.initializeEngine({
            assetBase: '/',
            renderer: 'html',
            hostElement: host,
          });
          runner.runApp();
        });
      }
    });
  })

  return (
    <View class="index">
      <div>ok</div>
      <flutter-host-view></flutter-host-view>
      <View id="host">hello</View>
    </View>
  )
}
