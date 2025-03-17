import { ParagraphBuilder } from "../canvaskit";
import { SkEmbindObject, _Paint } from "../bass";

import { Drawer } from "../impl/drawer";
import { TextLayout } from "../impl/layout";
import { Span, TextSpan } from "../impl/span";
import type { Paragraph } from "../canvaskit";

// let drawParagraphSharedPaint: any;

export const drawParagraph = function (
  CanvasKit: any,
  skCanvas: any,
  paragraph: _Paragraph,
  dx: number,
  dy: number
) {
  // let drawStartTime!: number;
  // if (logger.profileMode) {
  //   drawStartTime = new Date().getTime();
  // }
  // let canvasImg: any
  let canvasImg = paragraph.skImageCache;
  if (!canvasImg) {
    const drawer = new Drawer(paragraph);
    const imageData = drawer.draw();
    canvasImg = CanvasKit.MakeImage(
      {
        width: imageData.width,
        height: imageData.height,
        alphaType: CanvasKit.AlphaType.Unpremul,
        colorType: CanvasKit.ColorType.RGBA_8888,
        colorSpace: CanvasKit.ColorSpace.SRGB,
      },
      imageData.data,
      4 * imageData.width
    );
    paragraph.skImageCache = canvasImg;
    paragraph.skImageWidth = imageData.width;
    paragraph.skImageHeight = imageData.height;
  }
  const srcRect = CanvasKit.XYWHRect(
    0,
    0,
    paragraph.skImageWidth!,
    paragraph.skImageHeight!
  );
  const dstRect = CanvasKit.XYWHRect(
    Math.ceil(dx),
    Math.ceil(dy),
    paragraph.skImageWidth! / Drawer.pixelRatio,
    paragraph.skImageHeight! / Drawer.pixelRatio
  );
  // const skPaint = drawParagraphSharedPaint ?? new CanvasKit.Paint();
  // drawParagraphSharedPaint = skPaint;

  // skCanvas.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
  skCanvas.drawImageRect(canvasImg, srcRect, dstRect, new CanvasKit.Paint());
  // if (logger.profileMode) {
  //   const drawCostTime = new Date().getTime() - drawStartTime;
  //   logger.profile("drawParagraph cost", drawCostTime);
  // }
};

export class _Paragraph extends SkEmbindObject<"Paragraph"> implements Paragraph {
  iconFontMap?: Record<string, string>;

  constructor(
    readonly spans: Span[],
    readonly paragraphStyle: ParagraphStyle,
    readonly iconFontData?: string
  ) {
    super("Paragraph");
    if (this.iconFontData) {
      // this.iconFontMap = JSON.parse(this.iconFontData);
    }
  }

  delete(): void {
    if (this.skImageCache) {
      this.skImageCache.delete();
      this.skImageCache = undefined;
    }
    super.delete();
  }

  // public _type = "SkParagraph";
  public isMiniTex = true;
  public skImageCache?: SkEmbindObject<"Image">;
  public skImageWidth?: number;
  public skImageHeight?: number;
  private _textLayout = new TextLayout(this);

  didExceedMaxLines(): boolean {
    return this._textLayout.didExceedMaxLines;
  }

  getAlphabeticBaseline(): number {
    return 0;
  }

  /**
   * Returns the index of the glyph that corresponds to the provided coordinate,
   * with the top left corner as the origin, and +y direction as down.
   */
  getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
    // throw new Error("getGlyphPositionAtCoordinate not implemented")
    this._textLayout.measureGlyphIfNeeded();
    for (let index = 0; index < this._textLayout.glyphInfos.length; index++) {
      const glyphInfo = this._textLayout.glyphInfos[index];
      const left = glyphInfo.graphemeLayoutBounds[0];
      const top = glyphInfo.graphemeLayoutBounds[1];
      const width = glyphInfo.graphemeLayoutBounds[2] - left;
      const height = glyphInfo.graphemeLayoutBounds[3] - top;
      if (dx >= left && dx <= left + width && dy >= top && dy <= top + height) {
        return { pos: index, affinity: { value: Affinity.Downstream } };
      }
    }
    for (let index = 0; index < this._textLayout.lineMetrics.length; index++) {
      const lineMetrics = this._textLayout.lineMetrics[index];
      const isLastLine = index === this._textLayout.lineMetrics.length - 1;
      const left = 0;
      const top = lineMetrics.yOffset;
      const width = lineMetrics.width;
      const height = lineMetrics.height;
      if (dy >= top && dy <= top + height) {
        if (dx <= 0) {
          return {
            pos: lineMetrics.startIndex,
            affinity: { value: Affinity.Downstream },
          };
        } else if (dx >= width) {
          return {
            pos: lineMetrics.endIndex,
            affinity: { value: Affinity.Downstream },
          };
        }
      }
      if (dy >= top + height && isLastLine) {
        return {
          pos: lineMetrics.endIndex,
          affinity: { value: Affinity.Downstream },
        };
      }
    }
    return { pos: 0, affinity: { value: Affinity.Upstream } };
  }

  /**
   * Returns the information associated with the closest glyph at the specified
   * paragraph coordinate, or null if the paragraph is empty.
   */
  getClosestGlyphInfoAtCoordinate(dx: number, dy: number): GlyphInfo | null {
    return this.getGlyphInfoAt(this.getGlyphPositionAtCoordinate(dx, dy).pos);
  }

  /**
   * Returns the information associated with the glyph at the specified UTF-16
   * offset within the paragraph's visible lines, or null if the index is out
   * of bounds, or points to a codepoint that is logically after the last
   * visible codepoint.
   */
  getGlyphInfoAt(index: number): GlyphInfo | null {
      // throw new Error("getGlyphInfoAt not implemented")

    this._textLayout.measureGlyphIfNeeded();
    return this._textLayout.glyphInfos[index] ?? null;
  }

  getHeight(): number {
    const lineMetrics = this.getLineMetrics();
    let height = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      height += lineMetrics[i].height * lineMetrics[i].heightMultiplier;
      if (i > 0 && i < lineMetrics.length) {
        height += lineMetrics[i].height * 0.15;
      }
    }
    console.log("getHeight", height);
    return height;
  }

  getIdeographicBaseline(): number {
    return 0;
  }

  /**
   * Returns the line number of the line that contains the specified UTF-16
   * offset within the paragraph, or -1 if the index is out of bounds, or
   * points to a codepoint that is logically after the last visible codepoint.
   */
  getLineNumberAt(index: number): number {
    return this.getLineMetricsOfRange(index, index)[0]?.lineNumber ?? 0;
  }

  getLineMetrics(): LineMetrics[] {
    // console.log("getLineMetrics");
    return this._textLayout.lineMetrics;
  }

  /**
   * Returns the LineMetrics of the line at the specified line number, or null
   * if the line number is out of bounds, or is larger than or equal to the
   * specified max line number.
   */
  getLineMetricsAt(lineNumber: number): LineMetrics | null {
    return this._textLayout.lineMetrics[lineNumber] ?? null;
  }

  getLineMetricsOfRange(start: number, end: number): LineMetrics[] {
    let lineMetrics: LineMetrics[] = [];
    this._textLayout.lineMetrics.forEach((it) => {
      const range0 = [start, end];
      const range1 = [it.startIndex, it.endIndex];
      const hasIntersection = range0[1] >= range1[0] && range1[1] >= range0[0];
      if (hasIntersection) {
        lineMetrics.push(it);
      }
    });
    return lineMetrics;
  }

  getLongestLine(): number {
    return 0;
  }

  getMaxIntrinsicWidth(): number {
    const lineMetrics = this.getLineMetrics();
    let maxWidth = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      maxWidth = Math.max(
        maxWidth,
        lineMetrics[i].justifyWidth ?? lineMetrics[i].width
      );
    }
    // console.log("getMaxIntrinsicWidth", maxWidth);
    return maxWidth;
  }

  getMaxWidth(): number {
    const lineMetrics = this.getLineMetrics();
    let maxWidth = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      maxWidth = Math.max(
        maxWidth,
        lineMetrics[i].justifyWidth ?? lineMetrics[i].width
      );
    }
    // console.log("getMaxWidth", maxWidth);
    return maxWidth;
  }

  getMinIntrinsicWidth(): number {
    const lineMetrics = this.getLineMetrics();
    let width = 0;
    for (let i = 0; i < lineMetrics.length; i++) {
      width = Math.max(width, lineMetrics[i].width);
    }
    // console.log("getMinIntrinsicWidth", width);
    return width;
  }

  /**
   * Returns the total number of visible lines in the paragraph.
   */
  getNumberOfLines(): number {
    return this._textLayout.lineMetrics.length;
  }

  getRectsForPlaceholders(): RectWithDirection[] {
    return [];
  }

  /**
   * Returns bounding boxes that enclose all text in the range of glpyh indexes [start, end).
   * @param start
   * @param end
   * @param hStyle
   * @param wStyle
   */
  getRectsForRange(
    start: number,
    end: number,
    hStyle: SkEnum<RectHeightStyle>,
    wStyle: SkEnum<RectWidthStyle>
  ): RectWithDirection[] {
    this._textLayout.measureGlyphIfNeeded();
    let result: RectWithDirection[] = [];
    this._textLayout.lineMetrics.forEach((it) => {
      const range0 = [start, end];
      const range1 = [it.startIndex, it.endIndex];
      const hasIntersection = range0[1] > range1[0] && range1[1] > range0[0];
      if (hasIntersection) {
        const intersecRange = [
          Math.max(range0[0], range1[0]),
          Math.min(range0[1], range1[1]),
        ];
        let currentLineLeft = -1;
        let currentLineTop = -1;
        let currentLineWidth = 0;
        let currentLineHeight = 0;
        for (let index = intersecRange[0]; index < intersecRange[1]; index++) {
          const glyphInfo = this._textLayout.glyphInfos[index];
          if (glyphInfo) {
            if (currentLineLeft < 0) {
              currentLineLeft = glyphInfo.graphemeLayoutBounds[0];
            }
            if (currentLineTop < 0) {
              currentLineTop = glyphInfo.graphemeLayoutBounds[1];
            }
            currentLineTop = Math.min(
              currentLineTop,
              glyphInfo.graphemeLayoutBounds[1]
            );
            currentLineWidth =
              glyphInfo.graphemeLayoutBounds[2] - currentLineLeft;
            currentLineHeight = Math.max(
              currentLineHeight,
              glyphInfo.graphemeLayoutBounds[3] - currentLineTop
            );
          }
        }
        result.push({
          rect: new Float32Array([
            currentLineLeft,
            currentLineTop,
            currentLineLeft + currentLineWidth,
            currentLineTop + currentLineHeight,
          ]),
          dir: { value: TextDirection.LTR },
        });
      }
    });
    if (result.length === 0) {
      const lastSpan = this.spans[this.spans.length - 1];
      const lastLine =
        this._textLayout.lineMetrics[this._textLayout.lineMetrics.length - 1];
      if (
        end > lastLine.endIndex &&
        lastSpan instanceof TextSpan &&
        lastSpan.originText.endsWith("\n")
      ) {
        return [
          {
            rect: new Float32Array([
              0,
              lastLine.yOffset,
              0,
              lastLine.yOffset + lastLine.height,
            ]),
            dir: { value: TextDirection.LTR },
          },
        ];
      }
    }
    return result;
  }

  /**
   * Finds the first and last glyphs that define a word containing the glyph at index offset.
   * @param offset
   */
  getWordBoundary(offset: number): URange {
    throw new Error("Not implemented");
    return { start: offset, end: offset };
  }

  /**
   * Returns an array of ShapedLine objects, describing the paragraph.
   */
  getShapedLines(): ShapedLine[] {
    throw new Error("Not implemented");
    return [];
  }

  /**
   * Lays out the text in the paragraph so it is wrapped to the given width.
   * @param width
   */
  layout(width: number): void {
    // if (this.skImageCache) {
    //   this.skImageCache.delete();
    // }
    // this.skImageCache = undefined;
    this._textLayout.layout(width);
  }

  /**
   * When called after shaping, returns the glyph IDs which were not matched
   * by any of the provided fonts.
   */
  unresolvedCodepoints(): number[] {
    throw new Error("Not implemented");
    return [];
  }
}

export class _ParagraphBuilder extends SkEmbindObject<"ParagraphBuilder">  implements ParagraphBuilder {
  static MakeFromFontProvider(style: ParagraphStyle, fontSrc: TypefaceFontProvider): ParagraphBuilder {
    throw new Error("MakeFromFontProvider not implemented.");
  }

  static ShapeText(text: string, runs: FontBlock[], width?: number): ShapedLine[] {
    throw new Error("ShapeText not implemented.");
  }

  static Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
    return this.MakeFromFontCollection(style, null);
  }

  static  MakeFromFontCollection(
    style: ParagraphStyle,
    fontCollection: FontCollection
  ): ParagraphBuilder {
    return new _ParagraphBuilder(style);
    throw new Error("MakeFromFontCollection not implemented.");
  }

  static RequiresClientICU(): boolean {
    return false;
  }

  constructor(readonly style: ParagraphStyle, readonly iconFontData?: string) {
    super("ParagraphBuilder")
  }

  // isMiniTex = true;

  private spans: Span[] = [];
  private styles: TextStyle[] = [];

  /**
   * Pushes the information required to leave an open space.
   * @param width
   * @param height
   * @param alignment
   * @param baseline
   * @param offset
   */
  addPlaceholder(
    width?: number,
    height?: number,
    alignment?: PlaceholderAlignment,
    baseline?: TextBaseline,
    offset?: number
  ): void { }

  /**
   * Adds text to the builder. Forms the proper runs to use the upper-most style
   * on the style_stack.
   * @param str
   */
  addText(str: string): void {
    console.log("ParagraphBuilder.addText", str);
    let mergedStyle: TextStyle = {};
    this.styles.forEach((it) => {
      Object.assign(mergedStyle, it);
    });
    const span = new TextSpan(str, mergedStyle);
    this.spans.push(span);
  }

  /**
   * Returns a Paragraph object that can be used to be layout and paint the text to an
   * Canvas.
   */
  build(): _Paragraph {
    console.log("ParagraphBuilder.build");
    console.log("spans:", this.spans.length);
    return new _Paragraph(this.spans, this.style, this.iconFontData);
  }

  /**
   * @param words is an array of word edges (starting or ending). You can
   * pass 2 elements (0 as a start of the entire text and text.size as the
   * end). This information is only needed for a specific API method getWords.
   *
   * The indices are expected to be relative to the UTF-8 representation of
   * the text.
   */
  setWordsUtf8(words: InputWords): void { }
  /**
   * @param words is an array of word edges (starting or ending). You can
   * pass 2 elements (0 as a start of the entire text and text.size as the
   * end). This information is only needed for a specific API method getWords.
   *
   * The indices are expected to be relative to the UTF-16 representation of
   * the text.
   *
   * The `Intl.Segmenter` API can be used as a source for this data.
   */
  setWordsUtf16(words: InputWords): void { }

  /**
   * @param graphemes is an array of indexes in the input text that point
   * to the start of each grapheme.
   *
   * The indices are expected to be relative to the UTF-8 representation of
   * the text.
   */
  setGraphemeBreaksUtf8(graphemes: InputGraphemes): void { }
  /**
   * @param graphemes is an array of indexes in the input text that point
   * to the start of each grapheme.
   *
   * The indices are expected to be relative to the UTF-16 representation of
   * the text.
   *
   * The `Intl.Segmenter` API can be used as a source for this data.
   */
  setGraphemeBreaksUtf16(graphemes: InputGraphemes): void { }

  /**
   * @param lineBreaks is an array of unsigned integers that should be
   * treated as pairs (index, break type) that point to the places of possible
   * line breaking if needed. It should include 0 as the first element.
   * Break type == 0 means soft break, break type == 1 is a hard break.
   *
   * The indices are expected to be relative to the UTF-8 representation of
   * the text.
   */
  setLineBreaksUtf8(lineBreaks: InputLineBreaks): void { }
  /**
   * @param lineBreaks is an array of unsigned integers that should be
   * treated as pairs (index, break type) that point to the places of possible
   * line breaking if needed. It should include 0 as the first element.
   * Break type == 0 means soft break, break type == 1 is a hard break.
   *
   * The indices are expected to be relative to the UTF-16 representation of
   * the text.
   *
   * Chrome's `v8BreakIterator` API can be used as a source for this data.
   */
  setLineBreaksUtf16(lineBreaks: InputLineBreaks): void { }

  /**
   * Returns the entire Paragraph text (which is useful in case that text
   * was produced as a set of addText calls).
   */
  getText(): string {
    throw new Error("Method not implemented.");
    // let text = "";
    // this.spans.forEach((it) => {
    //   if (it instanceof TextSpan) {
    //     text += it.originText;
    //   }
    // });
    // if (typeof window === "object" && window.TextEncoder) {
    //   const encoder = new window.TextEncoder();
    //   const view = encoder.encode(text);
    //   return String.fromCharCode(...Array.from(view));
    // }
    // return text;
  }

  /**
   * Remove a style from the stack. Useful to apply different styles to chunks
   * of text such as bolding.
   */
  pop(): void {
    // logger.debug("ParagraphBuilder.pop");
    this.styles.pop();
  }

  /**
   * Push a style to the stack. The corresponding text added with addText will
   * use the top-most style.
   * @param textStyle
   */
  pushStyle(textStyle: TextStyle): void {
    // logger.debug("ParagraphBuilder.pushStyle", textStyle);
    this.styles.push(textStyle);
  }

  /**
   * Pushes a TextStyle using paints instead of colors for foreground and background.
   * @param textStyle
   * @param fg
   * @param bg
   */
  pushPaintStyle(textStyle: TextStyle, fg: _Paint, bg: _Paint): void {
    // logger.debug("ParagraphBuilder.pushPaintStyle", textStyle, fg, bg);
    this.styles.push(textStyle);
  }

  /**
   * Resets this builder to its initial state, discarding any text, styles, placeholders that have
   * been added, but keeping the initial ParagraphStyle.
   */
  reset(): void {
    // logger.debug("ParagraphBuilder.reset");
    throw new Error("Method not implemented.");
    this.spans = [];
    this.styles = [];
  }
}
