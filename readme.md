# Taro with flutter web

## link your flutter app
```
cd project_root
ln -s flapp [your flutter web dir]
```
## run taro with flutter
```
pnpm dlx @tarojs/cli@4.0.9 build --type weapp
pnpm dlx @tarojs/cli@4.0.9 build --type h5 --watch # This will open a new broswer window
```