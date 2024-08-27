import Taro from '@tarojs/taro'

export const encodeImage = async (
    rawRgba,
    width: number,
    height: number,
    format,
    quality,
    callback
) => {
    const canvas = Taro.createOffscreenCanvas({ type: "2d", width, height });
    const context = canvas.getContext("2d");
    const imageData = context.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < rawRgba.length; i += 4) {
        data[i] = rawRgba[i];
        data[i + 1] = rawRgba[i + 1];
        data[i + 2] = rawRgba[i + 2];
        data[i + 3] = rawRgba[i + 3];
    }
    context.putImageData(imageData, 0, 0);
    return callback(canvas.toDataURL(format, quality));
};

export const encodeImageToFilePath = async (
    rawRgba,
    width: number,
    height: number,
    format,
    quality,
    filePath,
    callback
) => {
    let _filePath = filePath;
    if (_filePath.indexOf("/") < 0) {
        _filePath = wx.env.USER_DATA_PATH + "/" + filePath;
    }
    const canvas = Taro.createOffscreenCanvas({ type: "2d", width, height });
    const context = canvas.getContext("2d");
    const imageData = context.createImageData(width, height);
    const data = imageData.data;
    for (let i = 0; i < rawRgba.length; i += 4) {
        data[i] = rawRgba[i];
        data[i + 1] = rawRgba[i + 1];
        data[i + 2] = rawRgba[i + 2];
        data[i + 3] = rawRgba[i + 3];
    }
    context.putImageData(imageData, 0, 0);
    const dataUrl = canvas.toDataURL(format, quality);
    Taro.getFileSystemManager().writeFileSync({
        filePath: _filePath,
        data: dataUrl.split("base64,")[1],
        encoding: "base64",
    });
};
