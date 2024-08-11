import { useLoad, getApp } from '@tarojs/taro'
import './index.scss'
import { FlutterLoader } from '@/flutter'

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.');
    console.log(getApp());

    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: (init) => init.initializeEngine({
        renderer: 'html',
      }).then((runner) => {
        return runner.runApp();
      }),
    });
  })
}
