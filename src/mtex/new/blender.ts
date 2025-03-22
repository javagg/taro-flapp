import { SkEmbindObject } from "../bass";
import { Blender, BlendMode } from "../canvaskit";

export class BlenderJs extends SkEmbindObject<"Blender"> {
    /**
 * Create a blender that implements the specified BlendMode.
 * @param mode
 */
    static Mode(mode: BlendMode): Blender {
        return new Error("not implemented") as any;
    }
}