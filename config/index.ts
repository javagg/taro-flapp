import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
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
        { from: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm', to: 'dist/assets' },
        { from: 'assets/canvaskit', to: 'dist/canvaskit/pages' },
      ],
      options: {
      }
    },
    alias: {
      '@/flutter': path.resolve(__dirname, '..', 'src', 'flutter'),
      '@/main': path.resolve(__dirname, '..', 'src', 'main'),
      '@/flapp': path.resolve(__dirname, '..', 'flapp', 'build', 'web'),
      '@/canvaskit': path.resolve(__dirname, '..', 'src', 'canvaskit'),
    },
    framework: 'solid',
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
      optimizeMainPackage: {
        enable: true,
      },
      compile: {
        exclude: [ 
          // "src/assets/*.js", "src/canvaskit/*.js",
          // "assets/**/*.js"
        ],
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
      // fontUrlLoaderOption: {
      //   limit: false,
      //   generator: (content) => content.toString(),
      // },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
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
