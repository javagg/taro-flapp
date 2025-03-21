import type {
    MallocObj,
    TypedArray,
    TypedArrayConstructor,
} from "canvaskit-wasm";

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
     * The number of objects this pointer refers to.
     */

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
