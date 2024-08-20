import { window } from '@tarojs/runtime';
if (process.env.TARO_ENV === 'weapp') { globalThis.WebAssembly =  globalThis.WXWebAssembly; }
import { CanvasKitInit } from './canvaskit1'
export default async function() {
    const kit =  await CanvasKitInit();
    (window._flutter ??= {}).flutterCanvasKit = kit
    window._flutter.flutterCanvasKitLoaded = await Promise.resolve(kit)
}