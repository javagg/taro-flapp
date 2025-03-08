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
    Rect,
    FontWeight,
} from "../mtex/canvaskit";
import { Affinity, createDomCanvasElement } from "./dom";
import { TextLayoutService, } from "./layout_service";
import { TextPaintService } from "./paint_service";
import { ParagraphLine, RootStyleNode, StyleNode } from "./paragraph";
import { WordBreaker } from "./word_breaker";

import { AlphaType, ColorType } from "./dom"

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


const placeholderChar = String.fromCharCode(0xFFFC);

export class _ParagraphBuilder extends SkEmbindObject<"ParagraphBuilder"> implements ParagraphBuilder {

    private _plainTextBuffer: string = ''
    private readonly _paragraphStyle: ParagraphStyle;

    private readonly _spans: ParagraphSpan[] = [];
    private readonly _styleStack: StyleNode[] = [];

    private readonly _rootStyleNode: RootStyleNode;
    private get _currentStyleNode(): StyleNode {
        return this._styleStack.length === 0
            ? this._rootStyleNode
            : this._styleStack[this._styleStack.length - 1];
    }

    get placeholderCount(): number {
        return this._placeholderCount;
    }
    private _placeholderCount = 0;

    get placeholderScales(): number[] {
        return this._placeholderScales;
    }
    private readonly _placeholderScales: number[] = [];

    private _canDrawOnCanvas = true;

    constructor(style: ParagraphStyle) {
        super("ParagraphBuilder")
        this._paragraphStyle = style;
        this._rootStyleNode = new RootStyleNode(style);
    }

    /**
     * Pushes the information required to leave an open space.
     * @param width
     * @param height
     * @param alignment
     * @param baseline
     * @param offset
     */
    addPlaceholder(width?: number, height?: number,
        alignment?: PlaceholderAlignment,
        baseline?: TextBaseline, offset?: number): void {
        const scale = 1.0;
        // Require a baseline to be specified if using a baseline-based alignment.
        // if ((alignment === ui.PlaceholderAlignment.aboveBaseline ||
        //     alignment === ui.PlaceholderAlignment.belowBaseline ||
        //     alignment === ui.PlaceholderAlignment.baseline) && baseline == null) {
        //     throw new Error('Baseline must be specified for baseline-based alignment');
        // }

        const start = this._plainTextBuffer.length;
        this._plainTextBuffer += placeholderChar;
        const end = this._plainTextBuffer.length;

        const style = this._currentStyleNode.resolveStyle();
        // this._updateCanDrawOnCanvas(style);

        this._placeholderCount++;
        this._placeholderScales.push(scale);
        this._spans.push(new PlaceholderSpan(
            style,
            start,
            end,
            (width ?? 0) * scale,
            (height ?? 0) * scale,
            { value: 0 },  //alignment,
            baseline ?? { value: 0 },//TextBaseline.alphabetic,
            (offset ?? height ?? 0) * scale,
        ));
    }

    /**
     * Adds text to the builder. Forms the proper runs to use the upper-most style
     * on the style_stack.
     * @param str
     */
    addText(text: string): void {
        const start = this._plainTextBuffer.length;
        this._plainTextBuffer += text;
        const end = this._plainTextBuffer.length;

        const style = this._currentStyleNode.resolveStyle();
        // this._updateCanDrawOnCanvas(style);

        this._spans.push(new ParagraphSpan(
            style,
            start,
            end
        ));
    }

    // private _updateCanDrawOnCanvas(style: TextStyle): void {
    //     if (!this._canDrawOnCanvas) {
    //         return;
    //     }

    //     const letterSpacing = style.letterSpacing;
    //     if (letterSpacing != null && letterSpacing !== 0.0) {
    //         this._canDrawOnCanvas = false;
    //         return;
    //     }

    //     const decoration = style.decoration;
    //     if (decoration != null && decoration !== TextDecoration.none) {
    //         this._canDrawOnCanvas = false;
    //         return;
    //     }

    //     const fontFeatures = style.fontFeatures;
    //     if (fontFeatures != null && fontFeatures.length > 0) {
    //         this._canDrawOnCanvas = false;
    //         return;
    //     }

    //     const fontVariations = style.fontVariations;
    //     if (fontVariations != null && fontVariations.length > 0) {
    //         this._canDrawOnCanvas = false;
    //         return;
    //     }
    // }


    /**
     * Returns a Paragraph object that can be used to be layout and paint the text to an
     * Canvas.
     */
    build(): Paragraph {
        if (this._spans.length === 0) {
            // In case `addText` and `addPlaceholder` were never called.
            //
            // We want the paragraph to always have a non-empty list of spans to match
            // the expectations of the LayoutFragmenter.
            this._spans.push(
                new ParagraphSpan(this._rootStyleNode.resolveStyle(), 0, 0)
            );
        }

        return new _Paragraph(
            this._spans,
            {
                paragraphStyle: this._paragraphStyle,
                plainText: this._plainTextBuffer.toString(),
                canDrawOnCanvas: this._canDrawOnCanvas,
            }
        );
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
        throw new Error("getText not implemented.");
        return this._plainTextBuffer
    }

    /**
    * Remove a style from the stack. Useful to apply different styles to chunks
    * of text such as bolding.
    */
    pop(): void {
        if (this._styleStack.length > 0) {
            this._styleStack.pop();
        }
    }

    /**
     * Push a style to the stack. The corresponding text added with addText will
     * use the top-most style.
     * @param textStyle
     */
    pushStyle(text: TextStyle): void {
        this._styleStack.push(this._currentStyleNode.createChild(text));
    }

    /**
     * Pushes a TextStyle using paints instead of colors for foreground and background.
     * @param textStyle
     * @param fg
     * @param bg
     */
    pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void {
        throw new Error("pushPaintStyle not implemented.");
    }

    /**
     * Resets this builder to its initial state, discarding any text, styles, placeholders that have
     * been added, but keeping the initial ParagraphStyle.
     */
    reset(): void {
        throw new Error("reset not implemented.");
    }
}


export class _Paragraph extends SkEmbindObject<"Paragraph"> implements Paragraph {

    /** General styling information for this paragraph */
    readonly paragraphStyle: ParagraphStyle;

    /** The full textual content of the paragraph */
    readonly plainText: string;

    /** Whether this paragraph can be drawn on a bitmap canvas */
    readonly canDrawOnCanvas: boolean;

    get width(): number {
        return this._layoutService.width;
    }

    get height(): number {
        return this._layoutService.height;
    }

    get longestLine(): number {
        return this._layoutService.longestLine?.width ?? 0.0;
    }

    get minIntrinsicWidth(): number {
        return this._layoutService.minIntrinsicWidth;
    }

    get maxIntrinsicWidth(): number {
        return this._layoutService.maxIntrinsicWidth;
    }

    get alphabeticBaseline(): number {
        return this._layoutService.alphabeticBaseline;
    }

    get ideographicBaseline(): number {
        return this._layoutService.ideographicBaseline;
    }

    didExceedMaxLines() {
        return this._layoutService.didExceedMaxLines;
    }

    get lines(): ParagraphLine[] {
        return this._layoutService.lines;
    }

    /** The bounds that contain the text painted inside this paragraph */
    get paintBounds(): Rect {
        return this._layoutService.paintBounds;
    }

    /** Whether this paragraph has been laid out or not */
    isLaidOut = false;

    //   private _lastUsedConstraints?: ui.ParagraphConstraints;
    private _lastUsedWidth?: number;

    private readonly _layoutService = new TextLayoutService(this);
    private readonly _paintService = new TextPaintService(this);

    constructor(
        readonly spans: ParagraphSpan[],
        options: {
            paragraphStyle: ParagraphStyle;
            plainText: string;
            canDrawOnCanvas: boolean;
        }
    ) {
        super("Paragraph")
        this.paragraphStyle = options.paragraphStyle;
        this.plainText = options.plainText;
        this.canDrawOnCanvas = options.canDrawOnCanvas;

        if (spans.length === 0) {
            throw new Error('spans must not be empty');
        }
    }

    getLineMetrics(): LineMetrics[] {
        throw new Error("Method not implemented.");
    }

    getRectsForRange(start: number, end: number, hStyle: RectHeightStyle, wStyle: RectWidthStyle): RectWithDirection[] {
        throw new Error("Method not implemented.");
    }

    getShapedLines(): ShapedLine[] {
        throw new Error("Method not implemented.");
    }

    getAlphabeticBaseline(): number {
        throw new Error("Method not implemented.");
        return 0;
    }

    /**
     * Returns the index of the glyph that corresponds to the provided coordinate,
     * with the top left corner as the origin, and +y direction as down.
     */
    getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
        throw new Error("Method not implemented.");
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
    getGlyphInfoAt(codeUnitOffset: number): GlyphInfo | null {
        const lineNumber = this._findLine(codeUnitOffset, 0, this.numberOfLines);
        if (lineNumber == null) {
            return null;
        }

        const line = this.lines[lineNumber];
        const range = line.getCharacterRangeAt(codeUnitOffset);
        if (!range) {
            return null;
        }

        if (!line.overlapsWith(range.start, range.end)) {
            throw new Error('Line does not overlap with range');
        }

        for (const fragment of line.fragments) {
            if (fragment.overlapsWith(range.start, range.end)) {
                // If the grapheme cluster is split into multiple fragments (which really
                // shouldn't happen but currently if they are in different TextSpans they
                // don't combine), use the layout box of the first base character as its
                // layout box has a better chance to be not that far-off.
                const textBox = fragment.toTextBox({ start: range.start, end: range.end });
                return new GlyphInfo(textBox.toRect(), range, textBox.direction);
            }
        }

        throw new Error('This should not be reachable');
    }

    getHeight(): number {
        throw new Error("Method not implemented.");
        return this.height;
    }

    getIdeographicBaseline(): number {
        throw new Error("Method not implemented.");
        return 0;
    }

    /**
     * Returns the line number of the line that contains the specified UTF-16
     * offset within the paragraph, or -1 if the index is out of bounds, or
     * points to a codepoint that is logically after the last visible codepoint.
     */
    getLineNumberAt(index: number): number {
        throw new Error("Method not implemented.");
        return this._findLine(codeUnitOffset, 0, this.lines.length);
    }

    /**
     * Returns the LineMetrics of the line at the specified line number, or null
     * if the line number is out of bounds, or is larger than or equal to the
     * specified max line number.
     */
    getLineMetricsAt(lineNumber: number): LineMetrics | null {
        throw new Error("Method not implemented.");
        return lineNumber >= 0 && lineNumber < this.lines.length
            ? this.lines[lineNumber].lineMetrics
            : null;
    }

    getLineMetricsOfRange(start: number, end: number): LineMetrics[] {
        throw new Error("getLineMetricsOfRange not implemented.");
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
        return this.lines.length;
    }

    getRectsForPlaceholders(): RectWithDirection[] {
        return [];
    }


    /**
     * Lays out the text in the paragraph so it is wrapped to the given width.
     * @param width
     */
    layout(width: number): void {
        console.log("Paragraph.layout")
        if (width === this._lastUsedWidth) {
            return;
        }

        //   let stopwatch: any;
        //   if (Profiler.isBenchmarkMode) {
        //     stopwatch = new Date();
        //   }

        this._layoutService.performLayout(width);

        //   if (Profiler.isBenchmarkMode) {
        //     const elapsed = new Date().getTime() - stopwatch.getTime();
        //     Profiler.instance.benchmark('text_layout', elapsed);
        //   }

        this.isLaidOut = true;
        this._lastUsedWidth = width;
        // this._cachedDomElement = null;
    }

    /**
     * When called after shaping, returns the glyph IDs which were not matched
     * by any of the provided fonts.
     */
    unresolvedCodepoints(): number[] {
        throw new Error("Method not implemented.");
        return [];
    }

    // private _cachedDomElement: HTMLElement | null;

    get hasArbitraryPaint(): boolean {
        return true;
    }

    draw(canvas: CanvasRenderingContext2D, dx: number, dy: number): void {
        this._paintService.paint(canvas, dx, dy);
    }

    // paint(canvas: BitmapCanvas, offset: Offset): void {
    //     this._paintService.paint(canvas, offset);
    // }

    // toDomElement(): HTMLElement {
    //     if (!this.isLaidOut) {
    //         throw new Error('Paragraph must be laid out before converting to DOM element');
    //     }

    //     const domElement = this._cachedDomElement;
    //     if (domElement) {
    //         return domElement.cloneNode(true) as DomElement;
    //     }
    //     return this._cachedDomElement = this._createDomElement();
    // }

    // private _createDomElement(): HTMLElement {
    //     const rootElement = document.createElement('flt-paragraph') as HTMLElement;

    //     // 1. Set paragraph-level styles
    //     const cssStyle = rootElement.style;
    //     cssStyle.position = 'absolute';
    //     // Prevent the browser from doing any line breaks in the paragraph. We want
    //     // to have full control of the paragraph layout.
    //     cssStyle.whiteSpace = 'pre';

    //     // 2. Append all spans to the paragraph
    //     for (let i = 0; i < this.lines.length; i++) {
    //         const line = this.lines[i];
    //         for (const fragment of line.fragments) {
    //             if (fragment.isPlaceholder) {
    //                 continue;
    //             }

    //             const text = fragment.getText(this);
    //             if (!text) {
    //                 continue;
    //             }

    //             const spanElement = document.createElement('flt-span') as DomElement;
    //             if (fragment.textDirection === ui.TextDirection.rtl) {
    //                 spanElement.setAttribute('dir', 'rtl');
    //             }

    //             applyTextStyleToElement({
    //                 element: spanElement,
    //                 style: fragment.style
    //             });

    //             this._positionSpanElement(spanElement, line, fragment);

    //             spanElement.textContent = text;
    //             rootElement.appendChild(spanElement);
    //         }
    //     }

    //     return rootElement;
    // }

    getBoxesForPlaceholders(): RectWithDirection[] /*TextBox[]*/ {
        return this._layoutService.getBoxesForPlaceholders();
    }

    getPositionForOffset(offset: Offset): RectWithDirection/*TextPosition*/ {
        return this._layoutService.getPositionForOffset(offset);
    }

    getBoxesForRange(
        start: number,
        end: number,
        options: {
            boxHeightStyle?: BoxHeightStyle;
            boxWidthStyle?: BoxWidthStyle;
        } = {}
    ): TextBox[] {
        const {
            boxHeightStyle = BoxHeightStyle.tight,
            boxWidthStyle = BoxWidthStyle.tight
        } = options;

        return this._layoutService.getBoxesForRange(
            start,
            end,
            boxHeightStyle,
            boxWidthStyle
        );
    }

    getClosestGlyphInfoForOffset(offset: Offset): GlyphInfo | null {
        return this._layoutService.getClosestGlyphInfo(offset);
    }

    getWordBoundary(position: PositionWithAffinity): URange /* ui.TextRange*/ {
        const characterPosition = position.affinity === Affinity.Upstream
            ? position.pos - 1
            : position.pos;

        const start = WordBreaker.prevBreakIndex(this.plainText, characterPosition + 1);
        const end = WordBreaker.nextBreakIndex(this.plainText, characterPosition);
        return { start, end } //new ui.TextRange(start, end);
    }

    getLineBoundary(position: PositionWithAffinity /*ui.TextPosition */): URange /* ui.TextRange*/ {
        if (!this.lines.length) {
            return { start: 0, end: 0 }
            // return TextRange.empty;
        }
        const lineNumber = this.getLineNumberAt(position.pos);
        // Fallback to the last line for backward compatibility
        const line = lineNumber != null ? this.lines[lineNumber] : this.lines[this.lines.length - 1];
        // return new ui.TextRange(line.startIndex, line.endIndex - line.trailingNewlines);
        return { start: line.startIndex, end: line.endIndex - line.trailingNewlines }
    }

    computeLineMetrics(): LineMetrics[] {
        return this.lines.map(line => line.lineMetrics);
    }

    get numberOfLines(): number {
        return this.lines.length;
    }

    private _findLine(codeUnitOffset: number, startLine: number, endLine: number): number | null {
        if (endLine <= startLine ||
            codeUnitOffset < this.lines[startLine].startIndex ||
            (endLine < this.numberOfLines && this.lines[endLine].startIndex <= codeUnitOffset)) {
            return null;
        }

        if (endLine === startLine + 1) {
            if (codeUnitOffset >= this.lines[startLine].visibleEndIndex) {
                return null;
            }
            return startLine;
        }

        // endLine >= startLine + 2 thus we have
        // startLine + 1 <= midIndex <= endLine - 1
        const midIndex = Math.floor((startLine + endLine) / 2);
        return this._findLine(codeUnitOffset, midIndex, endLine) ??
            this._findLine(codeUnitOffset, startLine, midIndex);
    }
}

export class ParagraphSpan {
    constructor(
        readonly style: TextStyle,
        readonly start: number,
        readonly end: number,
    ) { }
}


/**
 * A span that represents a placeholder in text.
 */
export class PlaceholderSpan extends ParagraphSpan {
    constructor(
        style: TextStyle,
        start: number,
        end: number,
        readonly width: number,
        readonly height: number,
        readonly alignment: PlaceholderAlignment,
        readonly baseline: TextBaseline,
        readonly baselineOffset: number,

    ) {
        super(style, start, end);
    }

}

/**
 * Metrics for a line of text in the engine.
 */
export class EngineLineMetrics implements LineMetrics {
    constructor(
        readonly startIndex: number,
        readonly endIndex: number,
        readonly hardBreak: boolean,
        readonly ascent: number,
        readonly descent: number,
        readonly unscaledAscent: number,
        readonly height: number,
        readonly width: number,
        readonly left: number,
        readonly baseline: number,
        readonly lineNumber: number,
    ) { }
    endExcludingWhitespaces: number;
    endIncludingNewline: number;
    isHardBreak: boolean;

    /**
     * Creates a copy of this metrics with the given fields replaced.
     */
    copyWith(fields: Partial<LineMetrics>): EngineLineMetrics {
        return new EngineLineMetrics(
            fields.startIndex ?? this.startIndex,
            fields.endIndex ?? this.endIndex,
            fields.hardBreak ?? this.hardBreak,
            fields.ascent ?? this.ascent,
            fields.descent ?? this.descent,
            fields.unscaledAscent ?? this.unscaledAscent,
            fields.height ?? this.height,
            fields.width ?? this.width,
            fields.left ?? this.left,
            fields.baseline ?? this.baseline,
            fields.lineNumber ?? this.lineNumber,
        );
    }
}


/**
 * A text style with engine-specific features.
 */
export class EngineTextStyle implements TextStyle {
    /**
     * Creates a text style with the given properties.
     */
    static create(props: {
        color?: number;
        decoration?: TextDecoration;
        decorationColor?: Color;
        decorationStyle?: TextDecorationStyle;
        decorationThickness?: number;
        fontWeight?: FontWeight;
        fontStyle?: FontStyle;
        textBaseline?: TextBaseline;
        fontFamily?: string;
        fontSize?: number;
        letterSpacing?: number;
        wordSpacing?: number;
        height?: number;
        leadingDistribution?: TextLeadingDistribution;
        locale?: string;
        background?: Paint;
        foreground?: Paint;
        shadows?: Shadow[];
        fontFeatures?: FontFeature[];
        fontVariations?: FontVariation[];
    }): EngineTextStyle {
        return new EngineTextStyle(props);
    }

    /**
     * Applies this style to a DOM element.
     */
    applyToDomElement(element: HTMLElement): void {
        applyTextStyleToElement(this, element);
    }
}

/**
 * A strut style with engine-specific features.
 */
export class EngineStrutStyle {
    constructor(
        readonly fontFamily?: string,
        readonly fontSize?: number,
        readonly height?: number,
        readonly leading?: number,
        readonly fontWeight?: FontWeight,
        readonly fontStyle?: FontStyle,
        readonly forceStrutHeight?: boolean,
    ) { }

    /**
     * Creates a copy of this style with the given fields replaced.
     */
    copyWith(fields: Partial<EngineStrutStyle>): EngineStrutStyle {
        return new EngineStrutStyle(
            fields.fontFamily ?? this.fontFamily,
            fields.fontSize ?? this.fontSize,
            fields.height ?? this.height,
            fields.leading ?? this.leading,
            fields.fontWeight ?? this.fontWeight,
            fields.fontStyle ?? this.fontStyle,
            fields.forceStrutHeight ?? this.forceStrutHeight,
        );
    }
}

/**
 * A placeholder in a paragraph.
 */
export class ParagraphPlaceholder {
    constructor(
        readonly width: number,
        readonly height: number,
        readonly alignment: PlaceholderAlignment,
        readonly baseline?: number,
        readonly offset?: number,
    ) { }
}


const StrokeCapEnums = {
    Butt: { value: 0 },
    Round: { value: 1 },
    Square: { value: 2 },
}

const StrokeJoinEnums = {
    Bevel: { value: 0 },
    Miter: { value: 1 },
    Round: { value: 2 },
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


class _ColorSpace extends SkEmbindObject<"ColorSpace"> {
    constructor() {
        super("ColorSpace");
    }
}

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

    canvasKit.Canvas.prototype.drawParagraph = function (
        paragraph: Paragraph,
        dx: number,
        dy: number
    ) {
        console.log(`drawParagraph ${paragraph} at (${dx}, ${dy})`)

        const context = createDomCanvasElement(4096, 4096).getContext('2d')!;

        (paragraph as _Paragraph).draw(context, dx, dy);

        const imageData = context.getImageData(0, 0, 4096, 4096);
        const canvasImg = canvasKit.MakeImage(
            {
                width: imageData.width,
                height: imageData.height,
                alphaType: AlphaType.Unpremul,
                colorType: ColorType.RGBA_8888,
                colorSpace: new _ColorSpace()
                // colorSpace: {
                //     SRGB:
                // }   canvasKit.ColorSpace.SRGB,
            },
            imageData.data,
            4 * imageData.width
        );
        const w = imageData.width
        const h = imageData.height
        const pixelRatio = 1.0;
        const srcRect = canvasKit.XYWHRect(0, 0, w, h);
        const dstRect = canvasKit.XYWHRect(Math.ceil(dx), Math.ceil(dy), w / pixelRatio, h / pixelRatio)
        // let canvasImg = paragraph.skImageCache;
        // if (!canvasImg) {
        //     const drawer = new Drawer(paragraph);
        //     const imageData = drawer.draw(context);
        //     canvasImg = canvasKit.MakeImage(
        //         {
        //             width: imageData.width,
        //             height: imageData.height,
        //             alphaType: AlphaTypeEnums.Unpremul,
        //             colorType: ColorTypeEnums.RGBA_8888,
        //             colorSpace: new _ColorSpace()
        //             // colorSpace: {
        //             //     SRGB:
        //             // }   canvasKit.ColorSpace.SRGB,
        //         },
        //         imageData.data,
        //         4 * imageData.width
        //     );
        //     paragraph.skImageCache = canvasImg;
        //     paragraph.skImageWidth = imageData.width;
        //     paragraph.skImageHeight = imageData.height;
        // }

        // const dstRect = canvasKit.XYWHRect(
        //     Math.ceil(dx),
        //     Math.ceil(dy),
        //     paragraph.skImageWidth! / Drawer.pixelRatio,
        //     paragraph.skImageHeight! / Drawer.pixelRatio
        // );
        const skPaint = /*drawParagraphSharedPaint ??*/ new _Paint();
        // drawParagraphSharedPaint = skPaint;
        this.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
    };
}
