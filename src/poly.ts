import { window, document } from '@tarojs/runtime';
import Taro from '@tarojs/taro';
import fontManifest from '@/flapp/assets/FontManifest.json'

class Blob {
    arrayBuffer() {

    }
}

class FileReader {
    readAsDataURL(blob: Blob) {
    }
}

if (process.env.TARO_ENV === 'weapp') {
    self = globalThis

    if (typeof self.window.Blob === 'undefined') {
        console.log("Patch window.Blob...")
        self.window.Blob = Blob;
    }

    if (typeof self.window.FileReader === 'undefined') {
        console.log("Patch window.FileReader...")
        self.window.FileReader = FileReader;
    }

    if (typeof self.window.devicePixelRatio === 'undefined') {
        console.log("Patch window.devicePixelRatio...")
        self.window.devicePixelRatio = () => Taro.getSystemInfoSync().pixelRatio;
    }

    if (typeof self.window.innerWidth === 'undefined') {
        console.log("Patch window.innerWidth...")
        self.window.innerWidth = () => Taro.getSystemInfoSync().windowWidth;
    }

    if (typeof self.window.matchMedia === 'undefined') {
        console.log("Patch window.matchMedia...")
        self.window.matchMedia =  function () {
            return {
                matches: false,
                addListener: () => { },
            };
        };
    }

    if (typeof document.currentScript === "undefined") {
        console.log("Patch document.currentScript...")
        document.currentScript = {
            src: "/",
            getAttribute: function () { },
        };
    }

    if (typeof document.querySelector === "undefined") {
        console.log("Patch document.querySelector...")
        document.querySelector = function () { }
    }

    if (typeof self.window.fetch === "undefined") {
        console.log("Patch window.fetch...")
        // console.log(fontManifest)
        self.window.fetch =  async function (url, headers) {
            if (url.startsWith("/assets/FontManifest.json")) {
                return { body: fontManifest, ok: true, status: 200 }

                // return new self.window.Response({
                
                //     body: JSON.stringify(fontManifest),
                // })
            }
        }
    }

        // self.window.fetch = async (url, headers) => {
        //     console.log("use fetch")
        //     return await Taro.request({
        //         url: url,
        //         header: headers,
        //     })
        // }
        // window.fetch = (url, options) => {
        //     options ??= {};
        //     return new Promise(async (resolve, reject) => {
        //     //   if (useMiniTex && url.startsWith("https://fonts.gstatic.com/s/")) {
        //     //     const responseData = {
        //     //       ok: true,
        //     //       status: 200,
        //     //       statusText: "OK",
        //     //       headers: {},
        //     //       arrayBuffer: async function () {
        //     //         return new ArrayBuffer(0);
        //     //       },
        //     //       text: async function () {
        //     //         return "";
        //     //       },
        //     //     };
        //     //     setTimeout(() => {
        //     //       resolve(responseData);
        //     //     }, 32);
        //     //     return;
        //     //   }
        //       if (
        //         url.startsWith("https://fonts.gstatic.com/s/") &&
        //         (url.endsWith(".otf") || url.endsWith(".ttf"))
        //       ) {
        //         url = "/assets/fonts/NotoSansSC-Regular.ttf";
        //       }
        //       if (isAsset(url)) {
        //         if (!(await isAssetExist(url))) {
        //           reject(new Error("404"));
        //           return;
        //         }
        //         let bodyReadDone = false;
        //         const body = {
        //           getReader: () => {
        //             return {
        //               read: async () => {
        //                 if (bodyReadDone) {
        //                   return {
        //                     done: true,
        //                   };
        //                 }
        //                 const arrayBuffer = await readAssetAsBuffer(url);
        //                 const result = {
        //                   done: false,
        //                   value: new Uint8Array(arrayBuffer),
        //                 };
        //                 bodyReadDone = true;
        //                 return result;
        //               },
        //             };
        //           },
        //         };
        //         const arrayBuffer = async () => {
        //           const originBuffer = await readAssetAsBuffer(url);
        //           const newBuffer = new ArrayBuffer(originBuffer.byteLength);
        //           const sourceArray = new Uint8Array(originBuffer);
        //           const targetArray = new Uint8Array(newBuffer);
        //           targetArray.set(sourceArray);
        //           return newBuffer;
        //         };
        //         const text = async () => {
        //           return await readAssetAsText(url);
        //         };
        //         const json = async () => {
        //           const localFileText = await text();
        //           return JSON.parse(localFileText);
        //         };

        //         const clone = async () => fetch(subPackageUrl, options);

        //         const responseData = {
        //           ok: true,
        //           status: 200,
        //           statusText: "OK",
        //           headers: {},
        //           arrayBuffer: arrayBuffer,
        //           text: text,
        //           json: json,
        //           clone: clone,
        //           body: body,
        //         };
        //         setTimeout(() => {
        //           resolve(responseData);
        //         }, 32);
        //         return;
        //       }
        //       Taro.request({
        //         url: url,
        //         method: options.method || "GET",
        //         data: options.body,
        //         header: options.headers,
        //         responseType: "arraybuffer",
        //         success: (response) => {
        //           const headers = response.header;
        //           const status = response.statusCode;
        //           const statusText = "OK"; // 在微信小程序中，没有直接获取状态文本的方法，因此使用'OK'作为默认值

        //           const abData = response.data;

        //           const text = async () => {

        //             const fs = Taro.getFileSystemManager();
        //             // const tmpFile = wx.env.USER_DATA_PATH + "/brtext_tmp";
        //             fs.writeFileSync(tmpFile, abData);
        //             const localFileText = fs.readFileSync(tmpFile, "utf8");
        //             Taro.removeSavedFile({
        //               filePath: tmpFile,
        //             });
        //             return localFileText;
        //           };

        //           const json = async () => {
        //             const localFileText = await text();
        //             return JSON.parse(localFileText);
        //           };

        //           const arrayBuffer = () => Promise.resolve(abData);

        //           const clone = () => fetch(url, options);

        //           const responseData = {
        //             ok: status >= 200 && status < 300,
        //             status: status,
        //             statusText: statusText,
        //             headers: headers,
        //             text: text,
        //             json: json,
        //             clone: clone,
        //             arrayBuffer: arrayBuffer,
        //           };

        //           resolve(responseData);
        //         },
        //         fail: (error) => {
        //           reject(error);
        //         },
        //       });
        //     });
        // };
    // }
}