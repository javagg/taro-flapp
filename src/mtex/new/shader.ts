import { SkEmbindObject } from "../bass";
import type {
    Shader, BlendMode,
    InputColor, ColorSpace, InputFlexibleColorArray, InputMatrix, InputPoint, AngleInDegrees, TileMode
} from "../canvaskit";
import { nativeColor, normalizeInputColorArray } from "./color";

import {
    BlendShader as NativeBlendShader,
    ColorShader as NativeColorShader,
    LinearGradient as NativeLinearGradient,
    SweepGradient as NativeSweepGradient,
    TwoPointConicalGradient as NativeTwoPointConicalGradient,
    ImageShader as NativeImageShader,
} from "./c2d"
import { nativePoint } from "./draw";

export class ShaderJS extends SkEmbindObject<"Shader"> implements Shader {

    /**
  * Returns a shader that combines the given shaders with a BlendMode.
  * @param mode
  * @param one
  * @param two
  */
    static MakeBlend(mode: BlendMode, one: Shader, two: Shader): Shader {
        // no flutter 
        return new BlendShader(mode, one, two);
    }

    /**
     * Returns a shader with a given color and colorspace.
     * @param color
     * @param space
     */
    static MakeColor(color: InputColor, space: ColorSpace): Shader {
        // no flutter 
        return new ColorShader(nativeColor(color));
    }

    /**
     * Returns a shader with Perlin Fractal Noise.
     * See SkPerlinNoiseShader.h for more details
     * @param baseFreqX - base frequency in the X direction; range [0.0, 1.0]
     * @param baseFreqY - base frequency in the Y direction; range [0.0, 1.0]
     * @param octaves
     * @param seed
     * @param tileW - if this and tileH are non-zero, the frequencies will be modified so that the
     *                noise will be tileable for the given size.
     * @param tileH - if this and tileW are non-zero, the frequencies will be modified so that the
     *                noise will be tileable for the given size.
     */
    static MakeFractalNoise(baseFreqX: number, baseFreqY: number, octaves: number, seed: number,
        tileW: number, tileH: number): Shader {
        // no flutter 
        throw new Error("MakeFractalNoise not implemented")
    }

    /**
     * Returns a shader that generates a linear gradient between the two specified points.
     * See SkGradientShader.h for more.
     * @param start
     * @param end
     * @param colors - colors to be distributed between start and end.
     * @param pos - May be null. The relative positions of colors. If supplied must be same length
     *              as colors.
     * @param mode
     * @param localMatrix
     * @param flags - By default gradients will interpolate their colors in unpremul space
     *                and then premultiply each of the results. By setting this to 1, the
     *                gradients will premultiply their colors first, and then interpolate
     *                between them.
     * @param colorSpace
     */
    static MakeLinearGradient(start: InputPoint, end: InputPoint, colors: InputFlexibleColorArray,
        pos: number[] | null, mode: TileMode, localMatrix?: InputMatrix,
        flags?: number, colorSpace?: ColorSpace): Shader {
        return new LinearGradient(start, end, colors, pos);
    }

    /**
     * Returns a shader that generates a radial gradient given the center and radius.
     * See SkGradientShader.h for more.
     * @param center
     * @param radius
     * @param colors - colors to be distributed between the center and edge.
     * @param pos - May be null. The relative positions of colors. If supplied must be same length
     *              as colors. Range [0.0, 1.0]
     * @param mode
     * @param localMatrix
     * @param flags - 0 to interpolate colors in unpremul, 1 to interpolate colors in premul.
     * @param colorSpace
     */
    static MakeRadialGradient(center: InputPoint, radius: number, colors: InputFlexibleColorArray,
        pos: number[] | null, mode: TileMode, localMatrix?: InputMatrix,
        flags?: number, colorSpace?: ColorSpace): Shader {
        return new TwoPointConicalGradient(center, 0, center, radius, colors, pos);
    }

    /**
     * Returns a shader that generates a sweep gradient given a center.
     * See SkGradientShader.h for more.
     * @param cx
     * @param cy
     * @param colors - colors to be distributed around the center, within the provided angles.
     * @param pos - May be null. The relative positions of colors. If supplied must be same length
     *              as colors. Range [0.0, 1.0]
     * @param mode
     * @param localMatrix
     * @param flags - 0 to interpolate colors in unpremul, 1 to interpolate colors in premul.
     * @param startAngle - angle corresponding to 0.0. Defaults to 0 degrees.
     * @param endAngle - angle corresponding to 1.0. Defaults to 360 degrees.
     * @param colorSpace
     */
    static MakeSweepGradient(cx: number, cy: number, colors: InputFlexibleColorArray,
        pos: number[] | null, mode: TileMode, localMatrix?: InputMatrix | null,
        flags?: number, startAngle?: AngleInDegrees, endAngle?: AngleInDegrees,
        colorSpace?: ColorSpace): Shader {
        return new SweepGradient(
            Float32Array.of(cx, cy),
            startAngle ?? 0,
            colors,
            pos
        );
    }

    /**
     * Returns a shader with Perlin Turbulence.
     * See SkPerlinNoiseShader.h for more details
     * @param baseFreqX - base frequency in the X direction; range [0.0, 1.0]
     * @param baseFreqY - base frequency in the Y direction; range [0.0, 1.0]
     * @param octaves
     * @param seed
     * @param tileW - if this and tileH are non-zero, the frequencies will be modified so that the
     *                noise will be tileable for the given size.
     * @param tileH - if this and tileW are non-zero, the frequencies will be modified so that the
     *                noise will be tileable for the given size.
     */
    static MakeTurbulence(baseFreqX: number, baseFreqY: number, octaves: number, seed: number,
        tileW: number, tileH: number): Shader {
        // no flutter
        throw new Error("not implemented")
    }

    /**
     * Returns a shader that generates a conical gradient given two circles.
     * See SkGradientShader.h for more.
     * @param start
     * @param startRadius
     * @param end
     * @param endRadius
     * @param colors
     * @param pos
     * @param mode
     * @param localMatrix
     * @param flags
     * @param colorSpace
     */
    static MakeTwoPointConicalGradient(start: InputPoint, startRadius: number, end: InputPoint,
        endRadius: number, colors: InputFlexibleColorArray,
        pos: number[] | null, mode: TileMode, localMatrix?: InputMatrix,
        flags?: number, colorSpace?: ColorSpace): Shader {
        return new TwoPointConicalGradient(
            start,
            startRadius,
            end,
            endRadius,
            colors,
            pos
        );
    }

    constructor() {
        super("Shader");
    }

    //   getShader() {
    //     return this._shader;
    //   }
}

class BlendShader extends ShaderJS {
    constructor(blendMode: BlendMode, one: Shader, two: Shader) {
        super(
            new NativeBlendShader(
                nativeBlendMode(blendMode),
                child1.getShader(),
                child2.getShader()
            )
        );
    }
}

class LinearGradient extends ShaderJS {
    constructor(
        start: InputPoint,
        end: InputPoint,
        colors: InputFlexibleColorArray,
        pos: number[] | null
    ) {
        super(
            new NativeLinearGradient(
                nativePoint(start),
                nativePoint(end),
                normalizeInputColorArray(colors).map((c) => nativeColor(c)),
                pos ?? undefined
            )
        );
    }
}

class SweepGradient extends ShaderJS {
    constructor(
        c: InputPoint,
        startAngle: number,
        colors: InputFlexibleColorArray,
        pos: number[] | null
    ) {
        super(
            new NativeSweepGradient(
                nativePoint(c),
                startAngle,
                normalizeInputColorArray(colors).map((cl) => nativeColor(cl)),
                pos ?? undefined
            )
        );
    }
}

class ColorShader extends ShaderJS {
    constructor(color: string) {
        super(new NativeColorShader(color));
    }
}

class TwoPointConicalGradient extends ShaderJS {
    constructor(
        c1: InputPoint,
        r1: number,
        c2: InputPoint,
        r2: number,
        colors: InputFlexibleColorArray,
        pos: number[] | null
    ) {
        super(
            new NativeTwoPointConicalGradient(
                nativePoint(c1),
                r1,
                nativePoint(c2),
                r2,
                normalizeInputColorArray(colors).map((c) => nativeColor(c)),
                pos ?? undefined
            )
        );
    }
}

export class ImageShader extends ShaderJS {
    constructor(image: HTMLCanvasElement, localMatrix?: InputMatrix) {
        super(
            new NativeImageShader(
                image,
                localMatrix ? nativeMatrix(localMatrix) : undefined
            )
        );
    }
}