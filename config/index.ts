import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import CompressionPlugin from "compression-webpack-plugin"
import devConfig from './dev'
import prodConfig from './prod'
import path from 'path'

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'mySo',
    date: '2024-8-2',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {
    },
    copy: {
      patterns: [
        { from: 'flapp/build/web/assets', to: 'dist/assets' },
        { from: 'assets/fonts', to: 'dist/assets/fonts/roboto/v20' },
        // h5
        // { from: 'flapp/build/web/canvaskit/canvaskit.wasm', to: 'dist/assets/canvaskit' },
        { from: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm', to: 'dist/assets/canvaskit' },
        { from: 'assets/canvaskit-nofont/canvaskit.wasm', to: 'dist/assets/canvaskit-nofont' },
        // weapp
        // { from: 'flapp/build/web/canvaskit/canvaskit.wasm', to: 'dist/canvaskit/pages' },
        { from: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm', to: 'dist/canvaskit/pages' },
        { from: 'assets/canvaskit-nofont/canvaskit.wasm', to: 'dist/canvaskit-nofont/pages' },
      ],
      options: {
      }
    },
    alias: {
      '@/src': path.resolve(__dirname, '..', 'src'),
      '@/flapp': path.resolve(__dirname, '..', 'flapp', 'build', 'web'),
      '@/assets': path.resolve(__dirname, '..', 'assets'),
    },
    // framework: 'solid',
    framework: 'vue3',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: false,
      },
    },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    logger: {
      quiet: false, stats: true,
    },
    mini: {
      runtime: {
        enableCloneNode: true,
        enableMutationObserver: true,
        enableSizeAPIs: true,
      },
      optimizeMainPackage: {
        enable: true,
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      fontUrlLoaderOption: {
        limit: false,
        // generator: (content) => content.toString(),
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        chain.plugin('compression-webpack-plugin').use(CompressionPlugin, [{
          // include: "../flapp/build/web/assets",
          filename: "[path][base].br",
          algorithm: "brotliCompress",
          test: /\.(wasm|ttf|otf)$/,
          deleteOriginalAssets: true,
        }])
        chain.module
          .rule("/canvaskit\.js$/")
          .use("replace")
          .loader("./config/replace-loader")
          .options({
            arr: [
              // { search: 'typeof fetch', replace: 'typeof window.fetch', attr: 'g' },
              // { search: 'fetch(', replace: 'window.fetch(', attr: 'g' },
              // { search: 'typeof HTMLCanvasElement' , replace: 'typeof window.HTMLCanvasElement', attr: 'g' },
              // { search: 'instanceof HTMLCanvasElement' , replace: 'instanceof window.HTMLCanvasElement', attr: 'g' },
              // { search: 'new ImageData' , replace: 'new window.ImageData', attr: 'g' },
              // { search: '\\w instanceof HTMLCanvasElement' , replace: 'true', attr: 'g' },
              // { search: '\\w instanceof OffscreenCanvas' , replace: 'true', attr: 'g' },
              { search: '"webgl"\\s*==\\s*\\w\\s*==\\s*\\w instanceof WebGLRenderingContext' , replace: 'true', attr: 'g' },
            ]
          })
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        chain.merge({
          resolve: {
            fallback: { fs: false, path: false }
          },
          experiments: {
            syncWebAssembly: true,
            asyncWebAssembly: true,
          },
        })
      }
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
