import { relative } from "path";
import { SkEmbindObject } from "../bass";
import {
    AngleInDegrees, AngleInRadians,
    FillType, InputCommands, InputFlattenedPointArray, InputRect,
    InputRRect, Path, PathOp, Point, Rect, StrokeOpts, VerbList, WeightList,
    PathEffectFactory as CKPathEffectFactory,
    PathEffect,
    InputMatrix,
    Path1DEffectStyle
} from "../canvaskit";
import { normalizeArray, rectToXYWH, rrectToXYWH, transformPoint } from "./draw";
import { toRad } from "./math";
import { vec,
    Path as NativePath,
    PathBuilder
 } from "./c2d";

/**
 * See SkPath.h for more information on this class.
 */
export class PathJS extends SkEmbindObject<"Path"> implements Path {

    /**
     * Returns true if the two paths contain equal verbs and equal weights.
     * @param path1 first path to compate
     * @param path2 second path to compare
     * @return      true if Path can be interpolated equivalent
     */
    static CanInterpolate(path1: Path, path2: Path): boolean {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a new path from the given list of path commands. If this fails, null will be
     * returned instead.
     * @param cmds
     */
    static MakeFromCmds(cmds: InputCommands): Path | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a new path by combining the given paths according to op. If this fails, null will
     * be returned instead.
     * @param one
     * @param two
     * @param op
     */
    static MakeFromOp(one: Path, two: Path, op: PathOp): Path | null {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
     * Interpolates between Path with point array of equal size.
     * Copy verb array and weights to result, and set result path to a weighted
     * average of this path array and ending path.
     *
     *  weight is most useful when between zero (ending path) and
     *  one (this path); will work with values outside of this
     *  range.
     *
     * interpolate() returns undefined if path is not
     * the same size as ending path. Call isInterpolatable() to check Path
     * compatibility prior to calling interpolate().
     *
     * @param start path to interpolate from
     * @param end  path to interpolate with
     * @param weight  contribution of this path, and
     *                 one minus contribution of ending path
     * @return        Path replaced by interpolated averages or null if
     *                not interpolatable
     */
    static MakeFromPathInterpolation(start: Path, end: Path, weight: number): Path | null {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a new path from the provided SVG string. If this fails, null will be
     * returned instead.
     * @param str
     */
    static MakeFromSVGString(str: string): Path | null {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a new path using the provided verbs and associated points and weights. The process
     * reads the first verb from verbs and then the appropriate number of points from the
     * FlattenedPointArray (e.g. 2 points for moveTo, 4 points for quadTo, etc). If the verb is
     * a conic, a weight will be read from the WeightList.
     * If the data is malformed (e.g. not enough points), the resulting path will be incomplete.
     * @param verbs - the verbs that create this path, in the order of being drawn.
     * @param points - represents n points with 2n floats.
     * @param weights - used if any of the verbs are conics, can be omitted otherwise.
     */
    static MakeFromVerbsPointsWeights(verbs: VerbList, points: InputFlattenedPointArray,
        weights?: WeightList): Path {
        // no flutter
        throw new Error("Method not implemented.");
    }

    private path: PathBuilder;
    private fillType: CanvasFillRule = "nonzero";

    constructor(path?: PathBuilder) {
        super("Path");
        this.path = path ?? new PathBuilder();
    }

    private swap(path: NativePath) {
        this.path = new PathBuilder(path);
        return this;
    }

    getPath() {
        return this.path.getPath();
    }

    /**
     * Appends arc to Path, as the start of new contour. Arc added is part of ellipse
     * bounded by oval, from startAngle through sweepAngle. Both startAngle and
     * sweepAngle are measured in degrees, where zero degrees is aligned with the
     * positive x-axis, and positive sweeps extends arc clockwise.
     * Returns the modified path for easier chaining.
     * @param oval
     * @param startAngle
     * @param sweepAngle
     */
    addArc(oval: InputRect, startAngle: AngleInDegrees, sweepAngle: AngleInDegrees): Path {
        this.path.addArc(
            rectToXYWH(oval),
            toRad(startAngle),
            toRad(sweepAngle),
            false
        );
        return this;
    }

    /**
     * Adds circle centered at (x, y) of size radius to the path.
     * Has no effect if radius is zero or negative.
     *
     * @param x       center of circle
     * @param y       center of circle
     * @param radius  distance from center to edge
     * @param isCCW - if the path should be drawn counter-clockwise or not
     * @return        reference to SkPath
     */
    addCircle(x: number, y: number, r: number, isCCW?: boolean): Path {
        this.addOval([x - r, y - r, x + r, y + r], isCCW);
        return this;
    }

    /**
     * Adds oval to Path, appending kMove_Verb, four kConic_Verb, and kClose_Verb.
     * Oval is upright ellipse bounded by Rect oval with radii equal to half oval width
     * and half oval height. Oval begins at start and continues clockwise by default.
     * Returns the modified path for easier chaining.
     * @param oval
     * @param isCCW - if the path should be drawn counter-clockwise or not
     * @param startIndex - index of initial point of ellipse
     */
    addOval(oval: InputRect, isCCW?: boolean, startIndex?: number): Path {
        this.path.addOval(rectToXYWH(oval));
        return this;
    }

    /**
     * Takes 1, 2, 7, or 10 required args, where the first arg is always the path.
     * The last arg is an optional boolean and chooses between add or extend mode.
     * The options for the remaining args are:
     *   - an array of 6 or 9 parameters (perspective is optional)
     *   - the 9 parameters of a full matrix or
     *     the 6 non-perspective params of a matrix.
     * Returns the modified path for easier chaining (or null if params were incorrect).
     * @param args
     */
    addPath(...args: any[]): Path | null {
        this.path.addPath(newPath.path.getPath());
        return this;
    }

    /**
     * Adds contour created from array of n points, adding (count - 1) line segments.
     * Contour added starts at pts[0], then adds a line for every additional point
     * in pts array. If close is true, appends kClose_Verb to Path, connecting
     * pts[count - 1] and pts[0].
     * Returns the modified path for easier chaining.
     * @param points
     * @param close - if true, will add a line connecting last point to the first point.
     */
    addPoly(points: InputFlattenedPointArray, close: boolean): Path {
        const _points = normalizeArray(points);
        _points.forEach((x, index) => {
            const y = _points[index + 1];
            if (index === 0) {
                // TODO: only inject move if needed
                this.path.moveTo(vec(x, y));
            }
            if (index % 2 === 0) {
                this.path.lineTo(vec(x, y));
            }
        });
        if (close) {
            this.path.close();
        }
        return this;
    }

    /**
     * Adds Rect to Path, appending kMove_Verb, three kLine_Verb, and kClose_Verb,
     * starting with top-left corner of Rect; followed by top-right, bottom-right,
     * and bottom-left if isCCW is false; or followed by bottom-left,
     * bottom-right, and top-right if isCCW is true.
     * Returns the modified path for easier chaining.
     * @param rect
     * @param isCCW
     */
    addRect(rect: InputRect, isCCW?: boolean): Path {
        this.path.addRect(rectToXYWH(rect));
        return this;
    }

    /**
     * Adds rrect to Path, creating a new closed contour.
     * Returns the modified path for easier chaining.
     * @param rrect
     * @param isCCW
     */
    addRRect(rrect: InputRRect, isCCW?: boolean): Path {
        const _rrect = rrectToXYWH(rrect);
        this.path.addRoundedRect(_rrect, _rrect.radii);
        return this;
    }

    /**
     * Adds the given verbs and associated points/weights to the path. The process
     * reads the first verb from verbs and then the appropriate number of points from the
     * FlattenedPointArray (e.g. 2 points for moveTo, 4 points for quadTo, etc). If the verb is
     * a conic, a weight will be read from the WeightList.
     * Returns the modified path for easier chaining
     * @param verbs - the verbs that create this path, in the order of being drawn.
     * @param points - represents n points with 2n floats.
     * @param weights - used if any of the verbs are conics, can be omitted otherwise.
     */
    addVerbsPointsWeights(verbs: VerbList, points: InputFlattenedPointArray,
        weights?: WeightList): Path {
        // no flutter
        throw new Error("Method not implemented.");
    }


    /**
     * Adds an arc to this path, emulating the Canvas2D behavior.
     * Returns the modified path for easier chaining.
     * @param x
     * @param y
     * @param radius
     * @param startAngle
     * @param endAngle
     * @param isCCW
     */
    arc(x: number, y: number, radius: number, startAngle: AngleInRadians, endAngle: AngleInRadians,
        isCCW?: boolean): Path {
        throw new Error("Method not implemented.");
    }

    /**
     * Appends arc to Path. Arc added is part of ellipse
     * bounded by oval, from startAngle through sweepAngle. Both startAngle and
     * sweepAngle are measured in degrees, where zero degrees is aligned with the
     * positive x-axis, and positive sweeps extends arc clockwise.
     * Returns the modified path for easier chaining.
     * @param oval
     * @param startAngle
     * @param endAngle
     * @param forceMoveTo
     */
    arcToOval(oval: InputRect, startAngle: AngleInDegrees, endAngle: AngleInDegrees,
        forceMoveTo: boolean): Path {
        throw new Error("Method not implemented.");
    }

    /**
     * Appends arc to Path. Arc is implemented by one or more conics weighted to
     * describe part of oval with radii (rx, ry) rotated by xAxisRotate degrees. Arc
     * curves from last Path Point to (x, y), choosing one of four possible routes:
     * clockwise or counterclockwise, and smaller or larger. See SkPath.h for more details.
     * Returns the modified path for easier chaining.
     * @param rx
     * @param ry
     * @param xAxisRotate
     * @param useSmallArc
     * @param isCCW
     * @param x
     * @param y
     */
    arcToRotated(rx: number, ry: number, xAxisRotate: AngleInDegrees, useSmallArc: boolean,
        isCCW: boolean, x: number, y: number): Path {
        throw new Error("Method not implemented.");
    }

    /**
     * Appends arc to Path, after appending line if needed. Arc is implemented by conic
     * weighted to describe part of circle. Arc is contained by tangent from
     * last Path point to (x1, y1), and tangent from (x1, y1) to (x2, y2). Arc
     * is part of circle sized to radius, positioned so it touches both tangent lines.
     * Returns the modified path for easier chaining.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param radius
     */
    arcToTangent(x1: number, y1: number, x2: number, y2: number, radius: number): Path {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
     * Appends CLOSE_VERB to Path. A closed contour connects the first and last point
     * with a line, forming a continuous loop.
     * Returns the modified path for easier chaining.
     */
    close(): Path {
        this.path.close();
        return this;
    }

    /**
     * Returns minimum and maximum axes values of the lines and curves in Path.
     * Returns (0, 0, 0, 0) if Path contains no points.
     * Returned bounds width and height may be larger or smaller than area affected
     * when Path is drawn.
     *
     * Behaves identically to getBounds() when Path contains
     * only lines. If Path contains curves, computed bounds includes
     * the maximum extent of the quad, conic, or cubic; is slower than getBounds();
     * and unlike getBounds(), does not cache the result.
     * @param outputArray - if provided, the bounding box will be copied into this array instead of
     *                      allocating a new one.
     */
    computeTightBounds(outputArray?: Rect): Rect {
        // no flutter
        const result = outputArray ?? new Float32Array(4);
        this.path.getPath().computeTightBounds(result);
        return result;
    }

    /**
     * Adds conic from last point towards (x1, y1), to (x2, y2), weighted by w.
     * If Path is empty, or path is closed, the last point is set to (0, 0)
     * before adding conic.
     * Returns the modified path for easier chaining.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @param w
     */
    conicTo(x1: number, y1: number, x2: number, y2: number, w: number): Path {
        this.path.conicTo(vec(x1, y1), vec(x2, y2), w);
        return this;
    }



    /**
     * Returns true if the point (x, y) is contained by Path, taking into
     * account FillType.
     * @param x
     * @param y
     */
    contains(x: number, y: number): boolean {
        const offscreen = new OffscreenCanvas(1, 1);
        const ctx = offscreen.getContext("2d")!;
        const path = this.getPath2D();
        const result = ctx.isPointInPath(path, x, y);
        return result;
    }


    /**
     * Returns a copy of this Path.
     */
    copy(): Path {
        return PathJS.MakeFromCmds(this.toCmds())!;
    }


    /**
     * Returns the number of points in this path. Initially zero.
     */
    countPoints(): number {
        // no flutter
        return this.path.getPath().getPoints().length;
    }
    /**
     *  Adds cubic from last point towards (x1, y1), then towards (x2, y2), ending at
     * (x3, y3). If Path is empty, or path is closed, the last point is set to
     * (0, 0) before adding cubic.
     * @param cpx1
     * @param cpy1
     * @param cpx2
     * @param cpy2
     * @param x
     * @param y
     */
    cubicTo(cpx1: number, cpy1: number, cpx2: number, cpy2: number, x: number, y: number): Path {
        this.path.cubicCurveTo(
            vec(cpx1, cpy1),
            vec(cpx2, cpy2),
            vec(x, y),
            relative
        );
        return this;
    }

    /**
     * Changes this path to be the dashed version of itself. This is the same effect as creating
     * a DashPathEffect and calling filterPath on this path.
     * @param on
     * @param off
     * @param phase
     */
    dash(on: number, off: number, phase: number): boolean {
        // no flutter
        const pe = new DashPathEffect(on, off, phase);
        this.swap(pe.filterPath(this.path.getPath()));
        return true;
    }

    /**
     * Returns true if other path is equal to this path.
     * @param other
     */
    equals(other: Path): boolean {
        throw new Error("Method not implemented.");
    }


    /**
     * Returns minimum and maximum axes values of Point array.
     * Returns (0, 0, 0, 0) if Path contains no points. Returned bounds width and height may
     * be larger or smaller than area affected when Path is drawn.
     * @param outputArray - if provided, the bounding box will be copied into this array instead of
     *                      allocating a new one.
     */
    getBounds(outputArray?: Rect): Rect {
        const result = outputArray ?? new Float32Array(4);
        calculateBounds(this.path.getPath().getPoints(), result);
        return result;
    }

    getNativeFillType() {
        return this.fillType;
    }

    /**
     * Return the FillType for this path.
     */
    getFillType(): FillType {
        if (this.fillType === "evenodd") {
            return FillType.EvenOdd;
        }
        return FillType.Winding;
    }

    /**
     * Returns the Point at index in Point array. Valid range for index is
     * 0 to countPoints() - 1.
     * @param index
     * @param outputArray - if provided, the point will be copied into this array instead of
     *                      allocating a new one.
     */
    getPoint(index: number, outputArray?: Point): Point {
        const result = outputArray ?? new Float32Array(2);
        const point = this.path.getPath().getPoints()[index];
        result[0] = point.x;
        result[1] = point.y;
        return result;
    }


    /**
     * Returns true if there are no verbs in the path.
     */
    isEmpty(): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns true if the path is volatile; it will not be altered or discarded
     * by the caller after it is drawn. Path by default have volatile set false, allowing
     * Surface to attach a cache of data which speeds repeated drawing. If true, Surface
     * may not speed repeated drawing.
     */
    isVolatile(): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Adds line from last point to (x, y). If Path is empty, or last path is closed,
     * last point is set to (0, 0) before adding line.
     * Returns the modified path for easier chaining.
     * @param x
     * @param y
     */
    lineTo(x: number, y: number): Path {
        this.path.lineTo(vec(x, y), relative);
        return this;
    }

    /**
     * Returns a new path that covers the same area as the original path, but with the
     * Winding FillType. This may re-draw some contours in the path as counter-clockwise
     * instead of clockwise to achieve that effect. If such a transformation cannot
     * be done, null is returned.
     */
    makeAsWinding(): Path | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Adds beginning of contour at the given point.
     * Returns the modified path for easier chaining.
     * @param x
     * @param y
     */
    moveTo(x: number, y: number): Path {
        this.path.moveTo(vec(x, y), relative);
        return this;
    }


    /**
     * Translates all the points in the path by dx, dy.
     * Returns the modified path for easier chaining.
     * @param dx
     * @param dy
     */
    offset(dx: number, dy: number): Path {
        return this.transform([1, 0, dx, 0, 1, dy, 0, 0, 1]);
    }


    /**
     * Combines this path with the other path using the given PathOp. Returns false if the operation
     * fails.
     * @param other
     * @param op
     */
    op(other: Path, op: PathOp): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Adds quad from last point towards (x1, y1), to (x2, y2).
     * If Path is empty, or path is closed, last point is set to (0, 0) before adding quad.
     * Returns the modified path for easier chaining.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     */
    quadTo(x1: number, y1: number, x2: number, y2: number): Path {
        this.path.quadraticCurveTo(vec(x1, y1), vec(x2, y2), relative);
        return this;
    }

    /**
     * Relative version of arcToRotated.
     * @param rx
     * @param ry
     * @param xAxisRotate
     * @param useSmallArc
     * @param isCCW
     * @param dx
     * @param dy
     */
    rArcTo(rx: number, ry: number, xAxisRotate: AngleInDegrees, useSmallArc: boolean,
        isCCW: boolean, dx: number, dy: number): Path {
        throw new Error("Method not implemented.");
    }


    /**
     * Relative version of conicTo.
     * @param dx1
     * @param dy1
     * @param dx2
     * @param dy2
     * @param w
     */
    rConicTo(dx1: number, dy1: number, dx2: number, dy2: number, w: number): Path {
        throw new Error("Method not implemented.");
    }

    /**
     * Relative version of cubicTo.
     * @param cpx1
     * @param cpy1
     * @param cpx2
     * @param cpy2
     * @param x
     * @param y
     */
    rCubicTo(cpx1: number, cpy1: number, cpx2: number, cpy2: number, x: number, y: number): Path {
        this.cubicTo(cpx1, cpy1, cpx2, cpy2, x, y, true);
        return this;
    }

    /**
     * Sets Path to its initial state.
     * Removes verb array, point array, and weights, and sets FillType to Winding.
     * Internal storage associated with Path is released
     */
    reset(): void {
        this.path = new PathBuilder();
        this.fillType = "nonzero";
    }


    /**
     * Sets Path to its initial state.
     * Removes verb array, point array, and weights, and sets FillType to Winding.
     * Internal storage associated with Path is *not* released.
     * Use rewind() instead of reset() if Path storage will be reused and performance
     * is critical.
     */
    rewind(): void {
        this.reset();
    }
    /**
     * Relative version of lineTo.
     * @param x
     * @param y
     */
    rLineTo(x: number, y: number): Path {
        this.path.lineTo(vec(x, y), true);
        return this;
    }
    /**
     * Relative version of moveTo.
     * @param x
     * @param y
     */
    rMoveTo(x: number, y: number): Path {
        this.path.moveTo(vec(x, y), true);
        return this;

    }


    /**
     * Relative version of quadTo.
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     */
    rQuadTo(x1: number, y1: number, x2: number, y2: number): Path {
        this.path.quadraticCurveTo(vec(x1, y1), vec(x2, y2), true);
        return this;
    }

    /**
     * Sets FillType, the rule used to fill Path.
     * @param fill
     */
    setFillType(fill: FillType): void {
        if (fill.value === FillTypeEnum.EvenOdd) {
            this.fillType = "evenodd";
        } else {
            this.fillType = "nonzero";
        }
    }
    /**
     * Specifies whether Path is volatile; whether it will be altered or discarded
     * by the caller after it is drawn. Path by default have volatile set false.
     *
     * Mark animating or temporary paths as volatile to improve performance.
     * Mark unchanging Path non-volatile to improve repeated rendering.
     * @param volatile
     */
    setIsVolatile(volatile: boolean): void { }

    /**
     * Set this path to a set of non-overlapping contours that describe the
     * same area as the original path.
     * The curve order is reduced where possible so that cubics may
     * be turned into quadratics, and quadratics maybe turned into lines.
     *
     * Returns true if operation was able to produce a result.
     */
    simplify(): boolean {
        throw new Error("Method not implemented.");
    }

    /**
     * Turns this path into the filled equivalent of the stroked path. Returns null if the operation
     * fails (e.g. the path is a hairline).
     * @param opts - describe how stroked path should look.
     */
    stroke(opts?: StrokeOpts): Path | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Serializes the contents of this path as a series of commands.
     * The first item will be a verb, followed by any number of arguments needed. Then it will
     * be followed by another verb, more arguments and so on.
     */
    toCmds(): Float32Array {
        return Float32Array.of(...this.path.getPath().toCmds());
    }

    /**
     * Returns this path as an SVG string.
     */
    toSVGString(): string {
        return this.path.getPath().toSVGString();
    }

    /**
     * Takes a 3x3 matrix as either an array or as 9 individual params.
     * @param args
     */
    transform(...args: any[]): Path {
        const m3 = args[0]
        const path = new PathBuilder();
        const cmds = this.toCmds();
        let i = 0;
        while (i < cmds.length) {
            const cmd = cmds[i++];
            if (cmd === PathVerb.Move) {
                const to = transformPoint(m3, cmds[i++], cmds[i++]);
                path.moveTo(to);
            } else if (cmd === PathVerb.Line) {
                const to = transformPoint(m3, cmds[i++], cmds[i++]);
                path.lineTo(to);
            } else if (cmd === PathVerb.Cubic) {
                const cp1 = transformPoint(m3, cmds[i++], cmds[i++]);
                const cp2 = transformPoint(m3, cmds[i++], cmds[i++]);
                const to = transformPoint(m3, cmds[i++], cmds[i++]);
                path.cubicCurveTo(cp1, cp2, to);
            } else if (cmd === PathVerb.Quad) {
                const cp = transformPoint(m3, cmds[i++], cmds[i++]);
                const to = transformPoint(m3, cmds[i++], cmds[i++]);
                path.quadraticCurveTo(cp, to);
            } else if (cmd === PathVerb.Close) {
                // TODO: is this correct?
                //i++;
                path.close();
            }
        }
        this.path = path;
        return this;
    }

    /**
     * Take start and stop "t" values (values between 0...1), and modify this path such that
     * it is a subset of the original path.
     * The trim values apply to the entire path, so if it contains several contours, all of them
     * are including in the calculation.
     * Null is returned if either input value is NaN.
     * @param startT - a value in the range [0.0, 1.0]. 0.0 is the beginning of the path.
     * @param stopT  - a value in the range [0.0, 1.0]. 1.0 is the end of the path.
     * @param isComplement
     */
    trim(startT: number, stopT: number, isComplement: boolean): Path | null {
        const pe = new TrimPathEffect(startT, stopT, isComplement);
        return this.swap(pe.filterPath(this.path.getPath()));
    }

    getPath2D() {
        const path = new Path2D();
        const cmds = this.toCmds();
        let i = 0;
        while (i < cmds.length) {
            const cmd = cmds[i++];
            if (cmd === PathVerb.Move) {
                path.moveTo(cmds[i++], cmds[i++]);
            } else if (cmd === PathVerb.Line) {
                path.lineTo(cmds[i++], cmds[i++]);
            } else if (cmd === PathVerb.Cubic) {
                path.bezierCurveTo(
                    cmds[i++],
                    cmds[i++],
                    cmds[i++],
                    cmds[i++],
                    cmds[i++],
                    cmds[i++]
                );
            } else if (cmd === PathVerb.Quad) {
                path.quadraticCurveTo(cmds[i++], cmds[i++], cmds[i++], cmds[i++]);
            } else if (cmd === PathVerb.Close) {
                i++;
                path.closePath();
            }
        }
        return path;
    }

    /**
    * Returns true if the two paths contain equal verbs and equal weights.
    * @param path1 first path to compate
    * @param path2 second path to compare
    * @return      true if Path can be interpolated equivalent
    */
    CanInterpolate(path1: Path, path2: Path): boolean {
        const p1 = path1.getPath();
        const p2 = path2.getPath();
        let result = true;
        p1.contours.forEach((contour, index) => {
            const otherContour = p2.contours[index];
            if (contour.components.length !== otherContour.components.length) {
                result = false;
                return;
            }
            contour.components.forEach((component, j) => {
                const otherComponent = otherContour.components[j];
                if (component.type !== otherComponent.type) {
                    result = false;
                    return;
                }
            });
        });
        return result;
    }

    /**
     * Creates a new path from the given list of path commands. If this fails, null will be
     * returned instead.
     * @param cmds
     */
    MakeFromCmds(input: InputCommands): Path | null {
        const cmds = normalizeArray(input);
        const path = new PathBuilder();
        let i = 0;
        while (i < cmds.length) {
            const cmd = cmds[i++];
            if (cmd === PathVerb.Move) {
                path.moveTo(vec(cmds[i++], cmds[i++]));
            } else if (cmd === PathVerb.Line) {
                path.lineTo(vec(cmds[i++], cmds[i++]));
            } else if (cmd === PathVerb.Cubic) {
                path.cubicCurveTo(
                    vec(cmds[i++], cmds[i++]),
                    vec(cmds[i++], cmds[i++]),
                    vec(cmds[i++], cmds[i++])
                );
            } else if (cmd === PathVerb.Quad) {
                path.quadraticCurveTo(
                    vec(cmds[i++], cmds[i++]),
                    vec(cmds[i++], cmds[i++])
                );
            } else if (cmd === PathVerb.Close) {
                i++;
                path.close();
            }
        }
        return new PathJS(path);
    }
    /**
     * Creates a new path by combining the given paths according to op. If this fails, null will
     * be returned instead.
     * @param one
     * @param two
     * @param op
     */
    MakeFromOp(one: Path, two: Path, op: PathOp): Path | null {
        throw new Error("Function not implemented.");
    }
    /**
     * Interpolates between Path with point array of equal size.
     * Copy verb array and weights to result, and set result path to a weighted
     * average of this path array and ending path.
     *
     *  weight is most useful when between zero (ending path) and
     *  one (this path); will work with values outside of this
     *  range.
     *
     * interpolate() returns undefined if path is not
     * the same size as ending path. Call isInterpolatable() to check Path
     * compatibility prior to calling interpolate().
     *
     * @param start path to interpolate from
     * @param end  path to interpolate with
     * @param weight  contribution of this path, and
     *                 one minus contribution of ending path
     * @return        Path replaced by interpolated averages or null if
     *                not interpolatable
     */
    MakeFromPathInterpolation(start: Path, end: Path, weight: number): Path | null {
        const cmd1 = start.toCmds();
        const cmd2 = end.toCmds();
        const cmd3 = cmd1.map((cmd, index) => {
            const c = cmd2[index];
            if (c === cmd) {
                return cmd;
            }
            return (1 - weight) * c + weight * cmd;
        });
        return this.MakeFromCmds(cmd3);
    }
    /**
     * Creates a new path from the provided SVG string. If this fails, null will be
     * returned instead.
     * @param str
     */
    MakeFromSVGString(str: string): Path | null {
        try {
            return new PathJS(parseSVG(str));
        } catch (e) {
            return null;
        }
    }

    /**
    * Creates a new path using the provided verbs and associated points and weights. The process
    * reads the first verb from verbs and then the appropriate number of points from the
    * FlattenedPointArray (e.g. 2 points for moveTo, 4 points for quadTo, etc). If the verb is
    * a conic, a weight will be read from the WeightList.
    * If the data is malformed (e.g. not enough points), the resulting path will be incomplete.
    * @param verbs - the verbs that create this path, in the order of being drawn.
    * @param points - represents n points with 2n floats.
    * @param weights - used if any of the verbs are conics, can be omitted otherwise.
    */
    MakeFromVerbsPointsWeights(verbs: VerbList, points: InputFlattenedPointArray,
        weights?: WeightList): Path {
        throw new Error("Function not implemented.");
    }
}

const calculateBounds = (points: DOMPoint[], outputArray: Float32Array) => {
    if (!points.length) {
        throw new Error("No points provided");
    }

    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (const point of points) {
        const x = point.x;
        const y = point.y;

        if (x < left) {
            left = x;
        }
        if (x > right) {
            right = x;
        }
        if (y < top) {
            top = y;
        }
        if (y > bottom) {
            bottom = y;
        }
    }
    outputArray[0] = left;
    outputArray[1] = top;
    outputArray[2] = right;
    outputArray[3] = bottom;
};

export const PathEffectFactoryJS: CKPathEffectFactory = {
    /**
     * Returns a PathEffect that can turn sharp corners into rounded corners.
     * @param radius - if <=0, returns null
     */
    MakeCorner(radius: number): PathEffect | null {
        // no flutter 
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a PathEffect that add dashes to the path.
     *
     * See SkDashPathEffect.h for more details.
     *
     * @param intervals - even number of entries with even indicies specifying the length of
     *                    the "on" intervals, and the odd indices specifying the length of "off".
     * @param phase - offset length into the intervals array. Defaults to 0.
     */
    MakeDash(intervals: number[], phase?: number): PathEffect {
        // no flutter 
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a PathEffect that breaks path into segments of segLength length, and randomly move
     * the endpoints away from the original path by a maximum of deviation.
     * @param segLength - length of the subsegments.
     * @param dev - limit of the movement of the endpoints.
     * @param seedAssist - modifies the randomness. See SkDiscretePathEffect.h for more.
     */
    MakeDiscrete(segLength: number, dev: number, seedAssist: number): PathEffect {
        // no flutter 
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a PathEffect that will fill the drawing path with a pattern made by applying
     * the given matrix to a repeating set of infinitely long lines of the given width.
     * For example, the scale of the provided matrix will determine how far apart the lines
     * should be drawn its rotation affects the lines' orientation.
     * @param width - must be >= 0
     * @param matrix
     */
    MakeLine2D(width: number, matrix: InputMatrix): PathEffect | null {
        // no flutter 
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a PathEffect which implements dashing by replicating the specified path.
     *   @param path The path to replicate (dash)
     *   @param advance The space between instances of path
     *   @param phase distance (mod advance) along path for its initial position
     *   @param style how to transform path at each point (based on the current
     *                position and tangent)
     */
    MakePath1D(path: Path, advance: number, phase: number, style: Path1DEffectStyle): PathEffect | null {
        // no flutter 
        throw new Error("Function not implemented.");
    },
    /**
     * Returns a PathEffect that will fill the drawing path with a pattern by repeating the
     * given path according to the provided matrix. For example, the scale of the matrix
     * determines how far apart the path instances should be drawn.
     * @param matrix
     * @param path
     */
    MakePath2D(matrix: InputMatrix, path: Path): PathEffect | null {
        // no flutter 
        throw new Error("Function not implemented.");
    },
};