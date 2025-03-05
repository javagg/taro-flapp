import {
    CanvasKit,
    EmbindObject,
    FontBlock, FontCollection,
    FontMgrFactory,
    FontCollectionFactory, FontMgr, ParagraphBuilder, ParagraphBuilderFactory, ParagraphStyle, ShapedLine, TypefaceFontProvider,
    TypefaceFactory,
    Typeface,
    TypefaceFontProviderFactory,
    Font,
    FontEdging,
    FontHinting,
    InputGlyphIDArray,
    GlyphIDArray,
    Paint,
    FontMetrics,
    StrutStyle,
    TextAlign,
    TextDirection,
    FontStyle,
    TextHeightBehavior,
    TextStyle,
    DecorationStyle,
    InputColor,
    TextBaseline,
    TextFontFeatures,
    TextFontVariations,
    TextShadow,
    BlendMode,
    Blender,
    Color,
    ColorFilter,
    ColorInt,
    ColorSpace,
    GlyphInfo,
    Image,
    ImageFilter,
    InputGraphemes,
    InputLineBreaks,
    InputWords,
    LineMetrics,
    MaskFilter,
    PaintStyle,
    Paragraph,
    PathEffect,
    PlaceholderAlignment,
    PositionWithAffinity,
    RectHeightStyle,
    RectWidthStyle,
    RectWithDirection,
    Shader,
    StrokeCap,
    StrokeJoin,
    URange,
} from "./mtex/canvaskit";

import {
    colorToHex, convertToUpwardToPixelRatio, isEnglishWord, isPunctuation, isSquareCharacter,
} from "./mtex/util";

import {
    default as layoutEngine,
    bidi, Fragment, AttributedString,
    fromFragments, linebreaker, justification, scriptItemizer,
    textDecoration, fontSubstitution,
} from '@react-pdf/textkit';

import FontStore from '@react-pdf/font';
import { drawStyledText, defineText } from '@yuneco/canvas-text-styled'

const layout = layoutEngine({
    bidi: bidi,
    linebreaker: linebreaker,
    justification: justification,
    fontSubstitution: fontSubstitution,
    scriptItemizer: scriptItemizer,
    textDecoration: textDecoration,
})

const fontStore = new FontStore();
const helvetica = fontStore.getFont({ fontFamily: 'Helvetica' }).data;


export abstract class SkEmbindObject<T extends string> implements EmbindObject<T> {
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

export class _ParagraphBuilderFactory implements ParagraphBuilderFactory {
    /**
     * Creates a ParagraphBuilder using the fonts available from the given font provider.
     * @param style
     * @param fontSrc
     */
    MakeFromFontProvider(style: ParagraphStyle, fontSrc: TypefaceFontProvider): ParagraphBuilder {
        throw new Error("MakeFromFontProvider not implemented.");
    }

    /**
     * Return a shaped array of lines
     */
    ShapeText(text: string, runs: FontBlock[], width?: number): ShapedLine[] {
        throw new Error("ShapeText not implemented.");
    }

    /**
     * Creates a ParagraphBuilder using the fonts available from the given font manager.
     * @param style
     * @param fontManager
     */
    Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
        return this.MakeFromFontCollection(style, new _FontCollection());
    }

    /**
     * Creates a ParagraphBuilder using the given font collection.
     * @param style
     * @param fontCollection
     */
    MakeFromFontCollection(style: ParagraphStyle, fontCollection: FontCollection): ParagraphBuilder {
        return new _ParagraphBuilder(style)
    }

    /**
     * Whether the paragraph builder requires ICU data to be provided by the
     * client.
     */
    RequiresClientICU(): boolean {
        return false;
    }
}

export class _FontCollection extends SkEmbindObject<"FontCollection"> implements FontCollection {
    constructor() {
        super("FontCollection");
    }

    setDefaultFontManager(fontManager: TypefaceFontProvider | null): void { }

    enableFontFallback(): void { }
}

export class _FontCollectionFactory implements FontCollectionFactory {
    Make(): FontCollection {
        return new _FontCollection();
    }
}

export class _FontMgr extends SkEmbindObject<"FontMgr"> implements FontMgr {

    /**
    * Return the number of font families loaded in this manager. Useful for debugging.
    */
    constructor() {
        super("FontMgr")
    }

    countFamilies(): number {
        return 0;
    }

    /**
     * Return the nth family name. Useful for debugging.
     * @param index
     */
    getFamilyName(index: number): string {
        return "";
    }

    /**
     * Find the closest matching typeface to the specified familyName and style.
     */
    matchFamilyStyle(name: string, style: FontStyle): Typeface {
        throw new Error("matchFamilyStyle not implemented.");
    }
}

export class _FontMgrFactory implements FontMgrFactory {
    FromData(...buffers: ArrayBuffer[]): FontMgr | null {
        return null
    }
}

export class _TypefaceFactory implements TypefaceFactory {
    GetDefault(): Typeface | null {
        return null;
    }

    MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null {
        return null;
    }

    MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null {
        return null;
    }
}

export class _TypefaceFontProviderFactory implements TypefaceFontProviderFactory {
    Make(): TypefaceFontProvider {
        return new _TypefaceFontProvider();
    }
}

export class _TypefaceFontProvider extends _FontMgr implements TypefaceFontProvider {

    registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {
        // if (bytes instanceof Uint8Array) {
        //     bytes = bytes.buffer;
        // }
        // // let arrayBuffer = uint8Array.buffer
        // // console.log(bytes)
        // const tf = new _TypefaceFactory().MakeFreeTypeFaceFromData(bytes)
        // this.typefaces.push(tf!)
        // const font = new FontFace(family, bytes);
        // font.load();
        // document.fonts.add(font);
    }
}


export class _Font extends SkEmbindObject<"Font"> implements Font {
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
        super("Font");
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
        return null;
    }
    setEdging(edging: FontEdging): void { }
    setEmbeddedBitmaps(embeddedBitmaps: boolean): void { }
    setHinting(hinting: FontHinting): void { }
    setLinearMetrics(linearMetrics: boolean): void {

    }
    setScaleX(sx: number): void {
    }
    setSize(points: number): void {
    }
    setSkewX(sx: number): void {
    }
    setEmbolden(embolden: boolean): void {
    }
    setSubpixel(subpixel: boolean): void {
    }
    setTypeface(face: Typeface | null): void {
    }
}

export class _ParagraphStyle implements ParagraphStyle {
    constructor(ps: ParagraphStyle) {
        Object.assign(this, ps);
    }

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

export class _TextStyle implements TextStyle {
    constructor(ts: TextStyle) {
        Object.assign(this, ts);
    }

    backgroundColor?: InputColor;
    color?: InputColor;
    decoration?: number;
    decorationColor?: InputColor;
    decorationThickness?: number;
    decorationStyle?: DecorationStyle;
    fontFamilies?: string[];
    fontFeatures?: TextFontFeatures[];
    fontSize?: number;
    fontStyle?: FontStyle;
    fontVariations?: TextFontVariations[];
    foregroundColor?: InputColor;
    heightMultiplier?: number;
    halfLeading?: boolean;
    letterSpacing?: number;
    locale?: string;
    shadows?: TextShadow[];
    textBaseline?: TextBaseline;
    wordSpacing?: number;
}


export class _ParagraphBuilder extends SkEmbindObject<"ParagraphBuilder"> implements ParagraphBuilder {

    private spans: Span[] = [];
    private styles: TextStyle[] = [];

    private textStyles: TextStyle[] = [];

    private attrStrings: AttributedString[] = [];

    private unstrings: AttributedString[] = [];

    constructor(private style: ParagraphStyle) {
        super("ParagraphBuilder")
    }

    /**
     * Pushes the information required to leave an open space.
     * @param width
     * @param height
     * @param alignment
     * @param baseline
     * @param offset
     */
    addPlaceholder(width?: number, height?: number, alignment?: PlaceholderAlignment, baseline?: TextBaseline, offset?: number): void {
        throw new Error("addPlaceholder not implemented.");
    }

    /**
     * Adds text to the builder. Forms the proper runs to use the upper-most style
     * on the style_stack.
     * @param str
     */
    addText(str: string): void {
        console.log("ParagraphBuilder.addText", str);
        // console.log(this.style)
        let mergedStyle: TextStyle = {};
        this.styles.forEach((it) => {
            Object.assign(mergedStyle, it);
        });
        const span = new TextSpan(str, mergedStyle);
        this.spans.push(span);

        this.unstrings.push({
            string: str,
            runs: [
                {
                    start: 0,
                    end: str.length,
                    attributes: {},
                }
            ]
        });
    }

    /**
     * Returns a Paragraph object that can be used to be layout and paint the text to an
     * Canvas.
     */
    build(): Paragraph {
        console.log("ParagraphBuilder.build");
        // return new Paragraph(this.spans, this.style, this.iconFontData);
        return new _Paragraph(this.style)
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
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
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
        let text = "";
        this.spans.forEach((it) => {
            if (it instanceof TextSpan) {
                text += it.originText;
            }
        });
        if (typeof window === "object" && window.TextEncoder) {
            const encoder = new window.TextEncoder();
            const view = encoder.encode(text);
            return String.fromCharCode(...Array.from(view));
        }
        return text;
    }

    /**
    * Remove a style from the stack. Useful to apply different styles to chunks
    * of text such as bolding.
    */
    pop(): void {
        this.styles.pop();
    }

    /**
     * Push a style to the stack. The corresponding text added with addText will
     * use the top-most style.
     * @param textStyle
     */
    pushStyle(text: TextStyle): void {
        this.styles.push(text);
        this.textStyles.push(text);
    }

    /**
     * Pushes a TextStyle using paints instead of colors for foreground and background.
     * @param textStyle
     * @param fg
     * @param bg
     */
    pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void {
        this.styles.push(textStyle);
        this.textStyles.push(textStyle);
    }

    /**
     * Resets this builder to its initial state, discarding any text, styles, placeholders that have
     * been added, but keeping the initial ParagraphStyle.
     */
    reset(): void {
        this.spans = [];
        this.styles = [];
    }
}

export class _Paragraph extends SkEmbindObject<"Paragraph"> implements Paragraph {

    iconFontMap?: Record<string, string>;

    public skImageCache?: Image;
    public skImageWidth?: number;
    public skImageHeight?: number;
    // private _textLayout = new TextLayout(this);

    glyphInfos: GlyphInfo[] = [];
    lineMetrics: LineMetrics[] = [];
    _didExceedMaxLines: boolean = false;

    private previousLayoutWidth: number = 0;


    attrStrings: AttributedString[][] = [];
    
    constructor(private style: ParagraphStyle, private context: CanvasRenderingContext2D) {
        super("Paragraph")
        // if (this.iconFontData) {
        // this.iconFontMap = JSON.parse(this.iconFontData);
        //   }
    }

    didExceedMaxLines(): boolean {
        return this._didExceedMaxLines;
    }

    getAlphabeticBaseline(): number {
        return 0;
    }

    /**
     * Returns the index of the glyph that corresponds to the provided coordinate,
     * with the top left corner as the origin, and +y direction as down.
     */
    getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
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
        this.measureGlyphIfNeeded();
        return this.glyphInfos[index] ?? null;
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
        // console.log("getHeight", height);
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
        return this.lineMetrics;
    }

    /**
     * Returns the LineMetrics of the line at the specified line number, or null
     * if the line number is out of bounds, or is larger than or equal to the
     * specified max line number.
     */
    getLineMetricsAt(lineNumber: number): LineMetrics | null {
        return this.lineMetrics[lineNumber] ?? null;
    }
    
    getLineMetricsOfRange(start: number, end: number): LineMetrics[] {
        let lineMetrics: LineMetrics[] = [];
        this.lineMetrics.forEach((it) => {
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
        return this.lineMetrics.length;
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
    getRectsForRange(start: number, end: number, hStyle: RectHeightStyle, wStyle: RectWidthStyle): RectWithDirection[] {
        this.measureGlyphIfNeeded();
        let result: RectWithDirection[] = [];
        this.lineMetrics.forEach((it) => {
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
                    const glyphInfo = this.glyphInfos[index];
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
                this.lineMetrics[this.lineMetrics.length - 1];
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
        return { start: offset, end: offset };
    }

    /**
     * Returns an array of ShapedLine objects, describing the paragraph.
     */
    getShapedLines(): ShapedLine[] {
        return [];
    }

    /**
     * Lays out the text in the paragraph so it is wrapped to the given width.
     * @param width
     */
    layout(width: number): void {
        console.log("Paragraph.layout")
        // if (this.skImageCache) {
        //     this.skImageCache.delete();
        // }
        // this.skImageCache = undefined;
        // // this._textLayout.layout(width);
        // let layoutWidth = width;
        // if (layoutWidth < 0) {
        //     layoutWidth = this.previousLayoutWidth;
        // }
        // this.previousLayoutWidth = layoutWidth;
        // // this.initCanvas();
        // this.glyphInfos = [];
        // let currentLineMetrics: LineMetrics = {
        //     startIndex: 0,
        //     endIndex: 0,
        //     endExcludingWhitespaces: 0,
        //     endIncludingNewline: 0,
        //     isHardBreak: false,
        //     ascent: 0,
        //     descent: 0,
        //     height: 0,
        //     // heightMultiplier: Math.max(
        //     //     1,
        //     //     (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
        //     // ),
        //     width: 0,
        //     // justifyWidth:
        //     //     this.paragraph.paragraphStyle.textAlign?.value === TextAlign.Justify
        //     //         ? layoutWidth
        //     //         : undefined,
        //     left: 0,
        //     // yOffset: 0,
        //     baseline: 0,
        //     lineNumber: 0,
        //     // isLastLine: false,
        // };
        // let lineMetrics: LineMetrics[] = [];
        // const spans = spanWithNewline(this.spans);
        // spans.forEach((span) => {
        //     if (span instanceof TextSpan) {
        //         this.context.font =  span.toCanvasFont();
        //         // TextLayout.sharedLayoutContext.font = span.toCanvasFont();
        //         // const matrics = TextLayout.sharedLayoutContext.measureText(span.originText);
        //         const matrics = this.context.measureText(span.originText)

        //         let iconFontWidth = 0;
        //         if (this.iconFontData) {
        //             const fontSize = span.style.fontSize ?? 14;
        //             iconFontWidth = fontSize;
        //             currentLineMetrics.ascent = fontSize;
        //             currentLineMetrics.descent = 0;
        //             span.letterBaseline = fontSize;
        //             span.letterHeight = fontSize;
        //         } else {
        //             // const mHeight = TextLayout.sharedLayoutContext.measureText("M").width;
        //             const mHeight = this.context.measureText("M").width;
        //             currentLineMetrics.ascent = mHeight * 1.15;
        //             currentLineMetrics.descent = mHeight * 0.35;
        //             span.letterBaseline = mHeight * 1.15;
        //             span.letterHeight = mHeight * 1.15 + mHeight * 0.35;
        //         }

        //         if (span.style.heightMultiplier && span.style.heightMultiplier > 0) {
        //             currentLineMetrics.heightMultiplier = Math.max(
        //                 currentLineMetrics.heightMultiplier,
        //                 span.style.heightMultiplier / 1.5
        //             );
        //         }

        //         currentLineMetrics.height = Math.max(
        //             currentLineMetrics.height,
        //             currentLineMetrics.ascent + currentLineMetrics.descent
        //         );

        //         currentLineMetrics.baseline = Math.max(
        //             currentLineMetrics.baseline,
        //             currentLineMetrics.ascent
        //         );

        //         if (this.iconFontData) {
        //             const textWidth = span.charSequence.length * iconFontWidth;
        //             currentLineMetrics.endIndex += span.charSequence.length;
        //             currentLineMetrics.width += textWidth;
        //         } else if (
        //             currentLineMetrics.width + matrics.width < layoutWidth &&
        //             !span.hasLetterSpacing() &&
        //             !span.hasWordSpacing() &&
        //             !forceCalcGlyphInfos
        //         ) {
        //             // fast measure
        //             if (span instanceof NewlineSpan) {
        //                 const newLineMatrics = this.createNewLine(currentLineMetrics);
        //                 lineMetrics.push(currentLineMetrics);
        //                 currentLineMetrics = newLineMatrics;
        //             } else {
        //                 currentLineMetrics.endIndex += span.charSequence.length;
        //                 currentLineMetrics.width += matrics.width;
        //                 if (span.style.fontStyle?.slant?.value === FontSlant.Italic) {
        //                     currentLineMetrics.width += 2;
        //                 }
        //             }
        //         } else {
        //             let letterMeasureResult = LetterMeasurer.measureLetters(
        //                 span,
        //                 this.context, //TextLayout.sharedLayoutContext
        //             );
        //             let advances: number[] = letterMeasureResult.advances;

        //             if (span instanceof NewlineSpan) {
        //                 advances = [0, 0];
        //             }

        //             if (
        //                 Math.abs(advances[advances.length - 1] - layoutWidth) < 10 &&
        //                 layoutWidth === this.previousLayoutWidth
        //             ) {
        //                 layoutWidth = advances[advances.length - 1];
        //             }

        //             let currentWord = "";
        //             let currentWordWidth = 0;
        //             let currentWordLength = 0;
        //             let nextWordWidth = 0;
        //             let canBreak = true;
        //             let forceBreak = false;

        //             for (let index = 0; index < span.charSequence.length; index++) {
        //                 const letter = span.charSequence[index];
        //                 currentWord += letter;
        //                 let currentLetterLeft = currentWordWidth;
        //                 let spanEnded = span.charSequence[index + 1] === undefined;
        //                 let nextWord = currentWord + span.charSequence[index + 1] ?? "";
        //                 if (advances[index + 1] === undefined) {
        //                     currentWordWidth += advances[index] - advances[index - 1];
        //                 } else {
        //                     currentWordWidth += advances[index + 1] - advances[index];
        //                 }
        //                 if (advances[index + 2] === undefined) {
        //                     nextWordWidth = currentWordWidth;
        //                 } else {
        //                     nextWordWidth =
        //                         currentWordWidth + (advances[index + 2] - advances[index + 1]);
        //                 }
        //                 currentWordLength += 1;
        //                 canBreak = true;
        //                 forceBreak = false;

        //                 if (spanEnded) {
        //                     canBreak = true;
        //                 } else if (isEnglishWord(nextWord)) {
        //                     canBreak = false;
        //                 }
        //                 if (
        //                     isPunctuation(nextWord[nextWord.length - 1]) &&
        //                     currentLineMetrics.width + nextWordWidth >= layoutWidth
        //                 ) {
        //                     forceBreak = true;
        //                 }
        //                 if (span instanceof NewlineSpan) {
        //                     forceBreak = true;
        //                 }

        //                 const currentGlyphLeft =
        //                     currentLineMetrics.width + currentLetterLeft;
        //                 const currentGlyphTop = currentLineMetrics.yOffset;
        //                 const currentGlyphWidth = (() => {
        //                     if (advances[index + 1] === undefined) {
        //                         return advances[index] - advances[index - 1];
        //                     } else {
        //                         return advances[index + 1] - advances[index];
        //                     }
        //                 })();
        //                 const currentGlyphHeight = currentLineMetrics.height;
        //                 const currentGlyphInfo: GlyphInfo = {
        //                     graphemeLayoutBounds: Float32Array.from([
        //                         currentGlyphLeft,
        //                         currentGlyphTop,
        //                         currentGlyphLeft+currentGlyphWidth,
        //                         currentGlyphTop+currentGlyphHeight,
        //                     ]),
        //                     graphemeClusterTextRange: { start: index, end: index + 1 },
        //                     dir: { value: TextDirection.LTR },
        //                     isEllipsis: false,
        //                 };
        //                 this.glyphInfos.push(currentGlyphInfo);

        //                 if (!canBreak) {
        //                     continue;
        //                 } else if (
        //                     !forceBreak &&
        //                     currentLineMetrics.width + currentWordWidth <= layoutWidth
        //                 ) {
        //                     currentLineMetrics.width += currentWordWidth;
        //                     currentLineMetrics.endIndex += currentWordLength;
        //                     currentWord = "";
        //                     currentWordWidth = 0;
        //                     currentWordLength = 0;
        //                     canBreak = true;
        //                 } else if (
        //                     forceBreak ||
        //                     currentLineMetrics.width + currentWordWidth > layoutWidth
        //                 ) {
        //                     const newLineMatrics: LineMetrics =
        //                         this.createNewLine(currentLineMetrics);
        //                     lineMetrics.push(currentLineMetrics);
        //                     currentLineMetrics = newLineMatrics;
        //                     currentLineMetrics.width += currentWordWidth;
        //                     currentLineMetrics.endIndex += currentWordLength;
        //                     currentWord = "";
        //                     currentWordWidth = 0;
        //                     currentWordLength = 0;
        //                     canBreak = true;
        //                 }
        //             }

        //             if (currentWord.length > 0) {
        //                 currentLineMetrics.width += currentWordWidth;
        //                 currentLineMetrics.endIndex += currentWordLength;
        //             }
        //         }
        //     }
        // });
        // lineMetrics.push(currentLineMetrics);
        // if (
        //     this.style.maxLines &&
        //     lineMetrics.length > this.style.maxLines
        // ) {
        //     this._didExceedMaxLines = true;
        //     lineMetrics = lineMetrics.slice(
        //         0,
        //         this.style.maxLines
        //     );
        // } else {
        //     this._didExceedMaxLines = false;
        // }
        // lineMetrics[lineMetrics.length - 1].isLastLine = true;
        // this.lineMetrics = lineMetrics;


        // const run2 = { start: 3, end: 5, attributes: { font: [helvetica] } } as any;
        // const cccc: AttributedString = fontSubstitution()({ string: 'Lorem\nLorem Lorem', runs: [run2] });
        // // const cccc: AttributedString = instance({ string: 'Lorem\nLorem Lorem', runs: [run2] });
        // this.attrStrings = layout(cccc, { x: 10, y: 10, width: 100, height: 100 });
        // console.log(this.attrStrings);
    }

    /**
     * When called after shaping, returns the glyph IDs which were not matched
     * by any of the provided fonts.
     */
    unresolvedCodepoints(): number[] {
        return [];
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
                (this.style.heightMultiplier ?? 1.5) / 1.5
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


    private measureGlyphIfNeeded() {
        if (Object.keys(this.glyphInfos).length <= 0) {
            this.layout(-1, true);
        }
    }
}


const StrokeCapEnums = {
     Butt: { value: 0},
    Round: {value: 1},
    Square: {value: 2},
}

const StrokeJoinEnums = {
    Bevel: { value: 0},
    Miter: {value: 1},
    Round: {value: 2},
}

class _Paint extends SkEmbindObject<"Paint"> implements Paint {

    private _color: Color = Float32Array.from([0, 0, 0, 255]);

    private _strokeCap = StrokeCapEnums.Butt;

    private _strokeJoin = StrokeJoinEnums.Bevel;

    private _strokeMiter = 0;

    private _strokeWidth = 0;

    private _alpha = 1.0;

    private _antiAlias = true;

    constructor() {
        super("Paint")
    }

    /**
     * Returns a copy of this paint.
     */
    copy(): Paint {
        const newValue = new _Paint();
        Object.assign(newValue, this);
        return newValue;
    }

    getColor(): Color {
        return this._color;
    }

    getStrokeCap(): StrokeCap {
        return this._strokeCap;
    }

    getStrokeJoin(): StrokeJoin {
        return this._strokeJoin;
    }

    getStrokeMiter(): number {
        return this._strokeMiter;
    }

    getStrokeWidth(): number {
        return this._strokeWidth;
    }

    setAlphaf(alpha: number): void {
        this._alpha = alpha
    }

    setAntiAlias(aa: boolean): void {
        this._antiAlias = aa;
    }

    /**
     * Sets the blend mode that is, the mode used to combine source color
     * with destination color.
     * @param mode
     */
    setBlendMode(mode: BlendMode): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Sets the current blender, increasing its refcnt, and if a blender is already
     * present, decreasing that object's refcnt.
     *
     * * A nullptr blender signifies the default SrcOver behavior.
     *
     * * For convenience, you can call setBlendMode() if the blend effect can be expressed
     * as one of those values.
     * @param blender
     */
    setBlender(blender: Blender): void {
        throw new Error("Method not implemented.");
    }

    setColor(color: InputColor, colorSpace?: ColorSpace): void {
        this._color = color;
    }

    setColorComponents(r: number, g: number, b: number, a: number, colorSpace?: ColorSpace): void {
        this.setColor(Float32Array.from([r, g, b, a]));
    }

    setColorFilter(filter: ColorFilter | null): void { }

    setColorInt(color: ColorInt, colorSpace?: ColorSpace): void { }

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

export interface LetterRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export class Span {
    letterBaseline: number = 0;
    letterHeight: number = 0;
    lettersBounding: LetterRect[] = [];
}

export class TextSpan extends Span {
    charSequence: string[];
    originText: string;

    constructor(private readonly text: string, readonly style: TextStyle) {
        super();
        this.charSequence = Array.from(text);
        this.originText = text;
    }

    hasLetterSpacing() {
        return (
            this.style.letterSpacing !== undefined && this.style.letterSpacing > 1
        );
    }

    hasWordSpacing() {
        return this.style.wordSpacing !== undefined && this.style.wordSpacing > 1;
    }

    hasJustifySpacing(paragraphStyle: ParagraphStyle) {
        return paragraphStyle.textAlign?.value === TextAlign.Justify;
    }

    toBackgroundFillStyle(): string {
        if (this.style.backgroundColor) {
            return colorToHex(this.style.backgroundColor as Float32Array);
        } else {
            return "#000000";
        }
    }

    toTextFillStyle(): string {
        if (this.style.color) {
            return colorToHex(this.style.color as Float32Array);
        } else {
            return "#000000";
        }
    }

    toDecorationStrokeStyle(): string {
        if (this.style.decorationColor) {
            return colorToHex(this.style.decorationColor as Float32Array);
        } else {
            return "#000000";
        }
    }

    toCanvasFont(): string {
        let font = `${this.style.fontSize}px system-ui, Roboto`;
        const fontWeight = this.style.fontStyle?.weight?.value;
        if (fontWeight && fontWeight !== 400) {
            if (fontWeight >= 900) {
                font = "900 " + font;
            } else {
                font = fontWeight.toFixed(0) + " " + font;
            }
        }
        const slant = this.style.fontStyle?.slant?.value;
        if (slant) {
            switch (slant) {
                case FontSlant.Italic:
                    font = "italic " + font;
                    break;
                case FontSlant.Oblique:
                    font = "oblique " + font;
                    break;
            }
        }
        return font;
    }
}

export class NewlineSpan extends TextSpan {
    constructor() {
        super("\n", {});
    }
}

export const spanWithNewline = (spans: Span[]): Span[] => {
    let result: Span[] = [];
    spans.forEach((span) => {
        if (span instanceof TextSpan) {
            if (span.originText.indexOf("\n") >= 0) {
                const components = span.originText.split("\n");
                for (let index = 0; index < components.length; index++) {
                    const component = components[index];
                    if (index > 0) {
                        result.push(new NewlineSpan());
                    }
                    result.push(new TextSpan(component, span.style));
                }
                return;
            }
        }
        result.push(span);
    });
    return result;
};


interface LetterMeasureResult {
    useCount: number;
    width: number;
}

class LetterMeasurer {
    private static LRUConfig = {
        maxCacheCount: 1000,
        minCacheCount: 200,
    };

    private static measureLRUCache: Record<string, LetterMeasureResult> = {};

    static measureLetters(
        span: TextSpan,
        context: CanvasRenderingContext2D
    ): { advances: number[] } {
        let advances: number[] = [0];
        let curPosWidth = 0;
        for (let index = 0; index < span.charSequence.length; index++) {
            const letter = span.charSequence[index];
            let wordWidth = (() => {
                if (isSquareCharacter(letter)) {
                    return this.measureSquareCharacter(context);
                } else {
                    return this.measureNormalLetter(letter, context);
                }
            })();
            if (
                span.hasWordSpacing() &&
                letter === " " &&
                isEnglishWord(span.charSequence[index - 1])
            ) {
                wordWidth = span.style.wordSpacing!;
            } else if (span.hasLetterSpacing()) {
                wordWidth += span.style.letterSpacing!;
            }
            curPosWidth += wordWidth;
            advances.push(curPosWidth);
        }
        return { advances };
    }

    private static measureNormalLetter(
        letter: string,
        context: CanvasRenderingContext2D
    ): number {
        const width =
            this.widthFromCache(context, letter) ?? context.measureText(letter).width;
        this.setWidthToCache(context, letter, width);
        return width;
    }

    private static measureSquareCharacter(
        context: CanvasRenderingContext2D
    ): number {
        const width =
            this.widthFromCache(context, "测") ?? context.measureText("测").width;
        this.setWidthToCache(context, "测", width);
        return width;
    }

    private static widthFromCache(
        context: CanvasRenderingContext2D,
        word: string
    ): number | undefined {
        const cacheKey = context.font + "_" + word;
        return this.measureLRUCache[cacheKey]?.width;
    }

    private static setWidthToCache(
        context: CanvasRenderingContext2D,
        word: string,
        width: number
    ) {
        const cacheKey = context.font + "_" + word;
        if (this.measureLRUCache[cacheKey]) {
            this.measureLRUCache[cacheKey].useCount++;
            return;
        }
        this.measureLRUCache[cacheKey] = {
            useCount: 1,
            width: width,
        };
        if (
            Object.keys(this.measureLRUCache).length > this.LRUConfig.maxCacheCount
        ) {
            this.clearCache();
        }
    }

    private static clearCache() {
        const keys = Object.keys(this.measureLRUCache).sort((a, b) => {
            return this.measureLRUCache[a].useCount > this.measureLRUCache[b].useCount
                ? 1
                : -1;
        });
        keys
            .slice(0, this.LRUConfig.maxCacheCount - this.LRUConfig.minCacheCount)
            .forEach((it) => {
                delete this.measureLRUCache[it];
            });
    }
}


export class Drawer {
    static pixelRatio = 1.0;
    static sharedRenderCanvas: HTMLCanvasElement;
    static sharedRenderContext: CanvasRenderingContext2D;

    constructor(readonly paragraph: Paragraph) { }

    // private initCanvas() {
    //     if (!Drawer.sharedRenderCanvas) {
    //         Drawer.sharedRenderCanvas = createCanvas(
    //             Math.min(4000, 1000 * Drawer.pixelRatio),
    //             Math.min(4000, 1000 * Drawer.pixelRatio)
    //         );
    //         Drawer.sharedRenderContext = Drawer.sharedRenderCanvas!.getContext(
    //             "2d"
    //         ) as CanvasRenderingContext2D;
    //     }
    // }

    draw(context: CanvasRenderingContext2D): ImageData {
        // this.initCanvas();
        const width = convertToUpwardToPixelRatio(
            this.paragraph.getMaxWidth() * Drawer.pixelRatio,
            Drawer.pixelRatio
        );
        const height = convertToUpwardToPixelRatio(
            this.paragraph.getHeight() * Drawer.pixelRatio,
            Drawer.pixelRatio
        );
        if (width <= 0 || height <= 0) {
            // const context = Drawer.sharedRenderContext;
            context.clearRect(0, 0, 1, 1);
            return context.getImageData(0, 0, 1, 1);
        }
        context.clearRect(0, 0, width, height);
        context.save();
        context.scale(Drawer.pixelRatio, Drawer.pixelRatio);

        let didExceedMaxLines = false;
        let spanLetterStartIndex = 0;
        let linesDrawingRightBounds: Record<number, number> = {};

        const spans = spanWithNewline(this.paragraph.spans);
        let linesUndrawed: Record<number, number> = {};
        this.paragraph.getLineMetrics().forEach((it) => {
            linesUndrawed[it.lineNumber] = it.endIndex - it.startIndex;
        });
        spans.forEach((span) => {
            if (didExceedMaxLines) return;
            if (span instanceof TextSpan) {
                if (span instanceof NewlineSpan) {
                    spanLetterStartIndex++;
                    return;
                }
                let spanUndrawLength = span.charSequence.length;
                let spanLetterEndIndex =
                    spanLetterStartIndex + span.charSequence.length;
                const lineMetrics = this.paragraph.getLineMetricsOfRange(
                    spanLetterStartIndex,
                    spanLetterEndIndex
                );

                context.font = span.toCanvasFont();

                while (spanUndrawLength > 0) {
                    let currentDrawText: string[] = [];
                    let currentDrawLine: LineMetrics | undefined;
                    for (let index = 0; index < lineMetrics.length; index++) {
                        const line = lineMetrics[index];
                        if (linesUndrawed[line.lineNumber] > 0) {
                            const currentDrawLength = Math.min(
                                linesUndrawed[line.lineNumber],
                                spanUndrawLength
                            );
                            currentDrawText = span.charSequence.slice(
                                span.charSequence.length - spanUndrawLength,
                                span.charSequence.length - spanUndrawLength + currentDrawLength
                            );
                            spanUndrawLength -= currentDrawLength;
                            linesUndrawed[line.lineNumber] -= currentDrawLength;
                            currentDrawLine = line;
                            break;
                        }
                    }

                    if (!currentDrawLine) break;

                    if (
                        this.paragraph.didExceedMaxLines() &&
                        this.paragraph.paragraphStyle.maxLines ===
                        currentDrawLine.lineNumber + 1 &&
                        linesUndrawed[currentDrawLine.lineNumber] <= 0
                    ) {
                        const trimLength = isSquareCharacter(
                            currentDrawText[currentDrawText.length - 1]
                        )
                            ? 1
                            : 3;
                        currentDrawText = currentDrawText.slice(
                            0,
                            currentDrawText.length - trimLength
                        );
                        currentDrawText.push(
                            ...Array.from(this.paragraph.paragraphStyle.ellipsis ?? "...")
                        );
                        didExceedMaxLines = true;
                    }

                    let drawingLeft = (() => {
                        if (
                            linesDrawingRightBounds[currentDrawLine.lineNumber] === undefined
                        ) {
                            const textAlign = this.paragraph.paragraphStyle.textAlign?.value;
                            const textDirection =
                                this.paragraph.paragraphStyle.textDirection?.value;
                            if (textAlign === TextAlign.Center) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    (this.paragraph.getMaxWidth() - currentDrawLine.width) / 2.0;
                            } else if (
                                textAlign === TextAlign.Right ||
                                (textAlign === TextAlign.End &&
                                    textDirection !== TextDirection.RTL) ||
                                (textAlign === TextAlign.Start &&
                                    textDirection === TextDirection.RTL)
                            ) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    this.paragraph.getMaxWidth() - currentDrawLine.width;
                            } else {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] = 0;
                            }
                        }
                        return linesDrawingRightBounds[currentDrawLine.lineNumber];
                    })();

                    const drawingRight =
                        drawingLeft +
                        (() => {
                            if (currentDrawText.length === 1 && currentDrawText[0] === "\n") {
                                return 0;
                            }
                            const extraLetterSpacing = span.hasLetterSpacing()
                                ? currentDrawText.length * span.style.letterSpacing!
                                : 0;
                            return (
                                context.measureText(currentDrawText.join("")).width +
                                extraLetterSpacing
                            );
                        })();

                    linesDrawingRightBounds[currentDrawLine.lineNumber] = drawingRight;

                    const textTop =
                        currentDrawLine.baseline * currentDrawLine.heightMultiplier -
                        span.letterBaseline;
                    const textBaseline =
                        currentDrawLine.baseline * currentDrawLine.heightMultiplier;
                    const textHeight = span.letterHeight;

                    this.drawBackground(span, context, {
                        currentDrawLine,
                        drawingLeft,
                        drawingRight,
                        textBaseline,
                        textTop,
                        textHeight,
                    });

                    context.save();
                    if (span.style.shadows && span.style.shadows.length > 0) {
                        context.shadowColor = span.style.shadows[0].color
                            ? colorToHex(span.style.shadows[0].color as Float32Array)
                            : "transparent";
                        context.shadowOffsetX = span.style.shadows[0].offset?.[0] ?? 0;
                        context.shadowOffsetY = span.style.shadows[0].offset?.[1] ?? 0;
                        context.shadowBlur = span.style.shadows[0].blurRadius ?? 0;
                    }
                    context.fillStyle = span.toTextFillStyle();
                    if (this.paragraph.iconFontData) {
                        for (let index = 0; index < currentDrawText.length; index++) {
                            const currentDrawLetter = currentDrawText[index];
                            const letterWidth = span.style.fontSize ?? 14;
                            this.fillIcon(
                                context,
                                currentDrawLetter,
                                letterWidth,
                                drawingLeft,
                                textBaseline + currentDrawLine.yOffset
                            );
                            drawingLeft += letterWidth;
                        }
                    } else if (
                        span.hasLetterSpacing() ||
                        span.hasWordSpacing() ||
                        span.hasJustifySpacing(this.paragraph.paragraphStyle)
                    ) {
                        const letterSpacing = span.hasLetterSpacing()
                            ? span.style.letterSpacing!
                            : 0;
                        const justifySpacing =
                            span.hasJustifySpacing(this.paragraph.paragraphStyle) &&
                                !currentDrawLine.isLastLine
                                ? this.computeJustifySpacing(
                                    currentDrawText,
                                    currentDrawLine.width,
                                    currentDrawLine.justifyWidth!
                                )
                                : 0;
                        for (let index = 0; index < currentDrawText.length; index++) {
                            const currentDrawLetter = currentDrawText[index];
                            context.fillText(
                                currentDrawLetter,
                                drawingLeft,
                                textBaseline + currentDrawLine.yOffset
                            );
                            const letterWidth = context.measureText(currentDrawLetter).width;
                            if (
                                span.hasWordSpacing() &&
                                currentDrawLetter === " " &&
                                isEnglishWord(currentDrawText[index - 1])
                            ) {
                                drawingLeft += span.style.wordSpacing!;
                            } else {
                                drawingLeft += letterWidth + letterSpacing;
                            }
                            if (!isEnglishWord(currentDrawText[index])) {
                                drawingLeft += justifySpacing;
                            }
                        }
                    } else {
                        context.fillText(
                            currentDrawText.join(""),
                            drawingLeft,
                            textBaseline + currentDrawLine.yOffset
                        );
                    }
                    context.restore();

                    // logger.debug(
                    //   "Drawer.draw.fillText",
                    //   currentDrawText,
                    //   drawingLeft,
                    //   textBaseline + currentDrawLine.yOffset
                    // );

                    this.drawDecoration(span, context, {
                        currentDrawLine,
                        drawingLeft,
                        drawingRight,
                        textBaseline,
                        textTop,
                        textHeight,
                    });

                    if (didExceedMaxLines) {
                        break;
                    }
                }

                spanLetterStartIndex = spanLetterEndIndex;
            }
        });

        context.restore();
        return context.getImageData(0, 0, width, height);
    }

    private fillIcon(
        context: CanvasRenderingContext2D,
        text: string,
        fontSize: number,
        x: number,
        y: number
    ) {
        const svgPath = this.paragraph.iconFontMap?.[text];
        if (!svgPath) {
            console.log("fill icon not found", text.charCodeAt(0).toString(16));
            return;
        }
        const pathCommands = svgPath.match(/[A-Za-z]\d+([\.\d,]+)?/g);
        if (!pathCommands) return;
        context.save();
        context.beginPath();
        let lastControlPoint = null;
        pathCommands.forEach((command) => {
            const type = command.charAt(0);
            const args = command
                .substring(1)
                .split(",")
                .map(parseFloat)
                .map((it, index) => {
                    let value = it;
                    if (index % 2 === 1) {
                        value = 150 - value + 150;
                    }
                    return value * (fontSize / 300);
                });
            if (type === "M") {
                context.moveTo(args[0], args[1]);
            } else if (type === "L") {
                context.lineTo(args[0], args[1]);
            } else if (type === "C") {
                context.bezierCurveTo(
                    args[0],
                    args[1],
                    args[2],
                    args[3],
                    args[4],
                    args[5]
                );
                lastControlPoint = [args[2], args[3]];
            } else if (type === "Q") {
                context.quadraticCurveTo(args[0], args[1], args[2], args[3]);
                lastControlPoint = [args[0], args[1]];
            } else if (type === "A") {
                // no need A
            } else if (type === "Z") {
                context.closePath();
            }
        });
        context.fill();
        context.restore();
    }

    private computeJustifySpacing(
        text: string[],
        lineWidth: number,
        justifyWidth: number
    ): number {
        let count = 0;
        for (let index = 0; index < text.length; index++) {
            if (!isEnglishWord(text[index])) {
                count++;
            }
        }
        return (justifyWidth - lineWidth) / (count - 1);
    }

    private drawBackground(
        span: TextSpan,
        context: CanvasRenderingContext2D,
        options: {
            currentDrawLine: LineMetrics;
            drawingLeft: number;
            drawingRight: number;
            textBaseline: number;
            textTop: number;
            textHeight: number;
        }
    ) {
        if (span.style.backgroundColor) {
            const {
                currentDrawLine,
                drawingLeft,
                drawingRight,
                textTop,
                textHeight,
            } = options;
            context.fillStyle = span.toBackgroundFillStyle();
            context.fillRect(
                drawingLeft,
                textTop + currentDrawLine.yOffset,
                drawingRight - drawingLeft,
                textHeight
            );
        }
    }

    private drawDecoration(
        span: TextSpan,
        context: CanvasRenderingContext2D,
        options: {
            currentDrawLine: LineMetrics;
            drawingLeft: number;
            drawingRight: number;
            textBaseline: number;
            textTop: number;
            textHeight: number;
        }
    ) {
        const {
            currentDrawLine,
            drawingLeft,
            drawingRight,
            textBaseline,
            textTop,
            textHeight,
        } = options;
        if (span.style.decoration) {
            context.save();
            context.strokeStyle = span.toDecorationStrokeStyle();
            context.lineWidth =
                (span.style.decorationThickness ?? 1) *
                Math.max(1, (span.style.fontSize ?? 12) / 14);
            const decorationStyle = span.style.decorationStyle?.value;

            switch (decorationStyle) {
                case DecorationStyle.Dashed:
                    context.lineCap = "butt";
                    context.setLineDash([4, 2]);
                    break;
                case DecorationStyle.Dotted:
                    context.lineCap = "butt";
                    context.setLineDash([2, 2]);
                    break;
            }

            if (span.style.decoration === UnderlineDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textBaseline + 1);
                context.lineTo(
                    drawingRight,
                    currentDrawLine.yOffset + textBaseline + 1
                );
                context.stroke();
                if (decorationStyle === DecorationStyle.Double) {
                    context.beginPath();
                    context.moveTo(
                        drawingLeft,
                        currentDrawLine.yOffset + textBaseline + 3
                    );
                    context.lineTo(
                        drawingRight,
                        currentDrawLine.yOffset + textBaseline + 3
                    );
                    context.stroke();
                }
            }
            if (span.style.decoration === LineThroughDecoration || span.style.decoration === 3) {
                context.beginPath();
                context.moveTo(
                    drawingLeft,
                    currentDrawLine.yOffset + textTop + textHeight / 2.0
                );
                context.lineTo(
                    drawingRight,
                    currentDrawLine.yOffset + textTop + textHeight / 2.0
                );
                if (decorationStyle === DecorationStyle.Double) {
                    context.moveTo(
                        drawingLeft,
                        currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2
                    );
                    context.lineTo(
                        drawingRight,
                        currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2
                    );
                }
                context.stroke();
            }
            if (span.style.decoration === OverlineDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop);
                context.lineTo(drawingRight, currentDrawLine.yOffset + textTop);

                if (decorationStyle === DecorationStyle.Double) {
                    context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + 2);
                    context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + 2);
                }
                context.stroke();
            }
            context.restore();
        }
    }
}


let drawParagraphSharedPaint = null


const TextAlignEnums = {
    Left: { value: 0 },
    Right: { value: 1 },
    Center: { value: 2 },
    Justify: { value: 3 },
    Start: { value: 4 },
    End: { value: 5 },
}

const AlphaTypeEnums = {
    Opaque: { value: 0 },
    Premul: { value: 1 },
    Unpremul: { value: 2 },
}

const ColorTypeEnums = {
    Alpha_8: { value: 0 },
    RGB_565: { value: 1 },
    RGBA_8888: { value: 2 },
    BGRA_8888: { value: 3 },
    RGBA_1010102: { value: 4 },
    RGB_101010x: { value: 5 },
    Gray_8: { value: 6 },
    RGBA_F16: { value: 7 },
    RGBA_F32: { value: 8 },
}

class _ColorSpace extends SkEmbindObject<"ColorSpace"> {
    constructor() {
        super("ColorSpace");
    }
}

const defaultPaint = new _Paint();

export function install(
    canvasKit: CanvasKit,
    pixelRatio: number,
    embeddingFonts: string[],
    iconFonts?: Record<string, string>
) {
    // if (typeof canvasKit.ParagraphBuilder === "undefined") {
    // installPolyfill(canvasKit);
    canvasKit.ParagraphBuilder = new _ParagraphBuilderFactory();
    canvasKit.FontCollection = new _FontCollectionFactory();
    canvasKit.FontMgr = new _FontMgrFactory();
    canvasKit.Typeface = new _TypefaceFactory();
    canvasKit.TypefaceFontProvider = new _TypefaceFontProviderFactory();
    canvasKit.Font = _Font;
    canvasKit.ParagraphStyle = (ps: ParagraphStyle) => {
        return new _ParagraphStyle(ps);
    };
    canvasKit.TextStyle = (ts: TextStyle) => {
        return new _TextStyle(ts);
    };

    // Paragraph Enums
    canvasKit.TextAlign = TextAlignEnums;

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


    Drawer.pixelRatio = pixelRatio;
    // const originMakeFromFontCollectionMethod =
    //     canvasKit.ParagraphBuilder.MakeFromFontCollection;
    // canvasKit.ParagraphBuilder.MakeFromFontCollection = function (
    //     style: any,
    //     fontCollection: any
    // ) {
    //     return ParagraphBuilder.MakeFromFontCollection(
    //         originMakeFromFontCollectionMethod,
    //         style,
    //         fontCollection,
    //         embeddingFonts,
    //         iconFonts
    //     );
    // };

    canvasKit.Canvas.prototype.drawParagraph = function (
        paragraph: Paragraph,
        dx: number,
        dy: number
    ) {
        console.log(`drawParagraph ${paragraph} at (${dx}, ${dy})`)

        let canvasImg = paragraph.skImageCache;
        if (!canvasImg) {
            const drawer = new Drawer(paragraph);
            const imageData = drawer.draw(context);
            canvasImg = canvasKit.MakeImage(
                {
                    width: imageData.width,
                    height: imageData.height,
                    alphaType: AlphaTypeEnums.Unpremul,
                    colorType: ColorTypeEnums.RGBA_8888,
                    colorSpace: new _ColorSpace()
                    // colorSpace: {
                    //     SRGB:
                    // }   canvasKit.ColorSpace.SRGB,
                },
                imageData.data,
                4 * imageData.width
            );
            paragraph.skImageCache = canvasImg;
            paragraph.skImageWidth = imageData.width;
            paragraph.skImageHeight = imageData.height;
        }
        const srcRect = canvasKit.XYWHRect(
            0,
            0,
            paragraph.skImageWidth!,
            paragraph.skImageHeight!
        );
        const dstRect = canvasKit.XYWHRect(
            Math.ceil(dx),
            Math.ceil(dy),
            paragraph.skImageWidth! / Drawer.pixelRatio,
            paragraph.skImageHeight! / Drawer.pixelRatio
        );
        // const skPaint = drawParagraphSharedPaint ?? new _Paint();
        // drawParagraphSharedPaint = skPaint;
        // this.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
        this.drawImageRect(canvasImg, srcRect, dstRect, defaultPaint);
    };
}

// function initLayout() {
//     const fontStore = new FontStore();
//     const instance = fontSubstitution();

//     const helvetica = fontStore.getFont({ fontFamily: 'Helvetica' }).data;
//     let frag: Fragment = { string: 'Hello' }
//     let aas = fromFragments([frag]);
//     // console.log(aas);
//     // let engine = bidi();
//     // let bbb = engine(aas);
//     // console.log(bbb);
//     // let layout = layoutEngine({
//     //     bidi: bidi,
//     //     linebreaker: linebreaker,
//     //     justification: justification,
//     //     fontSubstitution: fontSubstitution,
//     //     scriptItemizer: scriptItemizer,
//     //     textDecoration: textDecoration,
//     // })
//     // console.log(layout);

//     const run2 = { start: 3, end: 5, attributes: { font: [helvetica] } } as any;

//     const cccc: AttributedString = fontSubstitution()({ string: 'Lorem\nLorem Lorem', runs: [run2] });
//     const reee = layout(cccc, { x: 10, y: 10, width: 100, height: 100 });
//     // const aaa = bidi(fromFragments([
//     //   { string: 'Hello' },
//     // ]));
//     console.log("aaa");
//     console.log(reee);
// }

function tees(ctx: CanvasRenderingContext2D) {
    const sampleText = defineText({
        // text
        text: `Hello, world!
      multiline text is supported.`,
        initialStyle: {
            fontFamily: 'Arial',
            fontSize: 16,
            fontColor: 'black',
            fontWeight: 100,
            fontStyle: 'normal'
        },
        setting: {},
        styles: [
          // change color to red at 5th character.
          // other style properties are inherited from initialStyle.
          {
            at: 5,
            style: { fontColor: 'red' },
          },
          // change font size to 30px at 10th character.
          // note that fontColor is inherited from previous style.
          {
            at: 10,
            style: { fontSize: 30 },
          },
        ],
      })

      // Draw the text on the canvas at (0, 0) with a wrap width of 300px
drawStyledText(ctx, sampleText, 0, 0, 300)
}