// Copyright 2023 The MPFlutter Authors. All rights reserved.
// Use of this source code is governed by a Apache License Version 2.0 that can be
// found in the LICENSE file.

import { drawParagraph, _ParagraphBuilder } from "./adapter/paragraph_builder";

import {
  _ParagraphBuilderFactory,
  _FontCollectionFactory, _FontMgrFactory, _TypefaceFactory,
  _TypefaceFontProviderFactory, _TypefaceFontProvider, _Font, _FontMgr,
  _ParagraphStyle, _FontCollection, _Typeface,
  _TextStyle,
  // _Paragraph, _ParagraphBuilder, drawParagraph,

} from './mite'

import { Drawer } from './impl/drawer';
import {
  // CanvasK
  type TextStyle,
  type ParagraphStyle,
  CanvasKit
} from './canvaskit'

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
  canvasKit.ParagraphStyle = (ps: ParagraphStyle) => {
    return new _ParagraphStyle(ps);
  };
  canvasKit.TextStyle = (ts: TextStyle) => {
    return new _TextStyle(ts);
  };

  // Paragraph Enums
  canvasKit.TextAlign = {
    Left: { value: 0 },
    Right: { value: 1 },
    Center: { value: 2 },
    Justify: { value: 3 },
    Start: { value: 4 },
    End: { value: 5 },
  };

  canvasKit.TextDirection = {
    RTL: { value: 0 },
    LTR: { value: 1 },
  };

  canvasKit.TextBaseline = {
    Alphabetic: { value: 0 },
    Ideographic: { value: 1 },
  };
  canvasKit.RectHeightStyle = {
    Tight: { value: 0 },
    Max: { value: 1 },
    IncludeLineSpacingMiddle: { value: 2 },
    IncludeLineSpacingTop: { value: 3 },
    IncludeLineSpacingBottom: { value: 4 },
    Strut: { value: 5 },
  };
  canvasKit.RectWidthStyle = {
    Tight: { value: 0 },
    Max: { value: 1 },
  };
  canvasKit.Affinity = {
    Upstream: { value: 0 },
    Downstream: { value: 1 },
  };
  canvasKit.FontWeight = {
    Invisible: { value: 0 },
    Thin: { value: 100 },
    ExtraLight: { value: 200 },
    Light: { value: 300 },
    Normal: { value: 400 },
    Medium: { value: 500 },
    SemiBold: { value: 600 },
    Bold: { value: 700 },
    ExtraBold: { value: 800 },
    Black: { value: 900 },
    ExtraBlack: { value: 1000 },
  };
  canvasKit.FontWidth = {
    UltraCondensed: { value: 0 },
    ExtraCondensed: { value: 1 },
    Condensed: { value: 2 },
    SemiCondensed: { value: 3 },
    Normal: { value: 4 },
    SemiExpanded: { value: 5 },
    Expanded: { value: 6 },
    ExtraExpanded: { value: 7 },
    UltraExpanded: { value: 8 },
  };
  canvasKit.FontSlant = {
    Upright: { value: 0 },
    Italic: { value: 1 },
    Oblique: { value: 2 },
  };
  canvasKit.DecorationStyle = {
    Solid: { value: 0 },
    Double: { value: 1 },
    Dotted: { value: 2 },
    Dashed: { value: 3 },
    Wavy: { value: 4 },
  };
  canvasKit.TextHeightBehavior = {
    All: { value: 0 },
    DisableFirstAscent: { value: 1 },
    DisableLastDescent: { value: 2 },
    DisableAll: { value: 3 },
  };
  canvasKit.PlaceholderAlignment = {
    Baseline: { value: 0 },
    AboveBaseline: { value: 1 },
    BelowBaseline: { value: 2 },
    Top: { value: 3 },
    Bottom: { value: 4 },
    Middle: { value: 5 },
  };
  // Paragraph Constants
  canvasKit.NoDecoration = 0;
  canvasKit.UnderlineDecoration = 1;
  canvasKit.OverlineDecoration = 2;
  canvasKit.LineThroughDecoration = 3;
  // ParagraphBuilder.usingPolyfill = true;
  // }
  // logger.profileMode = true;
  // logger.setLogLevel(LogLevel.ERROR);
  // Drawer.pixelRatio = pixelRatio;
  // const originMakeFromFontCollectionMethod =
  //   canvasKit.ParagraphBuilder.MakeFromFontCollection;

  // canvasKit.ParagraphBuilder.MakeFromFontCollection = function (
  //   style: any,
  //   fontCollection: any
  // ) {
  //   console.log("ParagraphBuilder")
  //   return new ParagraphBuilder(style)
  //   // return ParagraphBuilder.MakeFromFontCollection(
  //   //   // originMakeFromFontCollectionMethod,
  //   //   style,
  //   //   fontCollection,
  //   //   // embeddingFonts,
  //   //   // iconFonts
  //   // );
  // };

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
