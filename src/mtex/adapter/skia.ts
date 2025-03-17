

// export interface SkEnum<T> {
//   value: T;
// }

// export type InputWords = Uint32Array | number[];
// export type InputGraphemes = Uint32Array | number[];
// export type InputLineBreaks = Uint32Array | number[];
// export type Color = Float32Array;
// export type InputColor = Color | number[];
// export type Rect = Float32Array;
// export type GlyphIDArray = Uint16Array;


// export enum TextDirection {
//   RTL,
//   LTR,
// }


// export enum Affinity {
//   Upstream,
//   Downstream,
// }

// export enum TextAlign {
//   Left = 0,
//   Right = 1,
//   Center = 2,
//   Justify = 3,
//   Start = 4,
//   End = 5,
// }

// export interface LetterRect {
//   x: number;
//   y: number;
//   w: number;
//   h: number;
// }

// export interface TextShadow {
//   color?: InputColor;
//   offset?: number[];
//   blurRadius?: number;
// }

// export const NoDecoration = 0;
// export const UnderlineDecoration = 1;
// export const OverlineDecoration = 2;
// export const LineThroughDecoration = 4;

// export interface TextStyle {
//   backgroundColor?: InputColor;
//   color?: InputColor;
//   decoration?: number;
//   decorationColor?: InputColor;
//   decorationThickness?: number;
//   decorationStyle?: SkEnum<DecorationStyle>;
//   fontFamilies?: string[];
//   fontFeatures?: TextFontFeatures[];
//   fontSize?: number;
//   fontStyle?: FontStyle;
//   fontVariations?: TextFontVariations[];
//   foregroundColor?: InputColor;
//   heightMultiplier?: number;
//   halfLeading?: boolean;
//   letterSpacing?: number;
//   locale?: string;
//   shadows?: TextShadow[];
//   textBaseline?: SkEnum<TextBaseline>;
//   wordSpacing?: number;
// }

// export interface FontStyle {
//   weight?: SkEnum<FontWeight>;
//   width?: SkEnum<FontWidth>;
//   slant?: SkEnum<FontSlant>;
// }

// export enum FontWeight {
//   Invisible = 0,
//   Thin = 100,
//   ExtraLight = 200,
//   Light = 300,
//   Normal = 400,
//   Medium = 500,
//   SemiBold = 600,
//   Bold = 700,
//   ExtraBold = 800,
//   Black = 900,
//   ExtraBlack = 1000,
// }

// export enum FontWidth {
//   UltraCondensed,
//   ExtraCondensed,
//   Condensed,
//   SemiCondensed,
//   Normal,
//   SemiExpanded,
//   Expanded,
//   ExtraExpanded,
//   UltraExpanded,
// }

// export enum FontSlant {
//   Upright,
//   Italic,
//   Oblique,
// }

// export enum DecorationStyle {
//   Solid,
//   Double,
//   Dotted,
//   Dashed,
//   Wavy,
// }

// export enum TextHeightBehavior {
//   All,
//   DisableFirstAscent,
//   DisableLastDescent,
//   DisableAll,
// }

// export interface TextFontFeatures {
//   name: string;
//   value: number;
// }

// export interface TextFontVariations {
//   axis: string;
//   value: number;
// }
