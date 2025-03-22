import {
    EmbindObject,
    Color,
    TextAlignEnumValues, AffinityEnumValues,
    DecorationStyleEnumValues,
    FontSlantEnumValues,
    FontWeightEnumValues, FontWidthEnumValues,
    PlaceholderAlignmentEnumValues,
    RectHeightStyleEnumValues,
    RectWidthStyleEnumValues,
    TextBaselineEnumValues,
    TextDirectionEnumValues,
    TextHeightBehaviorEnumValues,
    StrokeCap as StrokeCapType,
    StrokeJoin as StrokeJoinType,
    StrokeCapEnumValues,
    StrokeJoinEnumValues,
    AlphaTypeEnumValues,
    BlendModeEnumValues,
    BlurStyleEnumValues,
    ClipOpEnumValues,
    ColorChannelEnumValues,
    ColorTypeEnumValues,
    FillTypeEnumValues,
    FilterModeEnumValues,
    FontEdgingEnumValues,
    FontHintingEnumValues,
    GlyphRunFlagValues,
    ImageFormatEnumValues,
    MipmapModeEnumValues,
    PaintStyleEnumValues,
    Path1DEffectStyleEnumValues,
    PathOpEnumValues,
    PointModeEnumValues,
    ColorSpaceEnumValues,
    TileModeEnumValues,
    ColorSpace as  ColorSpaceType,
    VertexModeEnumValues,
    InputStateEnumValues,
    ModifierKeyEnumValues,
    ResizePolicyEnumValues,
    VerticalTextAlignEnumValues,
} from './canvaskit'

export function createDomCanvasElement(width?: number, height?: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    if (width) canvas.width = width;
    if (height) canvas.height = height;
    return canvas;
}

export function clampInt(value: number, min: number, max: number): number {
    if (min > max) throw new Error("min must be less than or equal to max");
    return Math.min(Math.max(value, min), max);
}

export const mapKeys = <T extends object>(obj: T) =>
    Object.keys(obj) as (keyof T)[];

const makeEnum = <T>(values: Record<Exclude<keyof T, "values">, number>): T => {
    const valueKeys = mapKeys(values)
        .filter((name) => typeof values[name] === "number")
        .map((name) => ({
            name,
            value: values[name],
        }));
    const result = Object.assign(
        {
            values: Object.assign(
                {},
                ...valueKeys.map(({ value }) => ({ [value]: { value } }))
            ),
        },
        ...valueKeys.map(({ name, value }) => ({ [name]: { value } }))
    );
    return result;
};

   // Core Enums
//    readonly AlphaType: AlphaTypeEnumValues;
//    readonly BlendMode: BlendModeEnumValues;
//    readonly BlurStyle: BlurStyleEnumValues;
//    readonly ClipOp: ClipOpEnumValues;
//    readonly ColorChannel: ColorChannelEnumValues;
//    readonly ColorType: ColorTypeEnumValues;
//    readonly FillType: FillTypeEnumValues;
//    readonly FilterMode: FilterModeEnumValues;
//    readonly FontEdging: FontEdgingEnumValues;
//    readonly FontHinting: FontHintingEnumValues;
//    readonly GlyphRunFlags: GlyphRunFlagValues;
//    readonly ImageFormat: ImageFormatEnumValues;
//    readonly MipmapMode: MipmapModeEnumValues;
//    readonly PaintStyle: PaintStyleEnumValues;
//    readonly Path1DEffect: Path1DEffectStyleEnumValues;
//    readonly PathOp: PathOpEnumValues;
//    readonly PointMode: PointModeEnumValues;
//    readonly ColorSpace: ColorSpaceEnumValues;
//    readonly StrokeCap: StrokeCapEnumValues;
//    readonly StrokeJoin: StrokeJoinEnumValues;
//    readonly TileMode: TileModeEnumValues;
//    readonly VertexMode: VertexModeEnumValues;
//    readonly InputState: InputStateEnumValues;
//    readonly ModifierKey: ModifierKeyEnumValues

export enum AlphaTypeEnum {
    Opaque,
    Premul,
    Unpremul,
}
export const AlphaType = makeEnum<AlphaTypeEnumValues>(AlphaTypeEnum);

export enum  BlendModeEnum {
    Clear,
    Src,
    Dst,
    SrcOver,
    DstOver,
    SrcIn,
    DstIn,
    SrcOut,
    DstOut,
    SrcATop,
    DstATop,
    Xor,
    Plus,
    Modulate,
    Screen,
    Overlay,
    Darken,
    Lighten,
    ColorDodge,
    ColorBurn,
    HardLight,
    SoftLight,
    Difference,
    Exclusion,
    Multiply,
    Hue,
    Saturation,
    Color,
    Luminosity, 
}
export const BlendMode = makeEnum<BlendModeEnumValues>(BlendModeEnum); 
export enum  BlurStyleEnum {
    Normal,
    Solid,
    Outer,
    Inner,
}
export const BlurStyle = makeEnum<BlurStyleEnumValues>(BlurStyleEnum);

export enum  ClipOpEnum {
    Difference,
    Intersect,
}
export const ClipOp = makeEnum<ClipOpEnumValues>(ClipOpEnum);

 export enum  ColorChannelEnum {
    Red,
    Green,
    Blue,
    Alpha,
 }
 export const ColorChannel = makeEnum<ColorChannelEnumValues>(ColorChannelEnum);
  

 export enum   ColorTypeEnum {
    Alpha_8,
    RGB_565,
    RGBA_8888,
    BGRA_8888,
    RGBA_1010102,
    RGB_101010x,
    Gray_8,
    RGBA_F16,
    RGBA_F32,
 }
 export const ColorType = makeEnum<ColorTypeEnumValues>(ColorTypeEnum);

export enum  FillTypeEnum {
    Winding,
    EvenOdd,
}
export const FillType = makeEnum<FillTypeEnumValues>(FillTypeEnum);

export enum  FilterModeEnum {
    Nearest,
    Linear,
}
export const FilterMode = makeEnum<FilterModeEnumValues>(FilterModeEnum);
 
export enum  FontEdgingEnum {
    Alias,
    AntiAlias,
    SubpixelAntiAlias,
}
export const FontEdging = makeEnum<FontEdgingEnumValues>(FontEdgingEnum);

export enum  FontHintingEnum {
    None,
    Slight,
    Normal,
    Full,
}
export const FontHinting = makeEnum<FontHintingEnumValues>(FontHintingEnum);

export enum ImageFormatEnum {
    PNG,
    JPEG,
    WEBP,
}
export const ImageFormat = makeEnum<ImageFormatEnumValues>(ImageFormatEnum);

export enum MipmapModeEnum {
    None,
    Nearest,
    Linear,
}
export const MipmapMode = makeEnum<MipmapModeEnumValues>(MipmapModeEnum);

export enum PaintStyleEnum {
    Fill,
    Stroke,
}
export const PaintStyle = makeEnum<PaintStyleEnumValues>(PaintStyleEnum);

export enum Path1DEffectStyleEnum {
    // Translate the shape to each position
    Translate,
    // Rotate the shape about its center
    Rotate,
    // Transform each point and turn lines into curves
    Morph,
}
export const Path1DEffectStyle = makeEnum<Path1DEffectStyleEnumValues>(Path1DEffectStyleEnum);

export enum PathOpEnum {
    Difference,
    Intersect,
    Union,
    XOR,    
    ReverseDifference,

}
export const PathOp = makeEnum<PathOpEnumValues>(PathOpEnum);

export enum PointModeEnum {
    Points,
    Lines,
    Polygon,
}
export const PointMode = makeEnum<PointModeEnumValues>(PointModeEnum);

export enum ColorSpaceEnum {
    // These are all singleton values - don't call delete on them.
    SRGB,
   DISPLAY_P3,
    ADOBE_RGB,
    // Equals(a: ColorSpaceType, b: ColorSpaceType): boolean {}
}
export const ColorSpace = makeEnum<ColorSpaceEnumValues>(ColorSpaceEnum);

export enum TileModeEnum {
    Clamp,
    Repeat,
    Mirror,
    Decal,
}
export const TileMode = makeEnum<TileModeEnumValues>(TileModeEnum);

export enum  VertexModeEnum {
    Triangles,
    TrianglesStrip,
    TriangleFan,
}
export const VertexMode = makeEnum<VertexModeEnumValues>(VertexModeEnum);

export enum  InputStateEnum {
    Down,
    Up,
    Move,
    Right, // fling only
    Left,  // fling only
}
export const InputState = makeEnum<InputStateEnumValues>(InputStateEnum);

export enum ModifierKeyEnum {
    None,
    Shift,
    Control,
    Option,
    Command,
    FirstPress,
}
export const ModifierKey = makeEnum<ModifierKeyEnumValues>(ModifierKeyEnum);

// // Paragraph Enums
// readonly Affinity: AffinityEnumValues;
// readonly DecorationStyle: DecorationStyleEnumValues;
// readonly FontSlant: FontSlantEnumValues;
// readonly FontWeight: FontWeightEnumValues;
// readonly FontWidth: FontWidthEnumValues;
// readonly PlaceholderAlignment: PlaceholderAlignmentEnumValues;
// readonly RectHeightStyle: RectHeightStyleEnumValues;
// readonly RectWidthStyle: RectWidthStyleEnumValues;
// readonly TextAlign: TextAlignEnumValues;
// readonly TextBaseline: TextBaselineEnumValues;
// readonly TextDirection: TextDirectionEnumValues;
// readonly TextHeightBehavior: TextHeightBehaviorEnumValues;

export enum AffinityEnum {
    Upstream,
    Downstream,
}
export const Affinity = makeEnum<AffinityEnumValues>(AffinityEnum);

export enum DecorationStyleEnum {
    Solid,
    Double,
    Dotted,
    Dashed,
    Wavy,
}
export const DecorationStyle = makeEnum<DecorationStyleEnumValues>(DecorationStyleEnum);

export enum FontSlantEnum {
    Upright,
    Italic,
    Oblique,
}
export const FontSlant = makeEnum<FontSlantEnumValues>(FontSlantEnum);

export enum FontWidthEnum {
    UltraCondensed,
    ExtraCondensed,
    Condensed,
    SemiCondensed,
    Normal,
    SemiExpanded,
    Expanded,
    ExtraExpanded,
    UltraExpanded,
}
export const FontWidth = makeEnum<FontWidthEnumValues>(FontWidthEnum);

export enum FontWeightEnum {
    Invisible,
    Thin,
    ExtraLight,
    Light,
    Normal,
    Medium,
    SemiBold,
    Bold,
    ExtraBold,
    Black,
    ExtraBlack,
}
export const FontWeight = makeEnum<FontWeightEnumValues>(FontWeightEnum);

export enum PlaceholderAlignmentEnum {
    Baseline,
    AboveBaseline,
    BelowBaseline,
    Top,
    Bottom,
    Middle,
}
export const PlaceholderAlignment = makeEnum<PlaceholderAlignmentEnumValues>(PlaceholderAlignmentEnum);

export enum RectHeightStyleEnum {
    Tight,
    Max,
    IncludeLineSpacingMiddle,
    IncludeLineSpacingTop,
    IncludeLineSpacingBottom,
    Strut,
}
export const RectHeightStyle = makeEnum<RectHeightStyleEnumValues>(RectHeightStyleEnum);

export enum RectWidthStyleEnum {
    Tight,
    Max,
}
export const RectWidthStyle = makeEnum<RectWidthStyleEnumValues>(RectWidthStyleEnum);

export enum TextAlignEnum {
    Left,
    Right,
    Center,
    Justify,
    Start,
    End,
}
export const TextAlign = makeEnum<TextAlignEnumValues>(TextAlignEnum);

export enum TextBaselineEnum {
    Alphabetic,
    Ideographic,
}
export const TextBaseline = makeEnum<TextBaselineEnumValues>(TextBaselineEnum);

export enum TextDirectionEnum {
    LTR,
    RTL,
}

export const TextDirection = makeEnum<TextDirectionEnumValues>(TextDirectionEnum);


export enum TextHeightBehaviorEnum {
    All,
    DisableFirstAscent,
    DisableLastDescent,
    DisableAll,
}
export const TextHeightBehavior = makeEnum<TextHeightBehaviorEnumValues>(TextHeightBehaviorEnum);

export const _ParagraphEnums = {
    Affinity,
    DecorationStyle,
    FontSlant,
    FontWeight,
    FontWidth,
    PlaceholderAlignment,
    RectHeightStyle,
    RectWidthStyle,
    TextAlign,
    TextBaseline,
    TextDirection,
    TextHeightBehavior,
}

// other enums
export enum StrokeCapEnum {
    Butt,
    Round,
    Square,
}
export const StrokeCap = makeEnum<StrokeCapEnumValues>(StrokeCapEnum);

export enum StrokeJoinEnum {
    Bevel,
    Miter,
    Round,
}
export const StrokeJoin = makeEnum<StrokeJoinEnumValues>(StrokeJoinEnum);

export enum  ResizePolicyEnum {
    // Use the specified text size.
    None,
    // Resize the text such that the extent box fits (snuggly) in the text box,
    // both horizontally and vertically.
    ScaleToFit,
    // Same kScaleToFit if the text doesn't fit at the specified font size.
    // Otherwise, same as kNone.
    DownscaleToFit,
}
export const ResizePolicy = makeEnum<ResizePolicyEnumValues>(ResizePolicyEnum);
 
export enum VerticalTextAlignEnum {
    Top,
    TopBaseline,

    // Skottie vertical alignment extensions
    // Visual alignement modes -- these are using tight visual bounds for the paragraph.
    VisualTop,     // visual top    -> text box top
    VisualCenter,  // visual center -> text box center
    VisualBottom,  // visual bottom -> text box bottom
}
export const VerticalTextAlign = makeEnum<VerticalTextAlignEnumValues>(VerticalTextAlignEnum);

 
export const NoDecoration=0
export const UnderlineDecoration=1
export const OverlineDecoration=2
export const LineThroughDecoration=3

// // Paragraph Constants
export const _ParagraphConstants = {
    NoDecoration,
    UnderlineDecoration,
    OverlineDecoration,
    LineThroughDecoration,
}

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

export class _Paint extends SkEmbindObject<"Paint"> {
    // public _type = "SkPaint";

    constructor() {
        super("Paint")
    }
    /**
     * Returns a copy of this paint.
     */
    copy(): _Paint {
        const newValue = new _Paint();
        Object.assign(newValue, this);
        return newValue;
    }

    private _color: Color = Float32Array.of(0, 0, 0, 255);

    /**
     * Retrieves the alpha and RGB unpremultiplied. RGB are extended sRGB values
     * (sRGB gamut, and encoded with the sRGB transfer function).
     */
    getColor(): Color {
        return this._color;
    }

    private _strokeCap = StrokeCap.Butt;

    /**
     * Returns the geometry drawn at the beginning and end of strokes.
     */
    getStrokeCap(): StrokeCapType {
        return this._strokeCap;
    }

    private _strokeJoin = StrokeJoin.Bevel;

    /**
     * Returns the geometry drawn at the corners of strokes.
     */
    getStrokeJoin(): StrokeJoinType {
        return this._strokeJoin;
    }

    private _strokeMiter = 0;

    /**
     *  Returns the limit at which a sharp corner is drawn beveled.
     */
    getStrokeMiter(): number {
        return this._strokeMiter;
    }

    private _strokeWidth = 0;

    /**
     * Returns the thickness of the pen used to outline the shape.
     */
    getStrokeWidth(): number {
        return this._strokeWidth;
    }

    private _alpha = 1.0;

    /**
     * Replaces alpha, leaving RGBA unchanged. 0 means fully transparent, 1.0 means opaque.
     * @param alpha
     */
    setAlphaf(alpha: number): void {
        this._alpha = alpha;
    }

    private _antiAlias = true;

    /**
     * Requests, but does not require, that edge pixels draw opaque or with
     * partial transparency.
     * @param aa
     */
    setAntiAlias(aa: boolean): void {
        this._antiAlias = aa;
    }

    /**
     * Sets the blend mode that is, the mode used to combine source color
     * with destination color.
     * @param mode
     */
    setBlendMode(mode: any): void { }

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
    setBlender(blender: any): void { }

    /**
     * Sets alpha and RGB used when stroking and filling. The color is four floating
     * point values, unpremultiplied. The color values are interpreted as being in
     * the provided colorSpace.
     * @param color
     * @param colorSpace - defaults to sRGB
     */
    setColor(color: Color): void {
        this._color = color;
    }

    /**
     * Sets alpha and RGB used when stroking and filling. The color is four floating
     * point values, unpremultiplied. The color values are interpreted as being in
     * the provided colorSpace.
     * @param r
     * @param g
     * @param b
     * @param a
     * @param colorSpace - defaults to sRGB
     */
    setColorComponents(r: number, g: number, b: number, a: number): void {
        this.setColor(Float32Array.of(r, g, b, a));
    }

    /**
     * Sets the current color filter, replacing the existing one if there was one.
     * @param filter
     */
    setColorFilter(filter: any): void { }

    /**
     * Sets the color used when stroking and filling. The color values are interpreted as being in
     * the provided colorSpace.
     * @param color
     * @param colorSpace - defaults to sRGB.
     */
    setColorInt(color: any, colorSpace?: any): void { }

    /**
     * Requests, but does not require, to distribute color error.
     * @param shouldDither
     */
    setDither(shouldDither: boolean): void { }

    /**
     * Sets the current image filter, replacing the existing one if there was one.
     * @param filter
     */
    setImageFilter(filter: any): void { }

    /**
     * Sets the current mask filter, replacing the existing one if there was one.
     * @param filter
     */
    setMaskFilter(filter: any): void { }

    /**
     * Sets the current path effect, replacing the existing one if there was one.
     * @param effect
     */
    setPathEffect(effect: any): void { }

    /**
     * Sets the current shader, replacing the existing one if there was one.
     * @param shader
     */
    setShader(shader: any): void { }

    /**
     * Sets the geometry drawn at the beginning and end of strokes.
     * @param cap
     */
    setStrokeCap(cap: StrokeCapType): void {
        this._strokeCap = cap;
    }

    /**
     * Sets the geometry drawn at the corners of strokes.
     * @param join
     */
    setStrokeJoin(join: StrokeJoinType): void {
        this._strokeJoin = join;
    }

    /**
     * Sets the limit at which a sharp corner is drawn beveled.
     * @param limit
     */
    setStrokeMiter(limit: number): void {
        this._strokeMiter = limit;
    }

    /**
     * Sets the thickness of the pen used to outline the shape.
     * @param width
     */
    setStrokeWidth(width: number): void {
        this._strokeWidth = width;
    }

    /**
     * Sets whether the geometry is filled or stroked.
     * @param style
     */
    setStyle(style: any): void { }
}

const offscreen = new OffscreenCanvas(1, 1);
export const TextContext = offscreen.getContext("2d")!;