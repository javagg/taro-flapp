import { useLoad, getApp } from '@tarojs/taro'
import './index.scss'
import { FlutterLoader } from '@/flutter'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.');
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: async (init) => {
        const runner = await init.initializeEngine({
          assetBase: '/',
          renderer: 'html',
        });
        runner.runApp();
      }
    });
  })
}
