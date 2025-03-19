import { _ParagraphBuilder, _Paragraph } from "./impl";
// import { _ParagraphBuilder, _Paragraph } from "./newimpl";
import {
  _ParagraphBuilderFactory,
  _FontCollectionFactory, _FontMgrFactory, _TypefaceFactory,
  _TypefaceFontProviderFactory, _TypefaceFontProvider, _Font, _FontMgr,
  _ParagraphStyle, _FontCollection, _Typeface,
  _TextStyle,
} from './mite'

import type {
   TextStyle,
   ParagraphStyle,
  CanvasKit, 
} from './canvaskit'

import { createCanvas} from './util'

import { _ParagraphEnums, _ParagraphConstants } from "./bass";

const pixelRatio = 1.0;
const sharedRenderCanvas = createCanvas(
    Math.min(4000, 1000 * pixelRatio),
    Math.min(4000, 1000 * pixelRatio)
);
const sharedRenderContext = sharedRenderCanvas!.getContext("2d")!

export function install(
  canvasKit: CanvasKit,
  // pixelRatio: number,
  // embeddingFonts: string[],
  // iconFonts?: Record<string, string>
) {
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

  canvasKit.Canvas.prototype.drawParagraph = function (
    paragraph: _Paragraph,
    dx: number,
    dy: number
  ) {
    const imageData = paragraph.draw(sharedRenderContext, pixelRatio);
    const w = imageData.width;
    const h = imageData.height;
    const img = canvasKit.MakeImage({
        width: w, height: h,
        alphaType: canvasKit.AlphaType.Unpremul,
        colorType: canvasKit.ColorType.RGBA_8888,
        colorSpace: canvasKit.ColorSpace.SRGB,
    },
        imageData.data,
        4 * imageData.width
    );
    const srcRect = canvasKit.XYWHRect(0, 0, w, h,);
    const dstRect = canvasKit.XYWHRect(Math.ceil(dx), Math.ceil(dy), w / pixelRatio, h / pixelRatio,);
    this.drawImageRect(img!, srcRect, dstRect, new canvasKit.Paint());
  };
}