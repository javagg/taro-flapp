import { CanvasKit, EmbindObject, FontBlock, FontCollection, FontMgrFactory, FontCollectionFactory, FontMgr, ParagraphBuilder, ParagraphBuilderFactory, ParagraphStyle, ShapedLine, TypefaceFontProvider, TypefaceFactory, Typeface, TypefaceFontProviderFactory, Font, FontEdging, FontHinting, InputGlyphIDArray, GlyphIDArray, Paint, FontMetrics, StrutStyle, TextAlign, TextDirection, FontStyle, TextHeightBehavior, TextStyle, DecorationStyle, InputColor, TextBaseline, TextFontFeatures, TextFontVariations, TextShadow, GlyphInfo, Image, InputGraphemes, InputLineBreaks, InputWords, LineMetrics, Paragraph, PlaceholderAlignment, PositionWithAffinity, RectHeightStyle, RectWidthStyle, RectWithDirection, URange } from "./canvaskit";
export declare abstract class SkEmbindObject<T extends string> implements EmbindObject<T> {
    readonly _type: T;
    _deleted: boolean;
    constructor(_type: T);
    delete(): void;
    deleteLater(): void;
    isAliasOf(other: any): boolean;
    isDeleted(): boolean;
}
export declare class _ParagraphBuilderFactory implements ParagraphBuilderFactory {
    /**
     * Creates a ParagraphBuilder using the fonts available from the given font provider.
     * @param style
     * @param fontSrc
     */
    MakeFromFontProvider(style: ParagraphStyle, fontSrc: TypefaceFontProvider): ParagraphBuilder;
    /**
     * Return a shaped array of lines
     */
    ShapeText(text: string, runs: FontBlock[], width?: number): ShapedLine[];
    /**
     * Creates a ParagraphBuilder using the fonts available from the given font manager.
     * @param style
     * @param fontManager
     */
    Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder;
    /**
     * Creates a ParagraphBuilder using the given font collection.
     * @param style
     * @param fontCollection
     */
    MakeFromFontCollection(style: ParagraphStyle, fontCollection: FontCollection): ParagraphBuilder;
    /**
     * Whether the paragraph builder requires ICU data to be provided by the
     * client.
     */
    RequiresClientICU(): boolean;
}
export declare class _FontCollection extends SkEmbindObject<"FontCollection"> implements FontCollection {
    constructor();
    setDefaultFontManager(fontManager: TypefaceFontProvider | null): void;
    enableFontFallback(): void;
}
export declare class _FontCollectionFactory implements FontCollectionFactory {
    Make(): FontCollection;
}
export declare class _FontMgr extends SkEmbindObject<"FontMgr"> implements FontMgr {
    /**
    * Return the number of font families loaded in this manager. Useful for debugging.
    */
    constructor();
    countFamilies(): number;
    /**
     * Return the nth family name. Useful for debugging.
     * @param index
     */
    getFamilyName(index: number): string;
    /**
     * Find the closest matching typeface to the specified familyName and style.
     */
    matchFamilyStyle(name: string, style: FontStyle): Typeface;
}
export declare class _FontMgrFactory implements FontMgrFactory {
    FromData(...buffers: ArrayBuffer[]): FontMgr | null;
}
export declare class _TypefaceFactory implements TypefaceFactory {
    GetDefault(): Typeface | null;
    MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null;
    MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null;
}
export declare class _TypefaceFontProviderFactory implements TypefaceFontProviderFactory {
    Make(): TypefaceFontProvider;
}
export declare class _TypefaceFontProvider extends _FontMgr implements TypefaceFontProvider {
    registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void;
}
export declare class _Font extends SkEmbindObject<"Font"> implements Font {
    constructor(face: Typeface | null, size: number, scaleX: number, skewX: number);
    getMetrics(): FontMetrics;
    getGlyphBounds(glyphs: InputGlyphIDArray, paint?: Paint | null, output?: Float32Array): Float32Array;
    getGlyphIDs(str: string, numCodePoints?: number, output?: GlyphIDArray): GlyphIDArray;
    getGlyphWidths(glyphs: InputGlyphIDArray, paint?: Paint | null, output?: Float32Array): Float32Array;
    getGlyphIntercepts(glyphs: InputGlyphIDArray, positions: Float32Array | number[], top: number, bottom: number): Float32Array;
    getScaleX(): number;
    getSize(): number;
    getSkewX(): number;
    isEmbolden(): boolean;
    getTypeface(): Typeface | null;
    setEdging(edging: FontEdging): void;
    setEmbeddedBitmaps(embeddedBitmaps: boolean): void;
    setHinting(hinting: FontHinting): void;
    setLinearMetrics(linearMetrics: boolean): void;
    setScaleX(sx: number): void;
    setSize(points: number): void;
    setSkewX(sx: number): void;
    setEmbolden(embolden: boolean): void;
    setSubpixel(subpixel: boolean): void;
    setTypeface(face: Typeface | null): void;
}
export declare class _ParagraphStyle implements ParagraphStyle {
    constructor(ps: ParagraphStyle);
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
export declare class _TextStyle implements TextStyle {
    constructor(ts: TextStyle);
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
export declare class _ParagraphBuilder extends SkEmbindObject<"ParagraphBuilder"> implements ParagraphBuilder {
    private style;
    private spans;
    private styles;
    constructor(style: ParagraphStyle);
    /**
     * Pushes the information required to leave an open space.
     * @param width
     * @param height
     * @param alignment
     * @param baseline
     * @param offset
     */
    addPlaceholder(width?: number, height?: number, alignment?: PlaceholderAlignment, baseline?: TextBaseline, offset?: number): void;
    /**
     * Adds text to the builder. Forms the proper runs to use the upper-most style
     * on the style_stack.
     * @param str
     */
    addText(str: string): void;
    /**
     * Returns a Paragraph object that can be used to be layout and paint the text to an
     * Canvas.
     */
    build(): Paragraph;
    /**
     * @param words is an array of word edges (starting or ending). You can
     * pass 2 elements (0 as a start of the entire text and text.size as the
     * end). This information is only needed for a specific API method getWords.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setWordsUtf8(words: InputWords): void;
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
    setWordsUtf16(words: InputWords): void;
    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setGraphemeBreaksUtf8(graphemes: InputGraphemes): void;
    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setGraphemeBreaksUtf16(graphemes: InputGraphemes): void;
    /**
     * @param lineBreaks is an array of unsigned integers that should be
     * treated as pairs (index, break type) that point to the places of possible
     * line breaking if needed. It should include 0 as the first element.
     * Break type == 0 means soft break, break type == 1 is a hard break.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setLineBreaksUtf8(lineBreaks: InputLineBreaks): void;
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
    setLineBreaksUtf16(lineBreaks: InputLineBreaks): void;
    /**
     * Returns the entire Paragraph text (which is useful in case that text
     * was produced as a set of addText calls).
     */
    getText(): string;
    /**
    * Remove a style from the stack. Useful to apply different styles to chunks
    * of text such as bolding.
    */
    pop(): void;
    /**
     * Push a style to the stack. The corresponding text added with addText will
     * use the top-most style.
     * @param textStyle
     */
    pushStyle(text: TextStyle): void;
    /**
     * Pushes a TextStyle using paints instead of colors for foreground and background.
     * @param textStyle
     * @param fg
     * @param bg
     */
    pushPaintStyle(textStyle: TextStyle, fg: Paint, bg: Paint): void;
    /**
     * Resets this builder to its initial state, discarding any text, styles, placeholders that have
     * been added, but keeping the initial ParagraphStyle.
     */
    reset(): void;
}
export declare class _Paragraph extends SkEmbindObject<"Paragraph"> implements Paragraph {
    private style;
    private context;
    iconFontMap?: Record<string, string>;
    skImageCache?: Image;
    skImageWidth?: number;
    skImageHeight?: number;
    glyphInfos: GlyphInfo[];
    lineMetrics: LineMetrics[];
    _didExceedMaxLines: boolean;
    private previousLayoutWidth;
    constructor(style: ParagraphStyle, context: CanvasRenderingContext2D);
    didExceedMaxLines(): boolean;
    getAlphabeticBaseline(): number;
    /**
     * Returns the index of the glyph that corresponds to the provided coordinate,
     * with the top left corner as the origin, and +y direction as down.
     */
    getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity;
    /**
     * Returns the information associated with the closest glyph at the specified
     * paragraph coordinate, or null if the paragraph is empty.
     */
    getClosestGlyphInfoAtCoordinate(dx: number, dy: number): GlyphInfo | null;
    /**
     * Returns the information associated with the glyph at the specified UTF-16
     * offset within the paragraph's visible lines, or null if the index is out
     * of bounds, or points to a codepoint that is logically after the last
     * visible codepoint.
     */
    getGlyphInfoAt(index: number): GlyphInfo | null;
    getHeight(): number;
    getIdeographicBaseline(): number;
    /**
     * Returns the line number of the line that contains the specified UTF-16
     * offset within the paragraph, or -1 if the index is out of bounds, or
     * points to a codepoint that is logically after the last visible codepoint.
     */
    getLineNumberAt(index: number): number;
    getLineMetrics(): LineMetrics[];
    /**
     * Returns the LineMetrics of the line at the specified line number, or null
     * if the line number is out of bounds, or is larger than or equal to the
     * specified max line number.
     */
    getLineMetricsAt(lineNumber: number): LineMetrics | null;
    getLineMetricsOfRange(start: number, end: number): LineMetrics[];
    getLongestLine(): number;
    getMaxIntrinsicWidth(): number;
    getMaxWidth(): number;
    getMinIntrinsicWidth(): number;
    /**
     * Returns the total number of visible lines in the paragraph.
     */
    getNumberOfLines(): number;
    getRectsForPlaceholders(): RectWithDirection[];
    /**
     * Returns bounding boxes that enclose all text in the range of glpyh indexes [start, end).
     * @param start
     * @param end
     * @param hStyle
     * @param wStyle
     */
    getRectsForRange(start: number, end: number, hStyle: RectHeightStyle, wStyle: RectWidthStyle): RectWithDirection[];
    /**
     * Finds the first and last glyphs that define a word containing the glyph at index offset.
     * @param offset
     */
    getWordBoundary(offset: number): URange;
    /**
     * Returns an array of ShapedLine objects, describing the paragraph.
     */
    getShapedLines(): ShapedLine[];
    /**
     * Lays out the text in the paragraph so it is wrapped to the given width.
     * @param width
     */
    layout(width: number): void;
    /**
     * When called after shaping, returns the glyph IDs which were not matched
     * by any of the provided fonts.
     */
    unresolvedCodepoints(): number[];
    private createNewLine;
    private measureGlyphIfNeeded;
}
export interface LetterRect {
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare class Span {
    letterBaseline: number;
    letterHeight: number;
    lettersBounding: LetterRect[];
}
export declare class TextSpan extends Span {
    private readonly text;
    readonly style: TextStyle;
    charSequence: string[];
    originText: string;
    constructor(text: string, style: TextStyle);
    hasLetterSpacing(): boolean;
    hasWordSpacing(): boolean;
    hasJustifySpacing(paragraphStyle: ParagraphStyle): boolean;
    toBackgroundFillStyle(): string;
    toTextFillStyle(): string;
    toDecorationStrokeStyle(): string;
    toCanvasFont(): string;
}
export declare class NewlineSpan extends TextSpan {
    constructor();
}
export declare const spanWithNewline: (spans: Span[]) => Span[];
export declare class Drawer {
    readonly paragraph: Paragraph;
    static pixelRatio: number;
    static sharedRenderCanvas: HTMLCanvasElement;
    static sharedRenderContext: CanvasRenderingContext2D;
    constructor(paragraph: Paragraph);
    draw(context: CanvasRenderingContext2D): ImageData;
    private fillIcon;
    private computeJustifySpacing;
    private drawBackground;
    private drawDecoration;
}
export declare function install(canvasKit: CanvasKit, pixelRatio: number, embeddingFonts: string[], iconFonts?: Record<string, string>): void;
