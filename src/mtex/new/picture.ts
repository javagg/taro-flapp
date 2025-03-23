import type {
    FilterMode,
    InputMatrix,
    InputRect,
    Shader,
    SkPicture,
    TileMode,
    Rect,
    PictureRecorder,
    Canvas,
} from "../canvaskit";
import { SkEmbindObject } from "../bass";

export class PictureJS extends SkEmbindObject<"SkPicture"> implements SkPicture {
    // constructor(readonly canvas: CanvasRecorder) {
    //   super("Picture");
    // }
    /**
     *  Returns a new shader that will draw with this picture.
     *
     *  @param tmx  The tiling mode to use when sampling in the x-direction.
     *  @param tmy  The tiling mode to use when sampling in the y-direction.
     *  @param mode How to filter the tiles
     *  @param localMatrix Optional matrix used when sampling
     *  @param tileRect The tile rectangle in picture coordinates: this represents the subset
     *              (or superset) of the picture used when building a tile. It is not
     *              affected by localMatrix and does not imply scaling (only translation
     *              and cropping). If null, the tile rect is considered equal to the picture
     *              bounds.
     */
    makeShader(tmx: TileMode, tmy: TileMode, mode: FilterMode, localMatrix?: InputMatrix, tileRect?: InputRect): Shader {
        // no flutter
        throw new Error("makeShader not implemented.");
    }
    /**
     * Return the bounding area for the Picture.
     * @param outputArray - if provided, the bounding box will be copied into this array instead of
     *                      allocating a new one.
     */
    cullRect(outputArray?: Rect): Rect {
        throw new Error("makeShader not implemented.");
    }

    /**
     * Returns the approximate byte size. Does not include large objects.
     */
    approximateBytesUsed(): number {
        throw new Error("makeShader not implemented.");
    }

    /**
     * Returns the serialized format of this SkPicture. The format may change at anytime and
     * no promises are made for backwards or forward compatibility.
     */
    serialize(): Uint8Array | null {
        // no flutter
        throw new Error("Method not implemented.");
    }
}

export class PictureRecorderJS extends SkEmbindObject<"PictureRecorder"> implements PictureRecorder {

    // private canvas: CanvasRecorder | null = null;

    constructor() { super("PictureRecorder") }
    /**
   * Returns a canvas on which to draw. When done drawing, call finishRecordingAsPicture()
   *
   * @param bounds - a rect to cull the results.
   * @param computeBounds - Optional boolean (default false) which tells the
   *                        recorder to compute a more accurate bounds for the
   *                        cullRect of the picture.
   */
    beginRecording(bounds: InputRect, computeBounds?: boolean): Canvas {
        throw new Error("beginRecording not implemented.");
        // this.canvas = new CanvasRecorder(normalizeArray(bounds));
        // return this.canvas;
    }

    /**
   * Returns the captured draw commands as a picture and invalidates the canvas returned earlier.
   */
    finishRecordingAsPicture(): SkPicture {
        if (!this.canvas) {
            throw new Error(
                "CanvasRecorder not initialized. Call beginRecording first."
            );
        }
        return new PictureJS(this.canvas);
    }
}