import type {
    VectorN,
    VectorHelpers as CKVectorHelpers,
    Vector3,
    InputPoint,
} from "canvaskit-wasm";

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
