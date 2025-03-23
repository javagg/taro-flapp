import { SkEmbindObject, TextContext } from "../bass";
import {
    DecorationStyle, Font, FontCollection,
    FontCollectionFactory, FontEdging, FontHinting, FontMetrics, FontMgr, FontMgrFactory,
    FontStyle, GlyphIDArray, InputColor, InputGlyphIDArray,
    Paint, ParagraphStyle, StrutStyle, TextAlign, TextBaseline,
    TextDirection, TextFontFeatures, TextFontVariations,
    TextHeightBehavior, TextShadow, TextStyle, Typeface,
    TypefaceFactory, TypefaceFontProvider,
    TypefaceFontProviderFactory
} from "../canvaskit";
import { create, Font as FontKitFont, loadFont } from "../font_util";
import { Buffer } from "buffer";

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

