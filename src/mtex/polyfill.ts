// import { Paint } from "./adapter/paint";
// import { ParagraphBuilder } from "./adapter/paragraph_builder";
// import {
//   //   DecorationStyle,
//   //   FontStyle,
//   //   InputColor,
//   //   ParagraphStyle,
//   SkEmbindObject,
//   //   SkEnum,
//   //   StrutStyle,
//   //   TextAlign,
//   //   TextBaseline,
//   //   TextDirection,
//   //   TextFontFeatures,
//   //   TextFontVariations,
//   //   TextShadow,
//   //   TextStyle,
// } from "./adapter/skia";

// import {
//   DecorationStyle,
//   type Font,
//   type FontCollection,
//   type FontCollectionFactory,
//   type FontEdging,
//   type FontHinting,
//   type FontMetrics,
//   type FontMgr,
//   type FontMgrFactory,
//   type InputGlyphIDArray,
//   type ParagraphBuilderFactory,
//   type Typeface,
//   type TypefaceFactory,
//   type TypefaceFontProvider,
//   type TypefaceFontProviderFactory,
// } from "./canvaskit";

// // import {
// //   // TextAlignEnumValues,
// //   TextDirectionEnumValues,
// //   TextBaselineEnumValues,
// //   RectHeightStyleEnumValues,
// //   RectWidthStyleEnumValues,
// //   AffinityEnumValues,
// //   FontWeightEnumValues,
// //   FontWidthEnumValues,
// //   FontSlantEnumValues,
// //   DecorationStyleEnumValues,
// //   TextHeightBehaviorEnumValues,
// //   PlaceholderAlignmentEnumValues,
// // } from "./enums";

// // export const installPolyfill = (canvasKit: CanvasKit) => {
// //   canvasKit.ParagraphBuilder = new _ParagraphBuilderFactory();
// //   canvasKit.FontCollection = new _FontCollectionFactory();
// //   canvasKit.FontMgr = new _FontMgrFactory();
// //   canvasKit.Typeface = new _TypefaceFactory();
// //   canvasKit.TypefaceFontProvider = new _TypefaceFontProviderFactory();
// //   canvasKit.Font = _Font;
// //   canvasKit.ParagraphStyle = (properties: any) => {
// //     return new _ParagraphStyle(properties);
// //   };
// //   canvasKit.TextStyle = (properties: any) => {
// //     return new _TextStyle(properties);
// //   };

// //   // Paragraph Enums
// //   canvasKit.TextAlign = {
// //     Left: { value: 0 },
// //     Right: { value: 1 },
// //     Center: { value: 2 },
// //     Justify: { value: 3 },
// //     Start: { value: 4 },
// //     End: { value: 5 },
// //   };

// //   canvasKit.TextDirection = {
// //     RTL: { value: 0 },
// //     LTR: { value: 1 },
// //   };

// //   canvasKit.TextBaseline = {
// //     Alphabetic: { value: 0 },
// //     Ideographic: { value: 1 },
// //   };
// //   canvasKit.RectHeightStyle = {
// //     Tight: { value: 0 },
// //     Max: { value: 1 },
// //     IncludeLineSpacingMiddle: { value: 2 },
// //     IncludeLineSpacingTop: { value: 3 },
// //     IncludeLineSpacingBottom: { value: 4 },
// //     Strut: { value: 5 },
// //   };
// //   canvasKit.RectWidthStyle = {
// //     Tight: { value: 0 },
// //     Max: { value: 1 },
// //   };
// //   canvasKit.Affinity = {
// //     Upstream: { value: 0 },
// //     Downstream: { value: 1 },
// //   };
// //   canvasKit.FontWeight = {
// //     Invisible: { value: 0 },
// //     Thin: { value: 100 },
// //     ExtraLight: { value: 200 },
// //     Light: { value: 300 },
// //     Normal: { value: 400 },
// //     Medium: { value: 500 },
// //     SemiBold: { value: 600 },
// //     Bold: { value: 700 },
// //     ExtraBold: { value: 800 },
// //     Black: { value: 900 },
// //     ExtraBlack: { value: 1000 },
// //   };
// //   canvasKit.FontWidth = {
// //     UltraCondensed: { value: 0 },
// //     ExtraCondensed: { value: 1 },
// //     Condensed: { value: 2 },
// //     SemiCondensed: { value: 3 },
// //     Normal: { value: 4 },
// //     SemiExpanded: { value: 5 },
// //     Expanded: { value: 6 },
// //     ExtraExpanded: { value: 7 },
// //     UltraExpanded: { value: 8 },
// //   };
// //   canvasKit.FontSlant = {
// //     Upright: { value: 0 },
// //     Italic: { value: 1 },
// //     Oblique: { value: 2 },
// //   };
// //   canvasKit.DecorationStyle = {
// //     Solid: { value: 0 },
// //     Double: { value: 1 },
// //     Dotted: { value: 2 },
// //     Dashed: { value: 3 },
// //     Wavy: { value: 4 },
// //   };
// //   canvasKit.TextHeightBehavior = {
// //     All: { value: 0 },
// //     DisableFirstAscent: { value: 1 },
// //     DisableLastDescent: { value: 2 },
// //     DisableAll: { value: 3 },
// //   };
// //   canvasKit.PlaceholderAlignment = {
// //     Baseline: { value: 0 },
// //     AboveBaseline: { value: 1 },
// //     BelowBaseline: { value: 2 },
// //     Top: { value: 3 },
// //     Bottom: { value: 4 },
// //     Middle: { value: 5 },
// //   };
// //   // Paragraph Constants
// //   canvasKit.NoDecoration = 0;
// //   canvasKit.UnderlineDecoration = 1;
// //   canvasKit.OverlineDecoration = 2;
// //   canvasKit.LineThroughDecoration = 3;
// // };


// export class _ParagraphStyle extends SkEmbindObject implements ParagraphStyle {
//   constructor(properties: any) {
//     super();
//     Object.assign(this, properties);
//   }

//   disableHinting?: boolean;
//   ellipsis?: string;
//   heightMultiplier?: number;
//   maxLines?: number;
//   replaceTabCharacters?: boolean;
//   strutStyle?: StrutStyle;
//   textAlign?: SkEnum<TextAlign>;
//   textDirection?: SkEnum<TextDirection>;
//   // textHeightBehavior?,
//   textStyle?: TextStyle;
//   // applyRoundingHack?: boolean;
// }

// // export class _TextStyle extends SkEmbindObject implements TextStyle {
// //   constructor(properties: any) {
// //     super();
// //     Object.assign(this, properties);
// //   }

// //   backgroundColor?: InputColor;
// //   color?: InputColor;
// //   decoration?: number;
// //   decorationColor?: InputColor;
// //   decorationThickness?: number;
// //   decorationStyle?: SkEnum<DecorationStyle>;
// //   fontFamilies?: string[];
// //   fontFeatures?: TextFontFeatures[];
// //   fontSize?: number;
// //   fontStyle?: FontStyle;
// //   fontVariations?: TextFontVariations[];
// //   foregroundColor?: InputColor;
// //   heightMultiplier?: number;
// //   halfLeading?: boolean;
// //   letterSpacing?: number;
// //   locale?: string;
// //   shadows?: TextShadow[];
// //   textBaseline?: SkEnum<TextBaseline>;
// //   wordSpacing?: number;
// // }

// export class _FontCollection extends SkEmbindObject implements FontCollection {
//   setDefaultFontManager(fontManager: TypefaceFontProvider | null): void { }
//   enableFontFallback(): void { }
// }

// export class _FontCollectionFactory implements FontCollectionFactory {
//   Make(): FontCollection {
//     return new _FontCollection();
//   }
// }

// export class _FontMgr extends SkEmbindObject implements FontMgr {
//   countFamilies(): number {
//     return 0;
//   }
//   getFamilyName(index: number): string {
//     return "";
//   }
// }

// export class _FontMgrFactory implements FontMgrFactory {
//   FromData(...buffers: ArrayBuffer[]): FontMgr | null {
//     return new _FontMgr();
//   }
// }

// export class _TypefaceFactory implements TypefaceFactory {
//   GetDefault(): Typeface | null {
//     return new _Typeface();
//   }
//   MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null {
//     return new _Typeface();
//   }
//   MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null {
//     return new _Typeface();
//   }
// }

// export class _TypefaceFontProvider
//   extends SkEmbindObject
//   implements TypefaceFontProvider {
//   registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void { }
//   countFamilies(): number {
//     return 0;
//   }
//   getFamilyName(index: number): string {
//     return "";
//   }
// }

// export class _TypefaceFontProviderFactory implements TypefaceFontProviderFactory {
//   Make(): TypefaceFontProvider {
//     return new _TypefaceFontProvider();
//   }
// }

// export class _Typeface extends SkEmbindObject implements Typeface {
//   getGlyphIDs(
//     str: string,
//     numCodePoints?: number | undefined,
//     output?: Uint16Array | undefined
//   ): Uint16Array {
//     return new Uint16Array([]);
//   }
// }

// export class _Font extends SkEmbindObject implements Font {
//   constructor(
//     face: Typeface | null,
//     size: number,
//     scaleX: number,
//     skewX: number
//   ) {
//     super();
//   }

//   getMetrics(): FontMetrics {
//     return { ascent: 0, descent: 0, leading: 0 };
//   }
//   getGlyphBounds(
//     glyphs: InputGlyphIDArray,
//     paint?: Paint | null | undefined,
//     output?: Float32Array | undefined
//   ): Float32Array {
//     return new Float32Array([0, 0, 0, 0]);
//   }
//   getGlyphIDs(
//     str: string,
//     numCodePoints?: number | undefined,
//     output?: Uint16Array | undefined
//   ): Uint16Array {
//     return new Uint16Array([]);
//   }
//   getGlyphWidths(
//     glyphs: InputGlyphIDArray,
//     paint?: Paint | null | undefined,
//     output?: Float32Array | undefined
//   ): Float32Array {
//     return new Float32Array([]);
//   }
//   getGlyphIntercepts(
//     glyphs: InputGlyphIDArray,
//     positions: number[] | Float32Array,
//     top: number,
//     bottom: number
//   ): Float32Array {
//     return new Float32Array([]);
//   }
//   getScaleX(): number {
//     return 1;
//   }
//   getSize(): number {
//     return 0;
//   }
//   getSkewX(): number {
//     return 1;
//   }
//   isEmbolden(): boolean {
//     return false;
//   }
//   getTypeface(): Typeface | null {
//     return new _Typeface();
//   }
//   setEdging(edging: FontEdging): void { }
//   setEmbeddedBitmaps(embeddedBitmaps: boolean): void { }
//   setHinting(hinting: FontHinting): void { }
//   setLinearMetrics(linearMetrics: boolean): void { }
//   setScaleX(sx: number): void { }
//   setSize(points: number): void { }
//   setSkewX(sx: number): void { }
//   setEmbolden(embolden: boolean): void { }
//   setSubpixel(subpixel: boolean): void { }
//   setTypeface(face: Typeface | null): void { }
// }
