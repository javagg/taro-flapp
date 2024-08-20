export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  subpackages: [
    {
      "root": "canvaskit",
      "pages": [
        "pages/index",
      ]
    },
    {
      "root": "assets",
      "pages": [
        "pages/index",
      ],
    },
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    // navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
