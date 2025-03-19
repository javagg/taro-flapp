// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { drawParagraph, _ParagraphBuilder } from "./impl";

import {
  _ParagraphBuilderFactory,
  _FontCollectionFactory, _FontMgrFactory, _TypefaceFactory,
  _TypefaceFontProviderFactory, _TypefaceFontProvider, _Font, _FontMgr,
  _ParagraphStyle, _FontCollection, _Typeface,
  _TextStyle,
  // _Paragraph, _ParagraphBuilder, drawParagraph,

} from './mite'

import {
  // CanvasK
  type TextStyle,
  type ParagraphStyle,
  CanvasKit
} from './canvaskit'

import { _ParagraphEnums, _ParagraphConstants } from "./bass";

export function install(
  canvasKit: CanvasKit,
  pixelRatio: number,
  embeddingFonts: string[],
  iconFonts?: Record<string, string>
) {
  // console.log(globalThis)
  // if (typeof canvasKit.ParagraphBuilder === "undefined") {
  // installPolyfill(canvasKit);
  canvasKit.ParagraphBuilder = _ParagraphBuilder; //new _ParagraphBuilderFactory();
  canvasKit.FontCollection = _FontCollection; // new _FontCollectionFactory();
  canvasKit.FontMgr = _FontMgr; //new _FontMgrFactory();
  canvasKit.Typeface = _Typeface ; //new _TypefaceFactory();
  canvasKit.TypefaceFontProvider = _TypefaceFontProvider;//new _TypefaceFontProviderFactory();
  canvasKit.Font = _Font;
  canvasKit.ParagraphStyle = (ps: ParagraphStyle) =>new _ParagraphStyle(ps);
  canvasKit.TextStyle = (ts: TextStyle) => new _TextStyle(ts);

  Object.assign(canvasKit, _ParagraphEnums);
  Object.assign(canvasKit, _ParagraphConstants);

  // ParagraphBuilder.usingPolyfill = true;
  // }
  // logger.profileMode = true;
  // logger.setLogLevel(LogLevel.ERROR);
  // Drawer.pixelRatio = pixelRatio;


  canvasKit.Canvas.prototype.drawParagraph = function (
    paragraph: any,
    dx: number,
    dy: number
  ) {
    drawParagraph(canvasKit, this, paragraph, dx, dy);

    // let canvasImg = paragraph.skImageCache;
    // if (!canvasImg) {
    //   const drawer = new Drawer(paragraph);
    //   const imageData = drawer.draw();
    //   canvasImg = CanvasKit.MakeImage(
    //     {
    //       width: imageData.width,
    //       height: imageData.height,
    //       alphaType: CanvasKit.AlphaType.Unpremul,
    //       colorType: CanvasKit.ColorType.RGBA_8888,
    //       colorSpace: CanvasKit.ColorSpace.SRGB,
    //     },
    //     imageData.data,
    //     4 * imageData.width
    //   );
    //   paragraph.skImageCache = canvasImg;
    //   paragraph.skImageWidth = imageData.width;
    //   paragraph.skImageHeight = imageData.height;
    // }
    // const srcRect = CanvasKit.XYWHRect(
    //   0,
    //   0,
    //   paragraph.skImageWidth!,
    //   paragraph.skImageHeight!
    // );
    // const dstRect = CanvasKit.XYWHRect(
    //   Math.ceil(dx),
    //   Math.ceil(dy),
    //   paragraph.skImageWidth! / Drawer.pixelRatio,
    //   paragraph.skImageHeight! / Drawer.pixelRatio
    // );
    // this.drawImageRect(canvasImg, srcRect, dstRect, new CanvasKit.Paint());
  };
}
