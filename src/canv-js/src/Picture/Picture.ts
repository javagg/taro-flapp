import type {
  FilterMode,
  InputMatrix,
  InputRect,
  Shader,
  SkPicture,
  TileMode,
  Rect,
} from "canvaskit-wasm";

import { HostObject } from "../HostObject";
import type { CanvasRecorder } from "../Canvas/CanvasRecorder";

export class PictureJS extends HostObject<"Picture"> implements SkPicture {
  constructor(readonly canvas: CanvasRecorder) {
    super("Picture");
  }
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
  makeShader(tmx: TileMode, tmy: TileMode, mode: FilterMode,
    localMatrix?: InputMatrix, tileRect?: InputRect): Shader {
    throw new Error("makeShader not implemented.");
  }
  /**
   * Return the bounding area for the Picture.
   * @param outputArray - if provided, the bounding box will be copied into this array instead of
   *                      allocating a new one.
   */
  cullRect(outputArray?: Rect): Rect;

  /**
   * Returns the approximate byte size. Does not include large objects.
   */
  approximateBytesUsed(): number;

  /**
   * Returns the serialized format of this SkPicture. The format may change at anytime and
   * no promises are made for backwards or forward compatibility.
   */
  serialize(): Uint8Array | null {
    throw new Error("Method not implemented.");
  }
}
