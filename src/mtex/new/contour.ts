import { SkEmbindObject } from "../bass";
import type { ContourMeasure, ContourMeasureIter, Path, PosTan } from "../canvaskit";
import { Contour } from "./c2d";
import { PathJS } from "./path";

export class ContourMeasureJS
    extends SkEmbindObject<"ContourMeasure">
    implements ContourMeasure {
    constructor(
        private readonly contour: Contour,
        _forceClosed: boolean,
        _resScale: number
    ) {
        super("ContourMeasure");
    }

    /**
     * Returns the given position and tangent line for the distance on the given contour.
     * The return value is 4 floats in this order: posX, posY, vecX, vecY.
     * @param distance - will be pinned between 0 and length().
     * @param output - if provided, the four floats of the PosTan will be copied into this array
     *                 instead of allocating a new one.
     */
    getPosTan(distance: number, output?: PosTan): PosTan {
        const result = this.contour.getPosTanAtLength(distance);
        output[0] = result[0].x;
        output[1] = result[0].y;
        output[2] = result[1].x;
        output[3] = result[1].y;
        return output;
    }

    /**
     * Returns an Path representing the segement of this contour.
     * @param startD - will be pinned between 0 and length()
     * @param stopD - will be pinned between 0 and length()
     * @param startWithMoveTo
     */
    getSegment(startD: number, stopD: number, startWithMoveTo: boolean): Path {
        const result = new PathJS();
        const contour = this.contour.getSegment(startD, stopD);
        result.getPath().contours.push(contour);
        return result;
    }

    /**
     * Returns true if the contour is closed.
     */
    isClosed(): boolean {
        return this.contour.closed;
    }

    /**
     * Returns the length of this contour.
     */
    length(): number {
        return this.contour.length();
    }
}

export class ContourMeasureIterJS extends SkEmbindObject<"ContourMeasureIter"> implements ContourMeasureIter {

    private index = 0;

    constructor(
        private readonly path: Path,
        private readonly forceClosed: boolean,
        private readonly resScale: number
    ) {
        super("ContourMeasureIter");
    }

    /**
     *  Iterates through contours in path, returning a contour-measure object for each contour
     *  in the path. Returns null when it is done.
     *
     *  See SkContourMeasure.h for more details.
     */
    next(): ContourMeasure | null {
        const { path, forceClosed, resScale } = this;
        const contour = path.getPath().contours[this.index++];
        if (!contour) {
            return null;
        }
        return new ContourMeasureJS(contour, forceClosed, resScale);
    }
}
