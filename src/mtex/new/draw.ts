import type {
    AngleInRadians,
    InputMatrix,
    MallocObj,
    Matrix3x3,
    Matrix3x3Helpers,
    TypedArray,
    TypedArrayConstructor,
    Camera,
    InputRect,
    Matrix4x4,
    Matrix4x4Helpers,
    VectorN,
    VectorHelpers as CKVectorHelpers,
    Vector3,
    InputPoint,
    ColorMatrixHelpers as CKColorMatrixHelpers,
    ColorMatrix,
    InputIRect,
    InputRRect,
    BlendMode,
} from "../canvaskit";
import { vec } from "./utils";

/**
 * This object is a wrapper around a pointer to some memory on the WASM heap. The type of the
 * pointer was determined at creation time.
 */
export class MallocObjJS<T extends TypedArray> implements MallocObj {
    /**
     * The "pointer" into the WASM memory. Should be fixed over the lifetime of the object.
     */
    byteOffset = 0;

    constructor(private arr: T) { }

    /**
     * The number of objects this pointer refers to.
     */
    get length(): number {
        return this.arr.length;
    }

    /**
     * Return a read/write view into a subset of the memory. Do not cache the TypedArray this
     * returns, it may be invalidated if the WASM heap is resized. This is the same as calling
     * .toTypedArray().subarray() except the returned TypedArray can also be passed into an API
     * and not cause an additional copy.
     */
    subarray(start: number, end: number): TypedArray {
        return this.arr.subarray(start, end);
    }

    /**
     * Return a read/write view of the memory. Do not cache the TypedArray this returns, it may be
     * invalidated if the WASM heap is resized. If this TypedArray is passed into a CanvasKit API,
     * it will not be copied again, only the pointer will be re-used.
     */
    toTypedArray(): TypedArray {
        return this.arr;
    }
}

export const isMalloc = (v: unknown): v is MallocObj => {
    return typeof v === "object" && v !== null && "toTypedArray" in v;
};

export const normalizeArray = <T>(
    arr: MallocObj | T | number[],
    Constructor: TypedArrayConstructor = Float32Array
) => {
    if (isMalloc(arr)) {
        return arr.toTypedArray() as T;
    } else if (Array.isArray(arr)) {
        return new Constructor(arr) as T;
    }
    return arr;
};

const toDOMMatrix3x2 = (m3: Float32Array) => {
    const m = new DOMMatrix();
    m.a = m3[0];
    m.b = m3[3];
    m.c = m3[1];
    m.d = m3[4];
    m.e = m3[2];
    m.f = m3[5];
    return m;
};

const toDOMMatrix3 = (m3: Float32Array) => {
    const m = new DOMMatrix();
    m.m11 = m3[0];
    m.m21 = m3[1];
    m.m41 = m3[2];
    m.m12 = m3[3];
    m.m22 = m3[4];
    m.m42 = m3[5];
    m.m14 = m3[6];
    m.m24 = m3[7];
    m.m44 = m3[8];
    return m;
};

const toDOMMatrix4 = (m3: Float32Array) => {
    const m = new DOMMatrix();
    m.m11 = m3[0];
    m.m21 = m3[1];
    m.m31 = m3[2];
    m.m41 = m3[3];

    m.m12 = m3[4];
    m.m22 = m3[5];
    m.m32 = m3[6];
    m.m42 = m3[7];

    m.m13 = m3[8];
    m.m23 = m3[9];
    m.m33 = m3[10];
    m.m43 = m3[11];

    m.m14 = m3[12];
    m.m24 = m3[13];
    m.m34 = m3[14];
    m.m44 = m3[15];
    return m;
};

export const nativeMatrix = (matrix: InputMatrix) => {
    if (matrix instanceof DOMMatrix) {
        return matrix;
    }
    const m3 = normalizeArray(matrix);
    if (m3.length === 6) {
        return toDOMMatrix3x2(m3);
    } else if (m3.length === 9) {
        return toDOMMatrix3(m3);
    } else if (m3.length === 16) {
        return toDOMMatrix4(m3);
    }
    throw new Error("Invalid matrix");
};

export const transformPoint = (matrix: Matrix3x3, ...point: number[]) => {
    const x = matrix[0] * point[0] + matrix[1] * point[1] + matrix[2] * 1;
    const y = matrix[3] * point[0] + matrix[4] * point[1] + matrix[5] * 1;
    const w = matrix[6] * point[0] + matrix[7] * point[1] + matrix[8] * 1;
    return new DOMPoint(x / w, y / w);
};

export const rectToXYWH = (r: InputRect | InputIRect) => {
    const rect = normalizeArray(r);
    return {
        x: rect[0],
        y: rect[1],
        width: rect[2] - rect[0],
        height: rect[3] - rect[1],
    };
};

export interface Radii {
    topLeft: DOMPoint;
    topRight: DOMPoint;
    bottomRight: DOMPoint;
    bottomLeft: DOMPoint;
}

export const rrectToXYWH = (r: InputRRect) => {
    const rect = normalizeArray(r);
    return {
        x: rect[0],
        y: rect[1],
        width: rect[2] - rect[0],
        height: rect[3] - rect[1],
        radii: {
            topLeft: vec(rect[4], rect[5]),
            topRight: vec(rect[6], rect[7]),
            bottomRight: vec(rect[8], rect[9]),
            bottomLeft: vec(rect[10], rect[11]),
        },
    };
};

export const rrectToPath2D = (r: InputRRect) => {
    const rect = normalizeArray(r);
    const path = new Path2D();
    path.roundRect(rect[0], rect[1], rect[2] - rect[0], rect[3] - rect[1], [
        { x: rect[4], y: rect[5] },
        { x: rect[6], y: rect[7] },
        { x: rect[8], y: rect[9] },
        { x: rect[10], y: rect[11] },
    ]);
    return path;
};

export const Matrix3: Matrix3x3Helpers = {

    /**
     * Returns a new identity 3x3 matrix.
     */
    identity(): number[] {
        return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    },

    /**
     * Returns the inverse of the given 3x3 matrix or null if it is not invertible.
     * @param m
     */
    invert(m: Matrix3x3 | number[]): number[] | null {
        const [a, b, c, d, e, f, g, h, i] = m;
        const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
        if (det === 0) {
            return null;
        }
        return [
            (e * i - f * h) / det,
            (c * h - b * i) / det,
            (b * f - c * e) / det,
            (f * g - d * i) / det,
            (a * i - c * g) / det,
            (c * d - a * f) / det,
            (d * h - e * g) / det,
            (b * g - a * h) / det,
            (a * e - b * d) / det,
        ];
    },
    /**
     * Maps the given 2d points according to the given 3x3 matrix.
     * @param m
     * @param points - the flattened points to map; the results are computed in place on this array.
     */
    mapPoints(m: Matrix3x3 | number[], points: number[]): number[] {
        const [a, b, c, d, e, f] = m;
        for (let j = 0; j < points.length; j += 2) {
            const x = points[j],
                y = points[j + 1];
            points[j] = a * x + b * y + c;
            points[j + 1] = d * x + e * y + f;
        }
        return points;
    },
    /**
     * Multiplies the provided 3x3 matrices together from left to right.
     * @param matrices
     */
    multiply(...matrices: Array<(Matrix3x3 | number[])>): number[] {
        let result = this.identity();
        for (const m of matrices) {
            const temp = this.identity();
            for (let i = 0; i < 3; ++i) {
                for (let j = 0; j < 3; ++j) {
                    temp[i * 3 + j] = 0;
                    for (let k = 0; k < 3; ++k) {
                        temp[i * 3 + j] += result[i * 3 + k] * m[k * 3 + j];
                    }
                }
            }
            result = temp;
        }
        return result;
    },

    /**
     * Returns a new 3x3 matrix representing a rotation by n radians.
     * @param radians
     * @param px - the X value to rotate around, defaults to 0.
     * @param py - the Y value to rotate around, defaults to 0.
     */
    rotated(radians: AngleInRadians, px: number = 0, py: number = 0): number[] {
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        return [c, -s, px * (1 - c) + py * s, s, c, py * (1 - c) - px * s, 0, 0, 1];
    },

    /**
     * Returns a new 3x3 matrix representing a scale in the x and y directions.
     * @param sx - the scale in the X direction.
     * @param sy - the scale in the Y direction.
     * @param px - the X value to scale from, defaults to 0.
     * @param py - the Y value to scale from, defaults to 0.
     */
    scaled(sx: number, sy: number, px: number = 0, py: number = 0): number[] {
        return [sx, 0, px * (1 - sx), 0, sy, py * (1 - sy), 0, 0, 1];
    },
    /**
     * Returns a new 3x3 matrix representing a scale in the x and y directions.
     * @param kx - the kurtosis in the X direction.
     * @param ky - the kurtosis in the Y direction.
     * @param px - the X value to skew from, defaults to 0.
     * @param py - the Y value to skew from, defaults to 0.
     */
    skewed(kx: number, ky: number, px: number = 0, py: number = 0): number[] {
        return [1, kx, -px * kx, ky, 1, -py * ky, 0, 0, 1];
    },

    /**
     * Returns a new 3x3 matrix representing a translation in the x and y directions.
     * @param dx
     * @param dy
     */
    translated(dx: number, dy: number): number[] {
        return [1, 0, dx, 0, 1, dy, 0, 0, 1];
    },
};

export const nativeBlendMode = (
    mode: BlendMode
  ): GlobalCompositeOperation => {
    const blendModesMap: Record<number, GlobalCompositeOperation> = {
      0: "copy", // Clear
      1: "copy", // Src
      2: "destination-over", // Dst
      3: "source-over", // SrcOver
      4: "destination-over", // DstOver
      5: "source-in", // SrcIn
      6: "destination-in", // DstIn
      7: "source-out", // SrcOut
      8: "destination-out", // DstOut
      9: "source-atop", // SrcATop
      10: "destination-atop", // DstATop
      11: "xor", // Xor
      12: "lighter", // Plus
      13: "multiply", // Modulate (closest match)
      14: "screen", // Screen
      15: "overlay", // Overlay
      16: "darken", // Darken
      17: "lighten", // Lighten
      18: "color-dodge", // ColorDodge
      19: "color-burn", // ColorBurn
      20: "hard-light", // HardLight
      21: "soft-light", // SoftLight
      22: "difference", // Difference
      23: "exclusion", // Exclusion
      24: "multiply", // Multiply
      25: "hue", // Hue
      26: "saturation", // Saturation
      27: "color", // Color
      28: "luminosity", // Luminosity
    };
    const val = blendModesMap[mode.value];
    if (val === undefined) {
      throw new Error(`Unknown blend mode: ${mode}`);
    }
    return val;
  };

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
    lookat(eyeVec: Vector3, centerVec: Vector3, upVec: Vector3): number[] {
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
    mustInvert: function (matrix: number[] | Float32Array): number[] {
        // throw new Error("Function not implemented.");
        const m = Array.from(matrix);
        const inv = new Array(16);

        inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15]
            + m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];

        inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15]
            - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];

        inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15]
            + m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];

        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14]
            - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];

        inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15]
            - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];

        inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15]
            + m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];

        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15]
            - m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];

        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14]
            + m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];

        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15]
            + m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];

        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15]
            - m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];

        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15]
            + m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];

        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14]
            - m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];

        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11]
            - m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];

        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11]
            + m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];

        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11]
            - m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];

        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10]
            + m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

        let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

        if (det === 0) {
            throw new Error("Matrix is not invertible");
        }

        det = 1.0 / det;
        for (let i = 0; i < 16; i++) {
            inv[i] *= det;
        }

        return inv;
    },

    /**
     * Returns a new 4x4 matrix representing a perspective.
     * @param near
     * @param far
     * @param radians
     */
    perspective(near: number, far: number, radians: AngleInRadians): number[] {
        const f = 1.0 / Math.tan(radians / 2);
        const rangeInv = 1.0 / (near - far);

        return [
            f, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    /**
     * Returns the value at the specified row and column of the given 4x4 matrix.
     * @param matrix
     * @param row
     * @param col
     */
    rc(matrix: Matrix4x4 | number[], row: number, col: number): number {
        if (row < 0 || row > 3 || col < 0 || col > 3) {
            throw new Error("Row and column must be between 0 and 3");
        }
        return matrix[row * 4 + col];
    },

    /**
     * Returns a new 4x4 matrix representing a rotation around the provided vector.
     * @param axis
     * @param radians
     */
    rotated(axis: Vector3, radians: AngleInRadians): number[] {
        const [x, y, z] = axis;
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        const t = 1 - c;
        return [
            t * x * x + c, t * x * y - s * z, t * x * z + s * y, 0,
            t * x * y + s * z, t * y * y + c, t * y * z - s * x, 0,
            t * x * z - s * y, t * y * z + s * x, t * z * z + c, 0,
            0, 0, 0, 1
        ];
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
    scaled: function (vec: Vector3): number[] {
        const [x, y, z] = vec;
        return [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
    },
    /**
     * Returns a new 4x4 matrix that sets up a 3D perspective view from a given camera.
     * @param area - describes the viewport. (0, 0, canvas_width, canvas_height) suggested.
     * @param zScale - describes the scale of the z axis. min(width, height)/2 suggested
     * @param cam
     */
    setupCamera(area: InputRect, zScale: number, cam: Camera): number[] {
        const [width, height] = [area[2] - area[0], area[3] - area[1]];
        const aspect = width / height;
        const fov = cam.fov || Math.PI / 3; // Default to 60 degrees
        const near = cam.near || 0.1;
        const far = cam.far || 1000;

        // Perspective projection matrix
        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1.0 / (near - far);

        const projection = [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];

        // Camera view matrix
        const eye = cam.eye || [0, 0, 5];
        const center = cam.coa || [0, 0, 0];
        const up = cam.up || [0, 1, 0];

        const z = Vector3.normalize(Vector3.subtract(eye, center));
        const x = Vector3.normalize(Vector3.cross(up, z));
        const y = Vector3.cross(z, x);

        const view = [
            x[0], y[0], z[0], 0,
            x[1], y[1], z[1], 0,
            x[2], y[2], z[2], 0,
            -Vector3.dot(x, eye), -Vector3.dot(y, eye), -Vector3.dot(z, eye), 1
        ];

        // Combine projection and view matrices
        return this.multiply(projection, view);
    },

    /**
     * Returns a new 4x4 matrix representing a translation by the provided vector.
     * @param vec
     */
    translated: function (vec: Vector3): number[] {
        const [x, y, z] = vec;
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
    },
    /**
     * Returns a new 4x4 matrix that is the transpose of this 4x4 matrix.
     * @param matrix
     */
    transpose: function (matrix: number[] | Float32Array): number[] {
        const m = Array.from(matrix);
        return [
            m[0], m[4], m[8], m[12],
            m[1], m[5], m[9], m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        ];
    },
};


export const nativePoint = (pt: InputPoint) => new DOMPoint(...pt);

/**
 * Functions for manipulating vectors. It is Loosely based off of SkV3 in SkM44.h but Skia
 * also has SkVec2 and Skv4. This combines them and works on vectors of any length.
 */
export const VectorHelpers: CKVectorHelpers = {
    /**
     * Adds 2 vectors together, term by term, returning a new Vector.
     * @param a
     * @param b
     */
    add: function (a: VectorN, b: VectorN): VectorN {
        return a.map(function (v, i) {
            return v + b[i];
        });
    },

    /**
     * Returns the cross product of the two vectors. Only works for length 3.
     * @param a
     * @param b
     */
    cross: function (a: Vector3, b: Vector3): Vector3 {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0],
        ];
    },
    /**
     * Returns the length(sub(a, b))
     * @param a
     * @param b
     */
    dist: function (a: VectorN, b: VectorN): number {
        return this.length(this.sub(a, b));
    },
    /**
     * Returns the dot product of the two vectors.
     * @param a
     * @param b
     */
    dot: function (a: VectorN, b: VectorN): number {
        return a
            .map(function (v, i) {
                return v * b[i];
            })
            .reduce(function (acc, cur) {
                return acc + cur;
            });
    },
    /**
     * Returns the length of this vector, which is always positive.
     * @param v
     */
    length: function (v: VectorN): number {
        return Math.sqrt(this.lengthSquared(v));
    },
    /**
     * Returns the length squared of this vector.
     * @param v
     */
    lengthSquared: function (v: VectorN) {
        return this.dot(v, v);
    },
    /**
     * Returns a new vector which is v multiplied by the scalar s.
     * @param v
     * @param s
     */
    mulScalar: (v: VectorN, s: number) => v.map((i) => i * s),
    /**
     * Returns a normalized vector.
     * @param v
     */
    normalize: function (v: VectorN) {
        return this.mulScalar(v, 1 / this.length(v));
    },

    /**
     * Subtracts vector b from vector a (termwise).
     * @param a
     * @param b
     */
    sub: (a: VectorN, b: VectorN) => a.map((v, i) => v - b[i]),
};


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
