import {
  type CanvasKit, type ParagraphBuilder, type FontCollectionFactory,
  type FontCollection, type TypefaceFontProvider, type EmbindObject,
  type Typeface, type FontStyle, type Font, type GlyphIDArray,
  type FontMetrics, type InputGlyphIDArray, type Paint, type FontEdging,
  type FontHinting, type ParagraphBuilderFactory, type FontMgr, type ParagraphStyle,
  type FontBlock, type ShapedLine, type TypefaceFactory, type FontMgrFactory,
  type TypefaceFontProviderFactory, type StrutStyle, type TextAlign, type TextBaseline,
  type TextDirection, type TextHeightBehavior, type TextStyle, type InputColor, type DecorationStyle,
  type TextFontFeatures, type TextFontVariations, type TextShadow,
  type TextBaselineEnumValues, type TextDirectionEnumValues,
  type TextHeightBehaviorEnumValues, type AffinityEnumValues, type FontWeightEnumValues,
  type TextAlignEnumValues, type SkPicture,
  InputGraphemes,
  InputLineBreaks,
  InputWords,
  Paragraph,
  PlaceholderAlignment,
  GlyphInfo,
  LineMetrics,
  PositionWithAffinity,
  RectHeightStyle,
  RectWidthStyle,
  RectWithDirection,
  URange,
  Blender,
  BlendMode,
  Color,
  ColorFilter,
  ColorInt,
  ColorSpace,
  ImageFilter,
  MaskFilter,
  PaintStyle,
  PathEffect,
  Shader,
  StrokeCap,
  StrokeJoin,
} from "canvaskit-wasm/types";

import { parse } from 'opentype.js/dist/opentype.module'

export const valueOfRGB = (
  r: number,
  g: number,
  b: number,
  a: number
): Float32Array => {
  return Float32Array.from([r, g, b, a]);
};

export abstract class SkEmbindObject<T extends string> implements EmbindObject<T> {
  // readonly _type: T;
  _deleted = false;

  constructor(readonly _type: T) { }

  delete(): void {
    this._deleted = true;
  }

  deleteLater(): void {
    this._deleted = true;
  }

  isAliasOf(other: any): boolean {
    return other._type === this._type;
  }

  isDeleted(): boolean {
    return this._deleted;
  }
}

// export const loadFont = (data: ArrayBuffer, familynameAlias?: string) => {
//   const f = parse(data)

//   const familyName =
//     familynameAlias ??
//     (parseFontTable(data).namesTable.postScriptName.en as string);
//   const font = new FontFace(familyName, data);
//   font.load();
//   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//   // @ts-expect-error
//   document.fonts.add(font);
//   return { familyName };
// };


class _Typeface extends SkEmbindObject<"Typeface"> implements Typeface {
  fobj: any
  constructor(fontData: ArrayBuffer) {
    super("Typeface")
    this.fobj = parse(fontData)
  }

  getGlyphIDs(str: string, numCodePoints?: number, output?: GlyphIDArray): GlyphIDArray {
    const result = output ?? new Uint16Array(numCodePoints ?? str.length);
    const glyghs = this.fobj.stringToGlyphs(str.substring(0, result.length))
    for (let i = 0; i < glyghs.length; i++) {
      result[i] = glyghs[i].index
    }
    return result;
  }
}

class _Font extends SkEmbindObject<"Font"> implements Font {
  tf: Typeface | null
  //     constructor(
  //       face: Typeface | null,
  //       size: number,
  //       scaleX: number,
  //       skewX: number
  //     ) {
  //       super();
  //     }

  //   /**
  //  * Constructs Font with default values with Typeface.
  //  * @param face
  //  * @param size - font size in points. If not specified, uses a default value.
  //  */
  constructor() { }

  constructor(face: Typeface | null, size?: number) {
    super();
  }

  // /**
  //  * Constructs Font with default values with Typeface and size in points,
  //  * horizontal scale, and horizontal skew. Horizontal scale emulates condensed
  //  * and expanded fonts. Horizontal skew emulates oblique fonts.
  //  * @param face
  //  * @param size
  //  * @param scaleX
  //  * @param skewX
  //  */
  constructor(face: Typeface | null, size: number, scaleX: number, skewX: number) {
    super();
  }


  getMetrics(): FontMetrics {
    return { ascent: 0, descent: 0, leading: 0 };
  }
  getGlyphBounds(
    glyphs: InputGlyphIDArray,
    paint?: Paint | null,
    output?: Float32Array
  ): Float32Array {
    return new Float32Array([0, 0, 0, 0]);
  }
  getGlyphIDs(str: string, numCodePoints?: number,
    output?: GlyphIDArray): GlyphIDArray {
    return new Uint16Array([]);
  }
  getGlyphWidths(glyphs: InputGlyphIDArray, paint?: Paint | null,
    output?: Float32Array): Float32Array {
    return new Float32Array([]);
  }
  getGlyphIntercepts(glyphs: InputGlyphIDArray, positions: Float32Array | number[],
    top: number, bottom: number): Float32Array {
    return new Float32Array([]);
  }
  getScaleX(): number {
    return 1;
  }
  getSize(): number {
    return 0;
  }
  getSkewX(): number {
    return 1;
  }
  isEmbolden(): boolean {
    return false;
  }
  getTypeface(): Typeface | null {
    return this.tf;
  }
  setEdging(edging: FontEdging): void { }
  setEmbeddedBitmaps(embeddedBitmaps: boolean): void { }
  setHinting(hinting: FontHinting): void { }
  setLinearMetrics(linearMetrics: boolean): void { }
  setScaleX(sx: number): void { }
  setSize(points: number): void { }
  setSkewX(sx: number): void { }
  setEmbolden(embolden: boolean): void { }
  setSubpixel(subpixel: boolean): void { }
  setTypeface(face: Typeface | null): void {
    this.tf = face;
  }
}

class _FontCollection extends SkEmbindObject<"FontCollection"> implements FontCollection {
  fontManager: TypefaceFontProvider | null = null;

  constructor() {
    super("FontCollection");
  }

  setDefaultFontManager(fontManager: TypefaceFontProvider | null): void {
    this.fontManager = fontManager;
  }

  enableFontFallback(): void { }
}

class _FontCollectionFactory implements FontCollectionFactory {
  Make(): FontCollection {
    return new _FontCollection();
  }
}

class _ParagraphBuilderFactory implements ParagraphBuilderFactory {
  /**
   * Creates a ParagraphBuilder using the fonts available from the given font manager.
   * @param style
   * @param fontManager
   */
  Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
    return this.MakeFromFontCollection(style, {} as any);
  }

  /**
   * Creates a ParagraphBuilder using the given font collection.
   * @param style
   * @param fontCollection
   */
  MakeFromFontCollection(
    style: ParagraphStyle,
    fontCollection: FontCollection
  ): ParagraphBuilder {
    return new _ParagraphBuilder(style, fontCollection)
  }

  /**
   * Creates a ParagraphBuilder using the fonts available from the given font provider.
   * @param style
   * @param fontSrc
   */
  MakeFromFontProvider(style: ParagraphStyle, fontSrc: TypefaceFontProvider): ParagraphBuilder {
    throw new Error("Function not implemented.");
  }

  /**
   * Whether the paragraph builder requires ICU data to be provided by the
   * client.
   */
  RequiresClientICU(): boolean {
    return false;
  }

  /**
   * Return a shaped array of lines
   */
  ShapeText(text: string, runs: FontBlock[], width?: number): ShapedLine[] {
    throw new Error("Function not implemented.");
  }
}

class _FontMgr extends SkEmbindObject<"FontMgr"> implements FontMgr {

  typefaces: Typeface[]
  /**
  * Return the number of font families loaded in this manager. Useful for debugging.
  */
  constructor() {
    super("FontMgr")
  }

  countFamilies(): number {
    return this.typefaces.length;
  }

  /**
   * Return the nth family name. Useful for debugging.
   * @param index
   */
  getFamilyName(index: number): string {
    return this.typefaces[index].familyName;
  }

  /**
   * Find the closest matching typeface to the specified familyName and style.
   */
  matchFamilyStyle(name: string, style: FontStyle): Typeface {
    const tf = new _Typeface()
    throw new Error("matchFamilyStyle not implemented.");
  }
}

class _TypefaceFontProvider extends _FontMgr implements TypefaceFontProvider {

  registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {
    const tf = new _TypefaceFactory().MakeFreeTypeFaceFromData(bytes)
    this.typefaces.push(tf!)
    const font = new FontFace(family, bytes);
    font.load();
    document.fonts.add(font);
  }
}

class _FontMgrFactory implements FontMgrFactory {
  FromData(...buffers: ArrayBuffer[]): FontMgr | null {
    const typefaces: Typeface[] = [];
    buffers.forEach((buffer) => {
      const typeface = new _TypefaceFactory().MakeFreeTypeFaceFromData(buffer);
      if (!typeface) {
        throw new Error("Could not load font");
      }
      typefaces.push(typeface);
    });
    return new _FontMgr(typefaces);
  }
}

class _TypefaceFactory implements TypefaceFactory {

  constructor() { }
  MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null {
    return new _Typeface(fontData);
  }

}

class _TypefaceFontProviderFactory implements TypefaceFontProviderFactory {
  Make(): TypefaceFontProvider {
    return new _TypefaceFontProvider();
  }
}

class _ParagraphStyle implements ParagraphStyle {
  // constructor(properties: any) {
  //   super();
  //   Object.assign(this, properties);
  // }

  disableHinting?: boolean;
  ellipsis?: string;
  heightMultiplier?: number;
  maxLines?: number;
  replaceTabCharacters?: boolean;
  strutStyle?: StrutStyle;
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  textHeightBehavior?: TextHeightBehavior;
  textStyle?: TextStyle;
  applyRoundingHack?: boolean;
}

// class _TextStyle implements TextStyle {
//     // constructor(properties: any) {
//     //   super();
//     //   Object.assign(this, properties);
//     // }

//     backgroundColor?: InputColor;
//     color?: InputColor;
//     decoration?: number;
//     decorationColor?: InputColor;
//     decorationThickness?: number;
//     decorationStyle?: DecorationStyle;
//     fontFamilies?: string[];
//     fontFeatures?: TextFontFeatures[];
//     fontSize?: number;
//     fontStyle?: FontStyle;
//     fontVariations?: TextFontVariations[];
//     foregroundColor?: InputColor;
//     heightMultiplier?: number;
//     halfLeading?: boolean;
//     letterSpacing?: number;
//     locale?: string;
//     shadows?: TextShadow[];
//     textBaseline?: TextBaseline;
//     wordSpacing?: number;
// }

class _ParagraphBuilder extends SkEmbindObject<"ParagraphBuilder"> implements ParagraphBuilder {
  private styles: TextStyle[] = [];

  constructor(private style: TextStyle, private fontCollection: FontCollection) {
    super()
  }

  addPlaceholder(width?: number, height?: number, alignment?: PlaceholderAlignment, baseline?: TextBaseline, offset?: number): void {
    throw new Error("Method not implemented.");
  }

  addText(str: string): void {
    console.log("ParagraphBuilder.addText", str);
    // throw new Error("Method not implemented.");
  }

  build(): Paragraph {
    return new _Paragraph()
  }

  setWordsUtf8(words: InputWords): void {
    throw new Error("Method not implemented.");
  }

  setWordsUtf16(words: InputWords): void {
    throw new Error("Method not implemented.");
  }

  setGraphemeBreaksUtf8(graphemes: InputGraphemes): void {
    throw new Error("Method not implemented.");
  }


  setGraphemeBreaksUtf16(graphemes: InputGraphemes): void {
    throw new Error("Method not implemented.");
  }
  setLineBreaksUtf8(lineBreaks: InputLineBreaks): void {
    throw new Error("Method not implemented.");
  }
  setLineBreaksUtf16(lineBreaks: InputLineBreaks): void {
    throw new Error("Method not implemented.");
  }
  getText(): string {
    throw new Error("Method not implemented.");
  }

  /**
  * Remove a style from the stack. Useful to apply different styles to chunks
  * of text such as bolding.
  */
  pop(): void {
    console.log("ParagraphBuilder.pop")
    this.styles.pop()
  }

  /**
   * Push a style to the stack. The corresponding text added with addText will
   * use the top-most style.
   * @param textStyle
   */
  pushStyle(text: TextStyle): void {
    console.log("ParagraphBuilder.pushStyle")
    this.styles.push(text);
  }
  pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void {
    throw new Error("Method not implemented.");
  }
  reset(): void {
    throw new Error("Method not implemented.");
  }
}

class _Paragraph extends SkEmbindObject<"Paragraph"> implements Paragraph {
  didExceedMaxLines(): boolean {
    throw new Error("Method not implemented.");
  }
  getAlphabeticBaseline(): number {
    return 0;
  }
  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    throw new Error("Method not implemented.");
  }
  getClosestGlyphInfoAtCoordinate(dx: number, dy: number): GlyphInfo | null {
    throw new Error("Method not implemented.");
  }
  getGlyphInfoAt(index: number): GlyphInfo | null {
    throw new Error("Method not implemented.");
  }
  getHeight(): number {
    throw new Error("Method not implemented.");
  }
  getIdeographicBaseline(): number {
    throw new Error("Method not implemented.");
  }
  getLineNumberAt(index: number): number {
    throw new Error("Method not implemented.");
  }
  getLineMetrics(): LineMetrics[] {
    throw new Error("Method not implemented.");
  }

  /**
   * Returns the LineMetrics of the line at the specified line number, or null
   * if the line number is out of bounds, or is larger than or equal to the
   * specified max line number.
   */
  getLineMetricsAt(lineNumber: number): LineMetrics | null {
    throw new Error("Method not implemented.");
  }
  getLongestLine(): number {
    throw new Error("Method not implemented.");
  }
  getMaxIntrinsicWidth(): number {
    throw new Error("Method not implemented.");
  }
  getMaxWidth(): number {
    throw new Error("Method not implemented.");
  }
  getMinIntrinsicWidth(): number {
    throw new Error("Method not implemented.");
  }
  getNumberOfLines(): number {
    throw new Error("Method not implemented.");
  }
  getRectsForPlaceholders(): RectWithDirection[] {
    throw new Error("Method not implemented.");
  }
  getRectsForRange(start: number, end: number, hStyle: RectHeightStyle, wStyle: RectWidthStyle): RectWithDirection[] {
    throw new Error("Method not implemented.");
  }
  getWordBoundary(offset: number): URange {
    throw new Error("Method not implemented.");
  }
  getShapedLines(): ShapedLine[] {
    throw new Error("Method not implemented.");
  }

  /**
   * Lays out the text in the paragraph so it is wrapped to the given width.
   * @param width
   */
  layout(width: number): void {
    console.log("Paragraph.layout")
  }

  unresolvedCodepoints(): number[] {
    throw new Error("Method not implemented.");
  }
}

class _Paint extends SkEmbindObject<"Paint"> implements Paint {

  private _color: Color = Float32Array.from([0, 0, 0, 255]);

  // private _strokeCap: StrokeCap = 

  // private _strokeJoin: StrokeJoin =

  copy(): Paint {
    throw new Error("Method not implemented.");
  }
  getColor(): Color {
    return this._color;
  }
  getStrokeCap(): StrokeCap {
    throw new Error("Method not implemented.");
  }
  getStrokeJoin(): StrokeJoin {
    throw new Error("Method not implemented.");
  }
  getStrokeMiter(): number {
    throw new Error("Method not implemented.");
  }
  getStrokeWidth(): number {
    throw new Error("Method not implemented.");
  }
  setAlphaf(alpha: number): void {
    throw new Error("Method not implemented.");
  }
  setAntiAlias(aa: boolean): void {
    throw new Error("Method not implemented.");
  }
  setBlendMode(mode: BlendMode): void {
    throw new Error("Method not implemented.");
  }
  setBlender(blender: Blender): void {
    throw new Error("Method not implemented.");
  }
  setColor(color: InputColor, colorSpace?: ColorSpace): void {
    throw new Error("Method not implemented.");
  }
  setColorComponents(r: number, g: number, b: number, a: number, colorSpace?: ColorSpace): void {
    throw new Error("Method not implemented.");
  }
  setColorFilter(filter: ColorFilter | null): void {
    throw new Error("Method not implemented.");
  }
  setColorInt(color: ColorInt, colorSpace?: ColorSpace): void {
    throw new Error("Method not implemented.");
  }
  setDither(shouldDither: boolean): void {
    throw new Error("Method not implemented.");
  }
  setImageFilter(filter: ImageFilter | null): void {
    throw new Error("Method not implemented.");
  }
  setMaskFilter(filter: MaskFilter | null): void {
    throw new Error("Method not implemented.");
  }
  setPathEffect(effect: PathEffect | null): void {
    throw new Error("Method not implemented.");
  }
  setShader(shader: Shader | null): void {
    throw new Error("Method not implemented.");
  }
  setStrokeCap(cap: StrokeCap): void {
    throw new Error("Method not implemented.");
  }
  setStrokeJoin(join: StrokeJoin): void {
    throw new Error("Method not implemented.");
  }
  setStrokeMiter(limit: number): void {
    throw new Error("Method not implemented.");
  }
  setStrokeWidth(width: number): void {
    throw new Error("Method not implemented.");
  }
  setStyle(style: PaintStyle): void {
    throw new Error("Method not implemented.");
  }
}

export function install(canvasKit: CanvasKit, pixelRatio: number,) {
  canvasKit.ParagraphBuilder = new _ParagraphBuilderFactory();
  canvasKit.FontCollection = new _FontCollectionFactory();
  canvasKit.FontMgr = new _FontMgrFactory();
  canvasKit.Typeface = new _TypefaceFactory();
  canvasKit.TypefaceFontProvider = new _TypefaceFontProviderFactory();
  canvasKit.Font = _Font;
  canvasKit.ParagraphStyle = (style: ParagraphStyle) => style;
  canvasKit.TextStyle = (style: TextStyle) => style;

  // Paragraph Enums
  // canvasKit.TextAlign = new TextAlignEnumValues  ();
  // canvasKit.TextDirection = new TextDirectionEnumValues();
  // canvasKit.TextBaseline = new TextBaselineEnumValues();
  // canvasKit.RectHeightStyle = new RectHeightStyleEnumValues();
  // canvasKit.RectWidthStyle = new RectWidthStyleEnumValues();
  // canvasKit.Affinity = new AffinityEnumValues();
  // canvasKit.FontWeight = new FontWeightEnumValues();
  // canvasKit.FontWidth = new FontWidthEnumValues();
  // canvasKit.FontSlant = new FontSlantEnumValues();
  // canvasKit.DecorationStyle = new DecorationStyleEnumValues();
  // canvasKit.TextHeightBehavior = new TextHeightBehaviorEnumValues();
  // canvasKit.PlaceholderAlignment = new PlaceholderAlignmentEnumValues();
  // Paragraph Constants
  // canvasKit.NoDecoration = 0;
  // canvasKit.UnderlineDecoration = 1;
  // canvasKit.OverlineDecoration = 2;
  // canvasKit.LineThroughDecoration = 3;

  //   // logger.profileMode = true;
  //   logger.setLogLevel(LogLevel.ERROR);
  //   Drawer.pixelRatio = pixelRatio;
  // const originMakeFromFontCollectionMethod =
  //   canvasKit.ParagraphBuilder.MakeFromFontCollection;
  // canvasKit.ParagraphBuilder.MakeFromFontCollection = function (
  //   style: any,
  //   fontCollection: any
  // ) {
  //   return ParagraphBuilder.MakeFromFontCollection(
  //     originMakeFromFontCollectionMethod,
  //     style,
  //     fontCollection,
  //     embeddingFonts,
  //     iconFonts
  //   );
  // };
  const originalDrawParagraph = canvasKit.Canvas.prototype.drawParagraph
  canvasKit.Canvas.prototype.drawParagraph = function (p: Paragraph, x: number, y: number) {
    // if (paragraph.isMiniTex === true) {
    //   drawParagraph(canvasKit, this, paragraph, dx, dy);
    // } else {
    originalDrawParagraph.apply(this, [p, x, y]);
    // }
  };

  const originalDrawText = canvasKit.Canvas.prototype.drawText
  canvasKit.Canvas.prototype.drawText = function (str: string, x: number, y: number, paint: Paint, font: Font) {
    originalDrawText.apply(this, [str, x, y, paint, font]);
  }
  const originalDrawTextBlob = canvasKit.Canvas.prototype.drawTextBlob
  canvasKit.Canvas.prototype.drawTextBlob = function (blob: TextBlob, x: number, y: number, paint: Paint) {
    originalDrawText.apply(this, [blob, x, y, paint]);
  }
}


export class TextLayout {
  static sharedLayoutCanvas: HTMLCanvasElement;
  static sharedLayoutContext: CanvasRenderingContext2D;

  constructor(readonly paragraph: Paragraph) { }

  glyphInfos: GlyphInfo[] = [];
  lineMetrics: LineMetrics[] = [];
  didExceedMaxLines: boolean = false;

  private previousLayoutWidth: number = 0;

  private initCanvas() {
    if (!TextLayout.sharedLayoutCanvas) {
      TextLayout.sharedLayoutCanvas = createCanvas(1, 1);
      TextLayout.sharedLayoutContext =
        TextLayout.sharedLayoutCanvas!.getContext(
          "2d"
        ) as CanvasRenderingContext2D;
    }
  }

  measureGlyphIfNeeded() {
    if (Object.keys(this.glyphInfos).length <= 0) {
      this.layout(-1, true);
    }
  }

  layout(layoutWidth: number, forceCalcGlyphInfos: boolean = false): void {
    let layoutStartTime!: number;
    if (logger.profileMode) {
      layoutStartTime = new Date().getTime();
    }
    if (layoutWidth < 0) {
      layoutWidth = this.previousLayoutWidth;
    }
    this.previousLayoutWidth = layoutWidth;
    this.initCanvas();
    this.glyphInfos = [];
    let currentLineMetrics: LineMetrics = {
      startIndex: 0,
      endIndex: 0,
      endExcludingWhitespaces: 0,
      endIncludingNewline: 0,
      isHardBreak: false,
      ascent: 0,
      descent: 0,
      height: 0,
      heightMultiplier: Math.max(
        1,
        (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
      ),
      width: 0,
      justifyWidth:
        this.paragraph.paragraphStyle.textAlign?.value === TextAlign.Justify
          ? layoutWidth
          : undefined,
      left: 0,
      yOffset: 0,
      baseline: 0,
      lineNumber: 0,
      isLastLine: false,
    };
    let lineMetrics: LineMetrics[] = [];
    const spans = spanWithNewline(this.paragraph.spans);
    spans.forEach((span) => {
      if (span instanceof TextSpan) {
        TextLayout.sharedLayoutContext.font = span.toCanvasFont();
        const matrics = TextLayout.sharedLayoutContext.measureText(span.originText);

        let iconFontWidth = 0;
        if (this.paragraph.iconFontData) {
          const fontSize = span.style.fontSize ?? 14;
          iconFontWidth = fontSize;
          currentLineMetrics.ascent = fontSize;
          currentLineMetrics.descent = 0;
          span.letterBaseline = fontSize;
          span.letterHeight = fontSize;
        } else {
          const mHeight = TextLayout.sharedLayoutContext.measureText("M").width;
          currentLineMetrics.ascent = mHeight * 1.15;
          currentLineMetrics.descent = mHeight * 0.35;
          span.letterBaseline = mHeight * 1.15;
          span.letterHeight = mHeight * 1.15 + mHeight * 0.35;
        }

        if (span.style.heightMultiplier && span.style.heightMultiplier > 0) {
          currentLineMetrics.heightMultiplier = Math.max(
            currentLineMetrics.heightMultiplier,
            span.style.heightMultiplier / 1.5
          );
        }

        currentLineMetrics.height = Math.max(
          currentLineMetrics.height,
          currentLineMetrics.ascent + currentLineMetrics.descent
        );

        currentLineMetrics.baseline = Math.max(
          currentLineMetrics.baseline,
          currentLineMetrics.ascent
        );

        if (this.paragraph.iconFontData) {
          const textWidth = span.charSequence.length * iconFontWidth;
          currentLineMetrics.endIndex += span.charSequence.length;
          currentLineMetrics.width += textWidth;
        } else if (
          currentLineMetrics.width + matrics.width < layoutWidth &&
          !span.hasLetterSpacing() &&
          !span.hasWordSpacing() &&
          !forceCalcGlyphInfos
        ) {
          // fast measure
          if (span instanceof NewlineSpan) {
            const newLineMatrics: LineMetrics =
              this.createNewLine(currentLineMetrics);
            lineMetrics.push(currentLineMetrics);
            currentLineMetrics = newLineMatrics;
          } else {
            currentLineMetrics.endIndex += span.charSequence.length;
            currentLineMetrics.width += matrics.width;
            if (span.style.fontStyle?.slant?.value === FontSlant.Italic) {
              currentLineMetrics.width += 2;
            }
          }
        } else {
          let letterMeasureResult = LetterMeasurer.measureLetters(
            span,
            TextLayout.sharedLayoutContext
          );
          let advances: number[] = letterMeasureResult.advances;

          if (span instanceof NewlineSpan) {
            advances = [0, 0];
          }

          if (
            Math.abs(advances[advances.length - 1] - layoutWidth) < 10 &&
            layoutWidth === this.previousLayoutWidth
          ) {
            layoutWidth = advances[advances.length - 1];
          }

          let currentWord = "";
          let currentWordWidth = 0;
          let currentWordLength = 0;
          let nextWordWidth = 0;
          let canBreak = true;
          let forceBreak = false;

          for (let index = 0; index < span.charSequence.length; index++) {
            const letter = span.charSequence[index];
            currentWord += letter;
            let currentLetterLeft = currentWordWidth;
            let spanEnded = span.charSequence[index + 1] === undefined;
            let nextWord = currentWord + span.charSequence[index + 1] ?? "";
            if (advances[index + 1] === undefined) {
              currentWordWidth += advances[index] - advances[index - 1];
            } else {
              currentWordWidth += advances[index + 1] - advances[index];
            }
            if (advances[index + 2] === undefined) {
              nextWordWidth = currentWordWidth;
            } else {
              nextWordWidth =
                currentWordWidth + (advances[index + 2] - advances[index + 1]);
            }
            currentWordLength += 1;
            canBreak = true;
            forceBreak = false;

            if (spanEnded) {
              canBreak = true;
            } else if (isEnglishWord(nextWord)) {
              canBreak = false;
            }
            if (
              isPunctuation(nextWord[nextWord.length - 1]) &&
              currentLineMetrics.width + nextWordWidth >= layoutWidth
            ) {
              forceBreak = true;
            }
            if (span instanceof NewlineSpan) {
              forceBreak = true;
            }

            const currentGlyphLeft =
              currentLineMetrics.width + currentLetterLeft;
            const currentGlyphTop = currentLineMetrics.yOffset;
            const currentGlyphWidth = (() => {
              if (advances[index + 1] === undefined) {
                return advances[index] - advances[index - 1];
              } else {
                return advances[index + 1] - advances[index];
              }
            })();
            const currentGlyphHeight = currentLineMetrics.height;
            const currentGlyphInfo: GlyphInfo = {
              graphemeLayoutBounds: valueOfRectXYWH(
                currentGlyphLeft,
                currentGlyphTop,
                currentGlyphWidth,
                currentGlyphHeight
              ),
              graphemeClusterTextRange: { start: index, end: index + 1 },
              dir: { value: TextDirection.LTR },
              isEllipsis: false,
            };
            this.glyphInfos.push(currentGlyphInfo);

            if (!canBreak) {
              continue;
            } else if (
              !forceBreak &&
              currentLineMetrics.width + currentWordWidth <= layoutWidth
            ) {
              currentLineMetrics.width += currentWordWidth;
              currentLineMetrics.endIndex += currentWordLength;
              currentWord = "";
              currentWordWidth = 0;
              currentWordLength = 0;
              canBreak = true;
            } else if (
              forceBreak ||
              currentLineMetrics.width + currentWordWidth > layoutWidth
            ) {
              const newLineMatrics: LineMetrics =
                this.createNewLine(currentLineMetrics);
              lineMetrics.push(currentLineMetrics);
              currentLineMetrics = newLineMatrics;
              currentLineMetrics.width += currentWordWidth;
              currentLineMetrics.endIndex += currentWordLength;
              currentWord = "";
              currentWordWidth = 0;
              currentWordLength = 0;
              canBreak = true;
            }
          }

          if (currentWord.length > 0) {
            currentLineMetrics.width += currentWordWidth;
            currentLineMetrics.endIndex += currentWordLength;
          }
        }
      }
    });
    lineMetrics.push(currentLineMetrics);
    if (
      this.paragraph.paragraphStyle.maxLines &&
      lineMetrics.length > this.paragraph.paragraphStyle.maxLines
    ) {
      this.didExceedMaxLines = true;
      lineMetrics = lineMetrics.slice(
        0,
        this.paragraph.paragraphStyle.maxLines
      );
    } else {
      this.didExceedMaxLines = false;
    }
    logger.debug("TextLayout.layout.lineMetrics", lineMetrics);
    if (logger.profileMode) {
      const layoutCostTime = new Date().getTime() - layoutStartTime;
      logger.profile("Layout cost", layoutCostTime);
    }
    lineMetrics[lineMetrics.length - 1].isLastLine = true;
    this.lineMetrics = lineMetrics;
  }

  private createNewLine(currentLineMetrics: LineMetrics): LineMetrics {
    return {
      startIndex: currentLineMetrics.endIndex,
      endIndex: currentLineMetrics.endIndex,
      endExcludingWhitespaces: 0,
      endIncludingNewline: 0,
      isHardBreak: false,
      ascent: currentLineMetrics.ascent,
      descent: currentLineMetrics.descent,
      height: currentLineMetrics.height,
      heightMultiplier: Math.max(
        1,
        (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
      ),
      width: 0,
      justifyWidth: currentLineMetrics.justifyWidth,
      left: 0,
      yOffset:
        currentLineMetrics.yOffset +
        currentLineMetrics.height * currentLineMetrics.heightMultiplier +
        currentLineMetrics.height * 0.15, // 行间距
      baseline: currentLineMetrics.baseline,
      lineNumber: currentLineMetrics.lineNumber + 1,
      isLastLine: false,
    };
  }
}
