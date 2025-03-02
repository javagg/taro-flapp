import {
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
    TextShadow
} from "./canvaskit";

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
        throw new Error("MakeFromFontCollection not implemented.");
    }
    
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
