import { SkEmbindObject } from "../bass";
import { ColorFilter, ColorFilterFactory as CKColorFilterFactory,
    Color,
    InputFlexibleColorArray,
    InputColor, BlendMode, ColorSpace, InputColorMatrix } from "../canvaskit";
import { normalizeArray } from "./draw";

import { saturate } from "./math";

/* eslint-disable no-bitwise */
export const color = (r: number, g: number, b: number, a = 1) =>
    new Float32Array([r / 255, g / 255, b / 255, a]);

export const color4f = (
    r: number,
    g: number,
    b: number,
    a?: number | undefined
) => Float32Array.of(r, g, b, a ?? 1);

const clampColorComp = (c: number) => {
    return Math.round(Math.max(0, Math.min(c || 0, 255)));
};

export const colorAsInt = (r: number, g: number, b: number, a = 1) => {
    // default to opaque
    if (a === undefined) {
        a = 255;
    }
    // This is consistent with how Skia represents colors in C++, as an unsigned int.
    // This is also consistent with how Flutter represents colors:
    return (
        ((clampColorComp(a) << 24) |
            (clampColorComp(r) << 16) |
            (clampColorComp(g) << 8) |
            ((clampColorComp(b) << 0) & 0xfffffff)) >>>
        0
    ); // This makes the value an unsigned int.
};

export const getColorComponents = (cl: Float32Array) => [
    Math.floor(cl[0] * 255),
    Math.floor(cl[1] * 255),
    Math.floor(cl[2] * 255),
    cl[3],
];

export const multiplyByAlpha = (c: Float32Array, alpha: number) =>
    color4f(c[0], c[1], c[2], c[3] * alpha);

// TODO: a color space
export const nativeColor = (inputColor: InputColor) => {
    const cl = normalizeArray(inputColor);
    return `rgba(${[
        Math.round(cl[0] * 255),
        Math.round(cl[1] * 255),
        Math.round(cl[2] * 255),
        cl[3],
    ].join(", ")})`;
};

export const normalizeInputColorArray = (input: InputFlexibleColorArray) => {
    if (input instanceof Float32Array || input instanceof Uint32Array) {
        const colors: Color[] = [];
        for (let i = 0; i < input.length; i += 4) {
            const result = input.subarray(i, i + 4);
            if (result instanceof Float32Array) {
                colors.push(result);
            } else {
                colors.push(
                    ...Array.from(result).map((c) => uIntColorToCanvasKitColor(c))
                );
            }
        }
        return colors;
    } else {
        return input;
    }
};

export const uIntColorToCanvasKitColor = (c: number) => {
    return Float32Array.of(
        (c >> 16) & 0xff,
        (c >> 8) & 0xff,
        (c >> 0) & 0xff,
        ((c >> 24) & 0xff) / 255
    );
};

export const intAsColor = (colorInt: number) => {
    let a = (colorInt >>> 24) & 255;
    let r = (colorInt >>> 16) & 255;
    let g = (colorInt >>> 8) & 255;
    let b = (colorInt >>> 0) & 255;

    a = saturate(a / 255);
    r = saturate(r / 255);
    g = saturate(g / 255);
    b = saturate(b / 255);

    return Float32Array.of(r, g, b, a);
};


export const ColorFilterFactory: CKColorFilterFactory = {
    /**
     * Makes a color filter with the given color, blend mode, and colorSpace.
     * @param color
     * @param mode
     * @param colorSpace - If omitted, will use SRGB
     */
    MakeBlend(color: InputColor, mode: BlendMode, colorSpace?: ColorSpace): ColorFilter {
        throw new Error("Function not implemented.");
    },


    /**
     * Makes a color filter composing two color filters.
     * @param outer
     * @param inner
     */
    MakeCompose(outer: ColorFilter, inner: ColorFilter): ColorFilter {
        throw new Error("MakeCompose not implemented.");
    },

    /**
     * Makes a color filter that is linearly interpolated between two other color filters.
     * @param t - a float in the range of 0.0 to 1.0.
     * @param dst
     * @param src
     */
    MakeLerp(t: number, dst: ColorFilter, src: ColorFilter): ColorFilter {
        throw new Error("Function not implemented.");
    },

    /**
     * Makes a color filter that converts between linear colors and sRGB colors.
     */
    MakeLinearToSRGBGamma(): ColorFilter {
        throw new Error("Function not implemented.");
    },

    MakeMatrix: function (cMatrix: InputColorMatrix): ColorFilter {
        throw new Error("Function not implemented.");
        // return new MatrixColorFilter(normalizeArray(cMatrix));
    },

    /**
     * Makes a color filter that converts between sRGB colors and linear colors.
     */
    MakeSRGBToLinearGamma(): ColorFilter {
        throw new Error("Function not implemented.");
    },
    /**
     * Makes a color filter that multiplies the luma of its input into the alpha channel,
     * and sets the red, green, and blue channels to zero.
     */
    MakeLuma(): ColorFilter {
        throw new Error("Function not implemented.");
    },
};

export class ColorSpaceJS extends SkEmbindObject<"ColorSpace">  implements ColorSpace {
 
    constructor(public readonly value: "srgb" | "display-p3" | "adobe-rgb") {
        super("ColorSpace");
    }

    // getNativeValue() {
    //     if (this.value === "adobe-rgb") {
    //         console.warn(
    //             "adobe_rgb is not supported on the web, falling back to srgb"
    //         );
    //         return "srgb";
    //     } else {
    //         return this.value;
    //     }
    // }
}
