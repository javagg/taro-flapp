import type {
    ColorFilterFactory as CKColorFilterFactory,
    ColorFilter,
    ColorSpace,
    InputColor,
    InputColorMatrix, BlendMode
} from "canvaskit-wasm";

import { normalizeArray } from "../Core";

import { MatrixColorFilter } from "./MatrixColorFilter";

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
        return new MatrixColorFilter(normalizeArray(cMatrix));
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
