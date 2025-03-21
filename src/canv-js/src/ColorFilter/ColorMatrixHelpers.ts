import type { ColorMatrixHelpers as CKColorMatrixHelpers, ColorMatrix } from "canvaskit-wasm";

export const ColorMatrixHelpers: CKColorMatrixHelpers = {
    /**
     * Returns a new ColorMatrix that is the result of multiplying outer*inner
     * @param outer
     * @param inner
     */
    concat: function (_outer: ColorMatrix, _inner: ColorMatrix): ColorMatrix {
        throw new Error("Function not implemented.");
    },

    /**
     * Returns an identity ColorMatrix.
     */
    identity: function (): ColorMatrix {
        throw new Error("Function not implemented.");
    },
    /**
     * Sets the 4 "special" params that will translate the colors after they are multiplied
     * by the 4x4 matrix.
     * @param m
     * @param dr - delta red
     * @param dg - delta green
     * @param db - delta blue
     * @param da - delta alpha
     */
    postTranslate(m: ColorMatrix, dr: number, dg: number, db: number, da: number): ColorMatrix {
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a new ColorMatrix that is rotated around a given axis.
     * @param axis - 0 for red, 1 for green, 2 for blue
     * @param sine - sin(angle)
     * @param cosine - cos(angle)
     */
    rotated(axis: number, sine: number, cosine: number): ColorMatrix {
        throw new Error("Function not implemented.");
    },

    /**
     * Returns a new ColorMatrix that scales the colors as specified.
     * @param redScale
     * @param greenScale
     * @param blueScale
     * @param alphaScale
     */
    scaled(redScale: number, greenScale: number, blueScale: number,
        alphaScale: number): ColorMatrix {
        throw new Error("Function not implemented.");
    },
};
