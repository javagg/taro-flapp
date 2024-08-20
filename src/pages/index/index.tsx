import { useLoad, } from '@tarojs/taro'
import './index.scss'
import { $ } from '@tarojs/extend'
import { FlutterLoader } from '@/flutter'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.');
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: async (init) => {
        const host = $('#host').get(0)
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
