/* eslint-disable no-bitwise */
import type {
    ColorSpace,
    EmbindEnumEntity,
    Paint,
    PathEffect,
    InputColor,
    StrokeJoin, StrokeCap, PaintStyle,
    Color,
    BlendMode,
    ColorFilter,
    MaskFilter,
    Blender
} from "../canvaskit";

// import { Paint as NativePaint } from "../c2d";
// import type { InputColor } from "../Core";
// import { StrokeJoin, StrokeCap, PaintStyle } from "../Core";
import type { ShaderJS } from "./shader";
import type { ImageFilterJS, MaskFilterJS, ColorFilterJS } from "./filter";
import { SkEmbindObject } from "../bass";
// import { HostObject } from "../HostObject";
// import type { MaskFilterJS } from "../MaskFilter/MaskFilter";
// import type { ColorFilterJS } from "../ColorFilter/ColorFilter";

// import { nativeBlendMode } from "./BlendMode";

/**
 * See SkPaint.h for more information on this class.
 */
export class PaintJS extends SkEmbindObject<"Paint"> implements Paint {
    private color = Float32Array.of(0, 0, 0, 1);

    private paint = new NativePaint();

    constructor() {
        super("Paint");
    }

    getPaint() {
        return this.paint;
    }

    /**
     * Returns a copy of this paint.
     */
    copy(): Paint {
        const { color } = this;
        const paint = new PaintJS();
        paint.paint = this.paint.copy();
        if (color !== null) {
            paint.color = color;
        }
        return paint;
    }
    /**
     * Retrieves the alpha and RGB unpremultiplied. RGB are extended sRGB values
     * (sRGB gamut, and encoded with the sRGB transfer function).
     */
    getColor(): Color {
        return this.color;
    }

    /**
     * Returns the geometry drawn at the beginning and end of strokes.
     */
    getStrokeCap(): StrokeCap {
        return lineCap(this.paint.getStrokeCap());
    }

    /**
     * Returns the geometry drawn at the corners of strokes.
     */
    getStrokeJoin(): StrokeJoin {
        return lineJoin(this.paint.getStrokeJoin());
    }

    /**
     *  Returns the limit at which a sharp corner is drawn beveled.
     */
    getStrokeMiter(): number {
        return this.paint.getStrokeMiter();
    }

    /**
     * Returns the thickness of the pen used to outline the shape.
     */
    getStrokeWidth(): number {
        return this.paint.getStrokeWidth();
    }

    /**
     * Replaces alpha, leaving RGBA unchanged. 0 means fully transparent, 1.0 means opaque.
     * @param alpha
     */
    setAlphaf(alpha: number): void {
        this.color[3] = alpha;
        this.paint.setAlpha(alpha);
    }

    /**
     * Requests, but does not require, that edge pixels draw opaque or with
     * partial transparency.
     * @param aa
     */
    setAntiAlias(aa: boolean): void { }

    /**
     * Sets the blend mode that is, the mode used to combine source color
     * with destination color.
     * @param mode
     */
    setBlendMode(mode: BlendMode): void {
        this.paint.setBlendMode(nativeBlendMode(mode));
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
    /**
     * Sets alpha and RGB used when stroking and filling. The color is four floating
     * point values, unpremultiplied. The color values are interpreted as being in
     * the provided colorSpace.
     * @param color
     * @param colorSpace - defaults to sRGB
     */
    setColor(color: InputColor, colorSpace?: ColorSpace): void {
        this.color =
            color instanceof Float32Array ? color : Float32Array.from(color);
        this.paint.setAlpha(this.color[3]);
        this.paint.setColor(
            `rgb(${Math.round(this.color[0] * 255)}, ${Math.round(
                this.color[1] * 255
            )}, ${Math.round(this.color[2] * 255)})`
        );
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
    setColorComponents(r: number, g: number, b: number, a: number, colorSpace?: ColorSpace): void {
        this.setColor(Float32Array.of(r, g, b, a));
    }

    /**
     * Sets the current color filter, replacing the existing one if there was one.
     * @param filter
     */
    setColorFilter(filter: ColorFilter | null): void {
        if (!filter) {
            throw new Error("Filter cannot be null");
        }
        this.paint.addImageFilter(...filter.filters);
    }

    /**
     * Sets the color used when stroking and filling. The color values are interpreted as being in
     * the provided colorSpace.
     * @param color
     * @param colorSpace - defaults to sRGB.
     */
    setColorInt(color: ColorInt, colorSpace?: ColorSpace): void {
        // Extract the color components
        let alpha = (colorInt >>> 24) & 255;
        let red = (colorInt >> 16) & 255;
        let green = (colorInt >> 8) & 255;
        let blue = colorInt & 255;

        // Normalize the color components to [0, 1]
        alpha /= 255;
        red /= 255;
        green /= 255;
        blue /= 255;
        this.setColor(Float32Array.of(red, green, blue, alpha));
    }

    /**
     * Requests, but does not require, to distribute color error.
     * @param shouldDither
     */
    setDither(shouldDither: boolean): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Sets the current image filter, replacing the existing one if there was one.
     * @param filter
     */
    setImageFilter(filter: ImageFilter | null): void {
        if (!filter) {
            throw new Error("Filter cannot be null");
        }
        this.paint.addImageFilter(...filter.filters);
    }

    /**
     * Sets the current mask filter, replacing the existing one if there was one.
     * @param filter
     */
    setMaskFilter(filter: MaskFilter | null): void {
        if (!filter) {
            throw new Error("Filter cannot be null");
        }
        this.paint.addImageFilter(...filter.filters);
    }

    /**
     * Sets the current path effect, replacing the existing one if there was one.
     * @param effect
     */
    setPathEffect(effect: PathEffect | null): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Sets the current shader, replacing the existing one if there was one.
     * @param shader
     */
    setShader(shader: Shader | null): void {
        this.paint.setShader(shader ? shader.getShader() : shader);
    }


    /**
     * Sets the geometry drawn at the beginning and end of strokes.
     * @param cap
     */
    setStrokeCap(cap: StrokeCap): void {
        this.paint.setStrokeCap(nativeLineCap(cap));
    }

    /**
     * Sets the geometry drawn at the corners of strokes.
     * @param join
     */
    setStrokeJoin(join: StrokeJoin): void {
        this.paint.setStrokeJoin(nativeLineJoin(join));
    }

    /**
     * Sets the limit at which a sharp corner is drawn beveled.
     * @param limit
     */
    setStrokeMiter(limit: number): void {
        this.paint.setStrokeMiter(limit);
    }

    /**
     * Sets the thickness of the pen used to outline the shape.
     * @param width
     */
    setStrokeWidth(width: number): void {
        this.paint.setStrokeWidth(width);
    }

    /**
     * Sets whether the geometry is filled or stroked.
     * @param style
     */
    setStyle(style: PaintStyle): void {
        this.paint.setStrokeStyle(style === PaintStyle.Stroke);
    }
}

const lineCap = (cap: CanvasLineCap) => {
    switch (cap) {
        case "butt":
            return StrokeCap.Butt;
        case "round":
            return StrokeCap.Round;
        case "square":
            return StrokeCap.Square;
        default:
            throw new Error(`Unknown line cap: ${cap}`);
    }
};

const nativeLineCap = (cap: EmbindEnumEntity) => {
    switch (cap.value) {
        case 0:
            return "butt";
        case 1:
            return "round";
        case 2:
            return "square";
        default:
            throw new Error(`Unknown line cap: ${cap.value}`);
    }
};

const lineJoin = (join: string) => {
    switch (join) {
        case "miter":
            return StrokeJoin.Miter;
        case "round":
            return StrokeJoin.Round;
        case "bevel":
            return StrokeJoin.Bevel;
        default:
            throw new Error(`Unknown line cap: ${join}`);
    }
};

const nativeLineJoin = (join: EmbindEnumEntity) => {
    switch (join.value) {
        case 0:
            return "miter";
        case 1:
            return "round";
        case 2:
            return "bevel";
        default:
            throw new Error(`Unknown line cap: ${join.value}`);
    }
};

// const resetCanvasContext = (ctx: CanvasRenderingContext2D) => {
//   ctx.globalAlpha = 1;
//   ctx.globalCompositeOperation = "source-over";
//   ctx.imageSmoothingEnabled = true;
//   ctx.imageSmoothingQuality = "low";
//   ctx.fillStyle = "#000000";
//   ctx.strokeStyle = "#000000";
//   ctx.lineWidth = 1;
//   ctx.lineCap = "butt";
//   ctx.lineJoin = "miter";
//   ctx.miterLimit = 10;
//   ctx.shadowBlur = 0;
//   ctx.shadowColor = "rgba(0, 0, 0, 0)";
//   ctx.shadowOffsetX = 0;
//   ctx.shadowOffsetY = 0;
//   ctx.setTransform(1, 0, 0, 1, 0, 0);
//   ctx.filter = "none";
//   ctx.font = "10px sans-serif";
//   ctx.textAlign = "start";
//   ctx.textBaseline = "alphabetic";
//   ctx.direction = "inherit";
// };
