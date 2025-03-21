import type {
    Camera,
    InputRect,
    Matrix4x4,
    Matrix4x4Helpers,
    Vector3,
} from "canvaskit-wasm";

/**
 * See SkM44.h for more details.
 */
export const Matrix4: Matrix4x4Helpers = {
    /**
     * Returns a new identity 4x4 matrix.
     */
    identity: function (): number[] {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },

    /**
     * Returns the inverse of the given 4x4 matrix or null if it is not invertible.
     * @param matrix
     */
    invert: function (_matrix: number[] | Float32Array): number[] | null {
        throw new Error("Function not implemented.");
    },

    /**
     * Return a new 4x4 matrix representing a camera at eyeVec, pointed at centerVec.
     * @param eyeVec
     * @param centerVec
     * @param upVec
     */
    lookat: function (
        _eyeVec: Vector3,
        _centerVec: Vector3,
        _upVec: Vector3
    ): number[] {
        throw new Error("Function not implemented.");
    },
    /**
     * Multiplies the provided 4x4 matrices together from left to right.
     * @param matrices
     */
    multiply: function (...matrices: Matrix4x4[]): number[] {
        let result = this.identity();
        for (const m of matrices) {
            const temp = this.identity();
            for (let i = 0; i < 4; ++i) {
                for (let j = 0; j < 4; ++j) {
                    temp[i * 4 + j] = 0;
                    for (let k = 0; k < 4; ++k) {
                        temp[i * 4 + j] += result[i * 4 + k] * m[k * 4 + j];
                    }
                }
            }
            result = temp;
        }
        return result;
    },

    /**
     * Returns the inverse of the given 4x4 matrix or throws if it is not invertible.
     * @param matrix
     */
    mustInvert: function (_matrix: number[] | Float32Array): number[] {
        throw new Error("Function not implemented.");
    },

    /**
     * Returns a new 4x4 matrix representing a perspective.
     * @param near
     * @param far
     * @param radians
     */
    perspective: function (
        _near: number,
        _far: number,
        _radians: number
    ): number[] {
        throw new Error("Function not implemented.");
    },

    /**
     * Returns the value at the specified row and column of the given 4x4 matrix.
     * @param matrix
     * @param row
     * @param col
     */
    rc: function (
        _matrix: number[] | Float32Array,
        _row: number,
        _col: number
    ): number {
        throw new Error("Function not implemented.");
    },

    /**
     * Returns a new 4x4 matrix representing a rotation around the provided vector.
     * @param axis
     * @param radians
     */
    rotated: function (_axisVec: Vector3, _radians: number): number[] {
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a new 4x4 matrix representing a rotation around the provided vector.
     * Rotation is provided redundantly as both sin and cos values.
     * This rotate can be used when you already have the cosAngle and sinAngle values
     * so you don't have to atan(cos/sin) to call roatated() which expects an angle in radians.
     * This does no checking! Behavior for invalid sin or cos values or non-normalized axis vectors
     * is incorrect. Prefer rotated().
     * @param axis
     * @param sinAngle
     * @param cosAngle
     */
    rotatedUnitSinCos: function (
        axisVec: Vector3,
        sinAngle: number,
        cosAngle: number
    ): number[] {
        const x = axisVec[0];
        const y = axisVec[1];
        const z = axisVec[2];
        const c = cosAngle;
        const s = sinAngle;
        const t = 1 - c;
        return [
            t * x * x + c,
            t * x * y - s * z,
            t * x * z + s * y,
            0,
            t * x * y + s * z,
            t * y * y + c,
            t * y * z - s * x,
            0,
            t * x * z - s * y,
            t * y * z + s * x,
            t * z * z + c,
            0,
            0,
            0,
            0,
            1,
        ];
    },

    /**
     * Returns a new 4x4 matrix representing a scale by the provided vector.
     * @param vec
     */
    scaled: function (_vec: Vector3): number[] {
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a new 4x4 matrix that sets up a 3D perspective view from a given camera.
     * @param area - describes the viewport. (0, 0, canvas_width, canvas_height) suggested.
     * @param zScale - describes the scale of the z axis. min(width, height)/2 suggested
     * @param cam
     */
    setupCamera: function (
        _area: InputRect,
        _zScale: number,
        _cam: Camera
    ): number[] {
        throw new Error("Function not implemented.");
    },

    /**
     * Returns a new 4x4 matrix representing a translation by the provided vector.
     * @param vec
     */
    translated: function (_vec: Vector3): number[] {
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a new 4x4 matrix that is the transpose of this 4x4 matrix.
     * @param matrix
     */
    transpose: function (_matrix: number[] | Float32Array): number[] {
        throw new Error("Function not implemented.");
    },
};
