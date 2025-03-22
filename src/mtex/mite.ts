import { _ParagraphBuilder } from "./impl";
import {
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
    GlyphInfo,
    Paragraph,
} from "./canvaskit";

import { SkEmbindObject, TextContext } from "./bass";
import { colorToHex, convertToUpwardToPixelRatio, createCanvas, isEnglishWord, isPunctuation, isSquareCharacter } from "./util";
import { create, Font as FontKitFont, loadFont } from './font_util'
import { Buffer } from "buffer";

export { _ParagraphBuilder } from "./impl";
export class _ParagraphBuilderFactory extends SkEmbindObject<"ParagraphBuilderFactory"> implements ParagraphBuilderFactory {
    constructor() {
        super("ParagraphBuilderFactory")
    }

    MakeFromFontProvider(style: ParagraphStyle, fontSrc: TypefaceFontProvider): ParagraphBuilder {
        throw new Error("MakeFromFontProvider not implemented.");
    }

    ShapeText(text: string, runs: FontBlock[], width?: number): ShapedLine[] {
        throw new Error("ShapeText not implemented.");
    }

    Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
        return this.MakeFromFontCollection(style, null);
    }

    MakeFromFontCollection(
        style: ParagraphStyle,
        fontCollection: FontCollection
    ): ParagraphBuilder {
        return new _ParagraphBuilder(style);
        throw new Error("MakeFromFontCollection not implemented.");
    }

    RequiresClientICU(): boolean {
        return false;
    }
}

export class _FontCollection extends SkEmbindObject<"FontCollection"> implements FontCollection {

    static Make(): FontCollection {
        return new _FontCollection();
    }

    constructor() {
        super("FontCollection");
    }

    setDefaultFontManager(fontManager: TypefaceFontProvider | null): void {
        // throw new Error("method not implemented")
    }

    enableFontFallback(): void {
        // throw new Error("method not implemented")
    }
}

export class _FontCollectionFactory extends SkEmbindObject<"FontCollectionFactory"> implements FontCollectionFactory {
    constructor() {
        super("FontCollectionFactory")
    }
    Make(): FontCollection {
        return new _FontCollection();
    }
}

export class _FontMgr extends SkEmbindObject<"FontMgr"> implements FontMgr {

    static FromData(...buffers: ArrayBuffer[]): FontMgr | null {
        // throw new Error("method not implemented")
        const typefaces: Typeface[] = [];
        buffers.forEach((buffer) => {
            const typeface = _Typeface.MakeFreeTypeFaceFromData(buffer);
            if (!typeface) {
                throw new Error("Could not load font");
            }
            typefaces.push(typeface);
        });
        return new _FontMgr(typefaces);
    }
    /**
    * Return the number of font families loaded in this manager. Useful for debugging.
    */
    // constructor() {
    //   super("FontMgr")
    // }
    constructor(readonly typefaces: Typeface[]) {
        super("FontMgr");
    }

    registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {
        // throw new Error("registerFont not implemented")
        loadFont(bytes, family);
    }

    countFamilies(): number {
        // return 0;
        return this.typefaces.length;
    }

    /**
     * Return the nth family name. Useful for debugging.
     * @param index
     */
    getFamilyName(index: number): string {
        // throw new Error("method not implemented")
        return (this.typefaces[index] as _Typeface).familyName;
        // return "";
    }

    /**
     * Find the closest matching typeface to the specified familyName and style.
     */
    matchFamilyStyle(name: string, style: FontStyle): Typeface {
        throw new Error("matchFamilyStyle not implemented.");
    }
}

export class _FontMgrFactory extends SkEmbindObject<"FontMgrFactory"> implements FontMgrFactory {
    constructor() { super("FontMgrFactory") }
    FromData(...buffers: ArrayBuffer[]): FontMgr | null {
        throw new Error("method not implemented")
    }
}

export class _TypefaceFactory extends SkEmbindObject<"TypefaceFactory"> implements TypefaceFactory {
    constructor() { super("TypefaceFactory") }
    GetDefault(): Typeface | null {
        throw new Error("method not implemented")
        return null;
    }

    MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null {
        throw new Error("method not implemented")
        return null;
    }

    MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null {
        // throw new Error("method not implemented")
        // return null;
        const { familyName } = create(Buffer.from(fontData)) as FontKitFont
        return new _Typeface(familyName, fontData);
    }
}

export class _Typeface extends SkEmbindObject<"Typeface"> implements Typeface {
    inner: FontKitFont

    /**
     * By default, CanvasKit has a default monospace typeface compiled in so that text works out
     * of the box. This returns that typeface if it is available, null otherwise.
     */
    static GetDefault(): Typeface | null {
        throw new Error("GetDefault not implemented")
    }

    /**
     * Create a typeface using Freetype from the specified bytes and return it. CanvasKit supports
     * .ttf, .woff and .woff2 fonts. It returns null if the bytes cannot be decoded.
     * @param fontData
     */
    static MakeTypefaceFromData(fontData: ArrayBuffer): Typeface | null {
        throw new Error("MakeTypefaceFromData not implemented")
    }

    static MakeFreeTypeFaceFromData(fontData: ArrayBuffer): Typeface | null {
        const { familyName } = create(Buffer.from(fontData)) as FontKitFont
        return new _Typeface(familyName, fontData);
    }

    constructor(public familyName: string, data: ArrayBuffer | null) {
        super("Typeface");
        if (data) {
            this.inner = create(Buffer.from(data)) as FontKitFont
        }
    }

    /**
       * Retrieves the glyph ids for each code point in the provided string. Note that glyph IDs
       * are typeface-dependent; different faces may have different ids for the same code point.
       * @param str
       * @param numCodePoints - the number of code points in the string. Defaults to str.length.
       * @param output - if provided, the results will be copied into this array.
       */
    getGlyphIDs(str: string, numCodePoints?: number,
        output?: GlyphIDArray): GlyphIDArray {
        // throw new Error("getGlyphIDs not implemented")
        const result = output ?? new Uint16Array(numCodePoints ?? str.length);
        for (let i = 0; i < result.length; i++) {
            const codepoint = str.codePointAt(i)!;
            const { id, name, codePoints, path, bbox, cbox } = this.inner.glyphForCodePoint(codepoint)
            // const index = this.cmap?.glyphIndexMap![codepoint] ?? 0;
            result[i] = id;
        }
        return result;
    }

    // TODO: refactor so we don't need to create a typed array here
    getStringForGlyph(glyphID: number) {
        return this.glyphToText(Uint16Array.of(glyphID));
    }

    glyphToText(glyphs: Uint16Array) {
        let text = "";

        // const keys = Object.keys(this.inner. cmap!.glyphIndexMap!);
        // const values = Object.values(this.cmap!.glyphIndexMap!);
        for (let i = 0; i < glyphs.length; i++) {
            text += this.inner.stringsForGlyph(i).join()
            // const index = values.indexOf(glyphs[i]);
            // if (index !== -1) {
            //   text += String.fromCodePoint(Number(keys[index]));
            // }
        }
        return text;
    }
}

export class _TypefaceFontProviderFactory extends SkEmbindObject<"TypefaceFontProviderFactory"> implements TypefaceFontProviderFactory {
    constructor() { super("TypefaceFontProviderFactory") }

    Make(): TypefaceFontProvider {
        return new _TypefaceFontProvider();
    }
}

export class _TypefaceFontProvider extends SkEmbindObject<"TypefaceFontProvider"> implements TypefaceFontProvider {
    constructor() { super("TypefaceFontProvider") }

    static Make(): TypefaceFontProvider {
        return new _TypefaceFontProvider();
    }

    registerFont(bytes: ArrayBuffer | Uint8Array, family: string): void {
        // throw new Error("registerFont not implemented")
        loadFont(bytes, family);
    }

    /**
   * Return the number of font families loaded in this manager. Useful for debugging.
   */
    countFamilies() {
        throw new Error("registerFont not implemented")
    }

    /**
     * Return the nth family name. Useful for debugging.
     * @param index
     */
    getFamilyName(index: number): string {
        throw new Error("registerFont not implemented")
    }

    /**
     * Find the closest matching typeface to the specified familyName and style.
     */
    matchFamilyStyle(name: string, style: FontStyle): Typeface {
        throw new Error("registerFont not implemented")
    }
}

export class _Font extends SkEmbindObject<"Font"> implements Font {
    private typeface: _Typeface;

    /**
     * Constructs Font with default values with Typeface and size in points,
     * horizontal scale, and horizontal skew. Horizontal scale emulates condensed
     * and expanded fonts. Horizontal skew emulates oblique fonts.
     * @param face
     * @param size
     * @param scaleX
     * @param skewX
     */
    constructor(face: Typeface | null, size: number, scaleX: number, skewX: number) {
        super("Font");
        this.typeface = face as _Typeface ?? new _Typeface("sans-serif", null);
    }

    /**
     * Constructs Font with default values with Typeface.
     * @param face
     * @param size - font size in points. If not specified, uses a default value.
     */
    // constructor(face: Typeface | null, size?: number) {
    //     super("Font");
    //     this.typeface = face as _Typeface ?? new _Typeface("sans-serif", null);
    // }


    getMetrics(): FontMetrics {
        // throw new Error("method not implemented")
        // return { ascent: 0, descent: 0, leading: 0 };
        TextContext.font = this.fontStyle();
        // Using a capital 'H' to approximate ascent, as it generally extends to the highest point in most fonts.
        const ascent = TextContext.measureText("H").actualBoundingBoxAscent;
        // Using a lowercase 'p' to approximate descent, as it generally extends to the lowest point in most fonts.
        const descent = TextContext.measureText("p").actualBoundingBoxDescent;
        // Approximating leading by using 1.2 times font size - font size
        const lineHeight = this.size * 1.2;
        const leading = lineHeight - this.size;
        return {
            ascent: -ascent,
            descent: descent,
            leading: leading,
        };
    }

    getGlyphBounds(
        glyphs: InputGlyphIDArray,
        paint?: Paint | null,
        output?: Float32Array
    ): Float32Array {
        // throw new Error("method not implemented")
        const result = output ?? new Float32Array(glyphs.length * 4);
        for (let i = 0; i < glyphs.length; i++) {
            const id = glyphs[i];
            const { bbox } = this.typeface.inner.getGlyph(id)
            result[4 * i] = bbox.minX
            result[4 * i + 1] = bbox.minX
            result[4 * i + 2] = bbox.width
            result[4 * i + 3] = bbox.height
        }
        return result;
        // return new Float32Array([0, 0, 0, 0]);
    }

    getGlyphIDs(str: string, numCodePoints?: number,
        output?: GlyphIDArray): GlyphIDArray {
        // throw new Error("method not implemented")
        return this.typeface.getGlyphIDs(str, numCodePoints, output);
        // return new Uint16Array([]);
    }

    getGlyphWidths(glyphs: InputGlyphIDArray, paint?: Paint | null,
        output?: Float32Array): Float32Array {
        throw new Error("method not implemented")
        return new Float32Array([]);
    }

    getGlyphIntercepts(glyphs: InputGlyphIDArray, positions: Float32Array | number[],
        top: number, bottom: number): Float32Array {
        throw new Error("method not implemented")
        return new Float32Array([]);
    }

    getScaleX(): number {
        throw new Error("method not implemented")
        return 1;
    }

    getSize(): number {
        // throw new Error("method not implemented")
        return this.size;
        // return 0;
    }

    getSkewX(): number {
        throw new Error("method not implemented")
        return 1;
    }

    isEmbolden(): boolean {
        throw new Error("method not implemented")
        return false;
    }

    getTypeface(): Typeface | null {
        throw new Error("method not implemented")
        // return this.typeface;
        // return null;
    }

    setEdging(edging: FontEdging): void {
        throw new Error("method not implemented")
    }
    setEmbeddedBitmaps(embeddedBitmaps: boolean): void {
        throw new Error("method not implemented")
    }
    setHinting(hinting: FontHinting): void {
        throw new Error("method not implemented")
    }
    setLinearMetrics(linearMetrics: boolean): void {
        throw new Error("method not implemented")
    }
    setScaleX(sx: number): void {
        throw new Error("method not implemented")
    }
    setSize(points: number): void {
        // throw new Error("method not implemented")
        this.size = points;
    }
    setSkewX(sx: number): void {
        throw new Error("method not implemented")
    }
    setEmbolden(embolden: boolean): void {
        throw new Error("method not implemented")
    }
    setSubpixel(subpixel: boolean): void {
        throw new Error("method not implemented")
    }
    setTypeface(face: Typeface | null): void {
        throw new Error("method not implemented")
    }

    private fontStyle() {
        return `${this.size}px ${this.typeface.familyName}`;
    }
}

export class _ParagraphStyle extends SkEmbindObject<"ParagraphStyle"> implements ParagraphStyle {
    constructor(ps: ParagraphStyle) {
        super("ParagraphStyle")
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

export class _TextStyle extends SkEmbindObject<"TextStyle"> implements TextStyle {
    constructor(ts: TextStyle) {
        super("TextStyle")
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
        // let layoutStartTime!: number;
        // if (logger.profileMode) {
        //   layoutStartTime = new Date().getTime();
        // }
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
        const spans = spanWithNewline(this.spans);
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
        // logger.debug("TextLayout.layout.lineMetrics", lineMetrics);
        // if (logger.profileMode) {
        //   const layoutCostTime = new Date().getTime() - layoutStartTime;
        //   logger.profile("Layout cost", layoutCostTime);
        // }
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


export class Drawer {
    static pixelRatio = 1.0;
    static sharedRenderCanvas: HTMLCanvasElement;
    static sharedRenderContext: CanvasRenderingContext2D;

    constructor(readonly paragraph: Paragraph) { }

    private initCanvas() {
        if (!Drawer.sharedRenderCanvas) {
            Drawer.sharedRenderCanvas = createCanvas(
                Math.min(4000, 1000 * Drawer.pixelRatio),
                Math.min(4000, 1000 * Drawer.pixelRatio)
            );
            Drawer.sharedRenderContext = Drawer.sharedRenderCanvas!.getContext(
                "2d"
            ) as CanvasRenderingContext2D;
        }
    }

    draw(): ImageData {
        this.initCanvas();
        const width = convertToUpwardToPixelRatio(
            this.paragraph.getMaxWidth() * Drawer.pixelRatio,
            Drawer.pixelRatio
        );
        const height = convertToUpwardToPixelRatio(
            this.paragraph.getHeight() * Drawer.pixelRatio,
            Drawer.pixelRatio
        );
        if (width <= 0 || height <= 0) {
            const context = Drawer.sharedRenderContext;
            context.clearRect(0, 0, 1, 1);
            return context.getImageData(0, 0, 1, 1);
        }
        const context = Drawer.sharedRenderContext;
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
