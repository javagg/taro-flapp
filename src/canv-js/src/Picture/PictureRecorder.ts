import type { Canvas, InputRect, PictureRecorder, SkPicture } from "canvaskit-wasm";

import { IndexedHostObject } from "../HostObject";
import { normalizeArray } from "../Core";
import { CanvasRecorder } from "../Canvas/CanvasRecorder";

import { PictureJS } from "./Picture";

export class PictureRecorderJS
  extends IndexedHostObject<"PictureRecorder">
  implements PictureRecorder {
    
  private canvas: CanvasRecorder | null = null;

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
    this.canvas = new CanvasRecorder(normalizeArray(bounds));
    return this.canvas;
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
