import { useLoad, } from '@tarojs/taro'
import './index.scss'
import { $ } from '@tarojs/extend'
import { FlutterLoader } from '@/flutter'

export default function Index() {
  useLoad(async () => {
    console.log('Page loaded.');
    const m = await import("@/canvaskit/pages/init");
    await m.default();
    // console.log(m.default);
    // console.log(CanvasKitInit)
    (window._flutter ??= {}).loader ??= new FlutterLoader();
    window._flutter.loader.load({
      onEntrypointLoaded: async (init) => {
        const host = $('#host').get(0)
        host.append($('<div>item</div>'))
        console.log("Aaa")
        const runner = await init.initializeEngine({
          assetBase: '/',
          fontFallbackBaseUrl: '/assets/fonts/',
          // renderer: 'html',
          // hostElement: host,
        });
        runner.runApp();
      }
    });
  })

  return (
      <div id="host"></div>
  )
}
