import type {
    Image,
    Canvas,
    ImageInfo,
    InputIRect,
    PartialImageInfo,
    Surface,
    TextureSource,
    InputRect,
    ClipOp,
    InputRRect,
    InputMatrix,
    AngleInDegrees,
    Paint,
    InputFlattenedRectangleArray,
    InputFlattenedRSXFormArray,
    BlendMode,
    CubicResampler,
    ColorIntArray,
    FilterOptions,
    InputColor,
    ColorInt,
    InputGlyphIDArray,
    InputFlattenedPointArray,
    MipmapMode,
    FilterMode,
    Paragraph,
    Path,
    Color,
    SkPicture,
    PointMode,
    InputVector3,
    TextBlob,
    Vertices,
    IRect,
    Matrix4x4,
    ImageFilter,
    SaveLayerFlag,
    AlphaType,
    ColorType,
    ColorSpace,
    EmulatedCanvas2D,
    EmulatedCanvas2DContext,
    EmulatedPath2D,
    GrDirectContext,
} from "../canvaskit";

//   import { IndexedHostObject } from "./HostObject";
//   import { CanvasJS } from "./Canvas";
//   import { ImageJS } from "./Image";
//   import { rectToXYWH } from "./Core";
//   import { CanvasProxyHandler } from "./Core/CanvasProxyHandler";
import { SkEmbindObject } from "../bass";
import { ImageJS } from "./image";
import { intAsColor } from "./color";


export class EmulatedCanvas2DJS implements EmulatedCanvas2D {
    constructor(private readonly canvas: HTMLCanvasElement) { }
    /**
     * Cleans up all resources associated with this emulated canvas.
     */
    dispose(): void { }
    /**
     * Decodes an image with the given bytes.
     * @param bytes
     */
    decodeImage(bytes: ArrayBuffer | Uint8Array): Image {
        throw new Error("Method not implemented.");
    }
    /**
     * Returns an emulated canvas2d context if type == '2d', null otherwise.
     * @param type
     */
    getContext(type: string): EmulatedCanvas2DContext | null {
        return this.canvas.getContext("2d");
    }
    /**
     * Loads the given font with the given descriptors. Emulates new FontFace().
     * @param bytes
     * @param descriptors
     */
    loadFont(bytes: ArrayBuffer | Uint8Array, descriptors: Record<string, string>): void {
        throw new Error("Method not implemented.");
    }
    /**
     * Returns an new emulated Path2D object.
     * @param str - an SVG string representing a path.
     */
    makePath2D(str?: string): EmulatedPath2D {
        return new Path2D(str);
    }
    /**
     * Returns the current canvas as a base64 encoded image string.
     * @param codec - image/png by default; image/jpeg also supported.
     * @param quality
     */
    toDataURL(codec?: string, quality?: number): string {
        return this.canvas.toDataURL(codec, quality);
    }
}

/**
 * See SkCanvas.h for more information on this class.
 */
export class CanvasJS extends SkEmbindObject<"Canvas"> implements Canvas {
    private ctx: NativeCanvas;
    private width: number;
    private height: number;
    private saveCount = 0;

    constructor(ctx: CanvasRenderingContext2D) {
        super("Canvas");
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.ctx = new NativeCanvas(ctx);
    }

    /**
     * Fills the current clip with the given color using Src BlendMode.
     * This has the effect of replacing all pixels contained by clip with color.
     * @param color
     */
    clear(color: InputColor): void {
        const paint = new PaintJS();
        paint.setColor(color);
        paint.setBlendMode(BlendMode.Clear);
        this.drawPaint(paint);
    }

    /**
     * Replaces clip with the intersection or difference of the current clip and path,
     * with an aliased or anti-aliased clip edge.
     * @param path
     * @param op
     * @param doAntiAlias
     */
    clipPath(path: Path, op: ClipOp, doAntiAlias: boolean): void {
        this._clip(path.getPath());
    }
    /**
     * Replaces clip with the intersection or difference of the current clip and rect,
     * with an aliased or anti-aliased clip edge.
     * @param rect
     * @param op
     * @param doAntiAlias
     */
    clipRect(rect: InputRect, op: ClipOp, doAntiAlias: boolean): void {
        const { x, y, width, height } = rectToXYWH(rect);
        const path = new NativePath();
        path.moveTo(new DOMPoint(x, y));
        path.lineTo(new DOMPoint(x + width, y));
        path.lineTo(new DOMPoint(x + width, y + height));
        path.lineTo(new DOMPoint(x, y + height));
        path.close();
        this._clip(path);
    }
    /**
     * Replaces clip with the intersection or difference of the current clip and rrect,
     * with an aliased or anti-aliased clip edge.
     * @param rrect
     * @param op
     * @param doAntiAlias
     */
    clipRRect(rrect: InputRRect, op: ClipOp, doAntiAlias: boolean): void {
        const { x, y, width, height, radii } = rrectToXYWH(rrect);
        const path = new PathJS();
        path.addRRect([
            x,
            y,
            width,
            height,
            radii.topLeft.x,
            radii.topLeft.y,
            radii.topRight.x,
            radii.topRight.y,
            radii.bottomRight.x,
            radii.bottomRight.y,
            radii.bottomLeft.x,
            radii.bottomLeft.y,
        ]);
        this._clip(path.getPath());
    }

    private _clip(path: NativePath) {
        this.ctx.clip(path);
    }

    /**
 * Replaces current matrix with m premultiplied with the existing matrix.
 * @param m
 */
    concat(m: InputMatrix): void {
        const m3 = nativeMatrix(m);
        this.ctx.concat(m3);
    }
    /**
     * Draws arc using clip, Matrix, and Paint paint.
     *
     * Arc is part of oval bounded by oval, sweeping from startAngle to startAngle plus
     * sweepAngle. startAngle and sweepAngle are in degrees.
     * @param oval - bounds of oval containing arc to draw
     * @param startAngle - angle in degrees where arc begins
     * @param sweepAngle - sweep angle in degrees; positive is clockwise
     * @param useCenter - if true, include the center of the oval
     * @param paint
     */
    drawArc(oval: InputRect, startAngle: AngleInDegrees, sweepAngle: AngleInDegrees,
        useCenter: boolean, paint: Paint): void {
        const path = new PathJS();
        const rct = rectToXYWH(oval);
        path.arc(
            rct.width / 2,
            rct.height / 2,
            rct.width / 2,
            startAngle,
            sweepAngle
        );
        this.ctx.drawPath(path.getPath(), paint.getPaint());
    }

    /**
     * Draws a set of sprites from atlas, using clip, Matrix, and optional Paint paint.
     * @param atlas - Image containing sprites
     * @param srcRects - Rect locations of sprites in atlas
     * @param dstXforms - RSXform mappings for sprites in atlas
     * @param paint
     * @param blendMode - BlendMode combining colors and sprites
     * @param colors - If provided, will be blended with sprite using blendMode.
     * @param sampling - Specifies sampling options. If null, bilinear is used.
     */
    drawAtlas(atlas: Image, srcRects: InputFlattenedRectangleArray,
        dstXforms: InputFlattenedRSXFormArray, paint: Paint,
        blendMode?: BlendMode | null, colors?: ColorIntArray | null,
        sampling?: CubicResampler | FilterOptions): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Draws a circle at (cx, cy) with the given radius.
     * @param cx
     * @param cy
     * @param radius
     * @param paint
     */
    drawCircle(cx: number, cy: number, radius: number, paint: Paint): void {
        const path = new PathJS();
        path.addCircle(cx, cy, radius);
        this.ctx.drawPath(path.getPath(), paint.getPaint());
    }

    /**
     * Fills clip with the given color.
     * @param color
     * @param blendMode - defaults to SrcOver.
     */
    drawColor(color: InputColor, blendMode?: BlendMode): void {
        const paint = new PaintJS();
        paint.setColor(color);
        if (blendMode) {
            paint.setBlendMode(blendMode);
        }
        this.drawPaint(paint);
    }

    /**
     * Fills clip with the given color.
     * @param r - red value (typically from 0 to 1.0).
     * @param g - green value (typically from 0 to 1.0).
     * @param b - blue value (typically from 0 to 1.0).
     * @param a - alpha value, range 0 to 1.0 (1.0 is opaque).
     * @param blendMode - defaults to SrcOver.
     */
    drawColorComponents(r: number, g: number, b: number, a: number, blendMode?: BlendMode): void {
        this.drawColor(Float32Array.of(r, g, b, a), blendMode);
    }

    /**
     * Fills clip with the given color.
     * @param color
     * @param blendMode - defaults to SrcOver.
     */
    drawColorInt(color: ColorInt, blendMode?: BlendMode): void {
        this.drawColor(intAsColor(color), blendMode);
    }

    /**
     * Draws RRect outer and inner using clip, Matrix, and Paint paint.
     * outer must contain inner or the drawing is undefined.
     * @param outer
     * @param inner
     * @param paint
     */
    drawDRRect(outer: InputRRect, inner: InputRRect, paint: Paint): void {
        this.ctx.draw(
            new DrawableDRRect(rrectToPath2D(outerInput), rrectToPath2D(innerInput)),
            paint.getPaint()
        );
    }

    /**
     * Draws a run of glyphs, at corresponding positions, in a given font.
     * @param glyphs the array of glyph IDs (Uint16TypedArray)
     * @param positions the array of x,y floats to position each glyph
     * @param x x-coordinate of the origin of the entire run
     * @param y y-coordinate of the origin of the entire run
     * @param font the font that contains the glyphs
     * @param paint
     */
    drawGlyphs(glyphs: InputGlyphIDArray,
        positions: InputFlattenedPointArray,
        x: number, y: number,
        font: Font, paint: Paint): void {
        throw new Error("drawGlyphs not implemented.");
    }

    /**
     * Draws the given image with its top-left corner at (left, top) using the current clip,
     * the current matrix, and optionally-provided paint.
     * @param img
     * @param left
     * @param top
     * @param paint
     */
    drawImage(img: Image, left: number, top: number, paint?: Paint | null): void {
        const paint = _paint || new PaintJS();
        this.ctx.draw(new DrawableImage(img.getImage(), x, y), paint.getPaint());
    }


    /**
     * Draws the given image with its top-left corner at (left, top) using the current clip,
     * the current matrix. It will use the cubic sampling options B and C if necessary.
     * @param img
     * @param left
     * @param top
     * @param B - See CubicResampler in SkSamplingOptions.h for more information
     * @param C - See CubicResampler in SkSamplingOptions.h for more information
     * @param paint
     */
    drawImageCubic(img: Image, left: number, top: number, B: number, C: number,
        paint?: Paint | null): void {
        throw new Error("drawImageCubic not implemented.");
    }

    /**
     * Draws the given image with its top-left corner at (left, top) using the current clip,
     * the current matrix. It will use the provided sampling options if necessary.
     * @param img
     * @param left
     * @param top
     * @param fm - The filter mode.
     * @param mm - The mipmap mode. Note: for settings other than None, the image must have mipmaps
     *             calculated with makeCopyWithDefaultMipmaps;
     * @param paint
     */
    drawImageOptions(img: Image, left: number, top: number, fm: FilterMode,
        mm: MipmapMode, paint?: Paint | null): void {
        throw new Error("drawImageOptions not implemented.");
    }


    /**
     *  Draws the provided image stretched proportionally to fit into dst rectangle.
     *  The center rectangle divides the image into nine sections: four sides, four corners, and
     *  the center.
     * @param img
     * @param center
     * @param dest
     * @param filter - what technique to use when sampling the image
     * @param paint
     */
    drawImageNine(img: Image, center: InputIRect, dest: InputRect, filter: FilterMode,
        paint?: Paint | null): void {
        throw new Error("Method not implemented.");
    }


    /**
     * Draws sub-rectangle src from provided image, scaled and translated to fill dst rectangle.
     * @param img
     * @param src
     * @param dest
     * @param paint
     * @param fastSample - if false, will filter strictly within src.
     */
    drawImageRect(img: Image, src: InputRect, dest: InputRect, paint: Paint,
        fastSample?: boolean): void {
        const src = rectToXYWH(_src);
        const dest = rectToXYWH(_dest);
        this.ctx.draw(
            new DrawableImageRect(
                img.getImage(),
                src.x,
                src.y,
                src.width,
                src.height,
                dest.x,
                dest.y,
                dest.width,
                dest.height
            ),
            paint.getPaint()
        );
    }


    /**
     * Draws sub-rectangle src from provided image, scaled and translated to fill dst rectangle.
     * It will use the cubic sampling options B and C if necessary.
     * @param img
     * @param src
     * @param dest
     * @param B - See CubicResampler in SkSamplingOptions.h for more information
     * @param C - See CubicResampler in SkSamplingOptions.h for more information
     * @param paint
     */
    drawImageRectCubic(img: Image, src: InputRect, dest: InputRect,
        B: number, C: number, paint?: Paint | null): void {
        throw new Error("drawImageRectCubic not implemented.");
    }


    /**
     * Draws sub-rectangle src from provided image, scaled and translated to fill dst rectangle.
     * It will use the provided sampling options if necessary.
     * @param img
     * @param src
     * @param dest
     * @param fm - The filter mode.
     * @param mm - The mipmap mode. Note: for settings other than None, the image must have mipmaps
     *             calculated with makeCopyWithDefaultMipmaps;
     * @param paint
     */
    drawImageRectOptions(img: Image, src: InputRect, dest: InputRect, fm: FilterMode,
        mm: MipmapMode, paint?: Paint | null): void {
        throw new Error("drawImageRectOptions not implemented.");
    }

    /**
     * Draws line segment from (x0, y0) to (x1, y1) using the current clip, current matrix,
     * and the provided paint.
     * @param x0
     * @param y0
     * @param x1
     * @param y1
     * @param paint
     */
    drawLine(x0: number, y0: number, x1: number, y1: number, paint: Paint): void {
        const path = new PathJS();
        path.moveTo(x0, y0);
        path.lineTo(x1, y1);
        this.ctx.drawPath(path.getPath(), paint.getPaint());
    }

    /**
     * Draws an oval bounded by the given rectangle using the current clip, current matrix,
     * and the provided paint.
     * @param oval
     * @param paint
     */
    drawOval(oval: InputRect, paint: Paint): void {
        throw new Error("drawOval not implemented.");
    }

    /**
     * Fills clip with the given paint.
     * @param paint
     */
    drawPaint(paint: Paint): void {
        this.ctx.draw(new DrawableFill(this.width, this.height), paint.getPaint());
    }

    /**
     * Draws the given Paragraph at the provided coordinates.
     * Requires the Paragraph code to be compiled in.
     * @param p
     * @param x
     * @param y
     */
    drawParagraph(p: Paragraph, x: number, y: number): void {
        throw new Error("drawParagraph not implemented.");
    }

    /**
     * Draws the given path using the current clip, current matrix, and the provided paint.
     * @param path
     * @param paint
     */
    drawPath(path: Path, paint: Paint): void {
        this.ctx.drawPath(path.getPath(), paint.getPaint());
    }

    /**
     * Draws a cubic patch defined by 12 control points [top, right, bottom, left] with optional
     * colors and shader-coordinates [4] specifed for each corner [top-left, top-right, bottom-right, bottom-left]
     * @param cubics 12 points : 4 connected cubics specifying the boundary of the patch
     * @param colors optional colors interpolated across the patch
     * @param texs optional shader coordinates interpolated across the patch
     * @param mode Specifies how shader and colors blend (if both are specified)
     * @param paint
     */
    drawPatch(cubics: InputFlattenedPointArray,
        colors?: ColorIntArray | Color[] | null,
        texs?: InputFlattenedPointArray | null,
        mode?: BlendMode | null,
        paint?: Paint): void {
        throw new Error("drawPatch not implemented.");
    }

    /**
     * Draws the given picture using the current clip, current matrix, and the provided paint.
     * @param skp
     */
    drawPicture(skp: SkPicture): void {
        skp.canvas.replay(this);
    }

    /**
     * Draws the given points using the current clip, current matrix, and the provided paint.
     *
     * See Canvas.h for more on the mode and its interaction with paint.
     * @param mode
     * @param points
     * @param paint
     */
    drawPoints(mode: PointMode, points: InputFlattenedPointArray, paint: Paint): void {
        throw new Error("drawPoints not implemented.");
    }

    /**
     * Draws the given rectangle using the current clip, current matrix, and the provided paint.
     * @param rect
     * @param paint
     */
    drawRect(rect: InputRect, paint: Paint): void {
        const path = new PathJS();
        path.addRect(rect);
        this.ctx.drawPath(path.getPath(), paint.getPaint());
    }


    /**
     * Draws the given rectangle using the current clip, current matrix, and the provided paint.
     * @param left
     * @param top
     * @param right
     * @param bottom
     * @param paint
     */
    drawRect4f(left: number, top: number, right: number, bottom: number, paint: Paint): void {
        this.drawRect(Float32Array.of(left, top, right, bottom), paint);
    }


    /**
     * Draws the given rectangle with rounded corners using the current clip, current matrix,
     * and the provided paint.
     * @param rrect
     * @param paint
     */
    drawRRect(rrect: InputRRect, paint: Paint): void {
        const path = new PathJS();
        path.addRRect(rrect);
        this.ctx.drawPath(path.getPath(), paint.getPaint());
    }

    /**
     * Draw an offset spot shadow and outlining ambient shadow for the given path using a disc
     * light. See SkShadowUtils.h for more details
     * @param path - The occluder used to generate the shadows.
     * @param zPlaneParams - Values for the plane function which returns the Z offset of the
     *                       occluder from the canvas based on local x and y values (the current
     *                       matrix is not applied).
     * @param lightPos - The 3D position of the light relative to the canvas plane. This is
     *                   independent of the canvas's current matrix.
     * @param lightRadius - The radius of the disc light.
     * @param ambientColor - The color of the ambient shadow.
     * @param spotColor -  The color of the spot shadow.
     * @param flags - See SkShadowUtils.h; 0 means use default options.
     */
    drawShadow(path: Path, zPlaneParams: InputVector3, lightPos: InputVector3, lightRadius: number,
        ambientColor: InputColor, spotColor: InputColor, flags: number): void {
        throw new Error("drawShadow not implemented.");
    }

    /**
     * Draw the given text at the location (x, y) using the provided paint and font. The text will
     * be drawn as is; no shaping, left-to-right, etc.
     * @param str
     * @param x
     * @param y
     * @param paint
     * @param font
     */
    drawText(str: string, x: number, y: number, paint: Paint, font: Font): void {
        this.ctx.draw(
            new DrawableText(str, x, y, font.fontStyle()),
            paint.getPaint()
        );
    }
    /**
     * Draws the given TextBlob at (x, y) using the current clip, current matrix, and the
     * provided paint. Reminder that the fonts used to draw TextBlob are part of the blob.
     * @param blob
     * @param x
     * @param y
     * @param paint
     */
    drawTextBlob(blob: TextBlob, x: number, y: number, paint: Paint): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Draws the given vertices (a triangle mesh) using the current clip, current matrix, and the
     * provided paint.
     *  If paint contains an Shader and vertices does not contain texCoords, the shader
     *  is mapped using the vertices' positions.
     *  If vertices colors are defined in vertices, and Paint paint contains Shader,
     *  BlendMode mode combines vertices colors with Shader.
     * @param verts
     * @param mode
     * @param paint
     */
    drawVertices(verts: Vertices, mode: BlendMode, paint: Paint): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns the bounds of clip, unaffected by the canvas's matrix.
     * If the clip is empty, all four integers in the returned rectangle will equal zero.
     *
     * @param output - if provided, the results will be copied into the given array instead of
     *      allocating a new one.
     */
    getDeviceClipBounds(output?: IRect): IRect {
        throw new Error("Method not implemented.");
    }

    /**
 * Returns the current transform from local coordinates to the 'device', which for most
 * purposes means pixels.
 */
    getLocalToDevice(): Matrix4x4 {
        const m = this.ctx.getMatrix();
        return Float32Array.of(
            m.m11,
            m.m21,
            m.m31,
            m.m41,
            m.m12,
            m.m22,
            m.m32,
            m.m42,
            m.m13,
            m.m23,
            m.m33,
            m.m43,
            m.m14,
            m.m24,
            m.m34,
            m.m44
        );
    }

    /**
     * Returns the number of saved states, each containing: Matrix and clip.
     * Equals the number of save() calls less the number of restore() calls plus one.
     * The save count of a new canvas is one.
     */
    getSaveCount(): number {
        return this.saveCount;
    }

    /**
     * Legacy version of getLocalToDevice(), which strips away any Z information, and
     * just returns a 3x3 version.
     */
    getTotalMatrix(): number[] {
        const matrix = this.ctx.getMatrix();
        return [
            matrix.m11,
            matrix.m21,
            matrix.m41,
            matrix.m12,
            matrix.m22,
            matrix.m42,
            matrix.m14,
            matrix.m24,
            matrix.m44,
        ];
    }


    /**
     * Creates Surface matching info and props, and associates it with Canvas.
     * Returns null if no match found.
     * @param info
     */
    makeSurface(info: ImageInfo): Surface | null {
        throw new Error("makeSurface not implemented.");
    }

    /**
     * Returns a TypedArray containing the pixels reading starting at (srcX, srcY) and does not
     * exceed the size indicated by imageInfo. See SkCanvas.h for more on the caveats.
     *
     * If dest is not provided, we allocate memory equal to the provided height * the provided
     * bytesPerRow to fill the data with.
     *
     * This is generally a very expensive call for the GPU backend.
     *
     * @param srcX
     * @param srcY
     * @param imageInfo - describes the destination format of the pixels.
     * @param dest - If provided, the pixels will be copied into the allocated buffer allowing
     *        access to the pixels without allocating a new TypedArray.
     * @param bytesPerRow - number of bytes per row. Must be provided if dest is set. This
     *        depends on destination ColorType. For example, it must be at least 4 * width for
     *        the 8888 color type.
     * @returns a TypedArray appropriate for the specified ColorType. Note that 16 bit floats are
     *          not supported in JS, so that colorType corresponds to raw bytes Uint8Array.
     */
    readPixels(srcX: number, srcY: number, imageInfo: ImageInfo, dest?: MallocObj,
        bytesPerRow?: number): Float32Array | Uint8Array | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Removes changes to the current matrix and clip since Canvas state was
     * last saved. The state is removed from the stack.
     * Does nothing if the stack is empty.
     */
    restore(): void {
        this.ctx.restore();
    }


    /**
     * Restores state to a previous stack value.
     * @param saveCount
     */
    restoreToCount(saveCount: number): void {
        for (let i = 1; i <= saveCount; i++) {
            this.restore();
        }
    }


    /**
     * Rotates the current matrix by the number of degrees.
     * @param rot - angle of rotation in degrees.
     * @param rx
     * @param ry
     */
    rotate(rot: AngleInDegrees, rx: number, ry: number): void {
        const m = new DOMMatrix().translate(rx, ry).rotate(rot).translate(-rx, -ry);
        this.concat(m);
    }

    /**
     * Saves the current matrix and clip and returns current height of the stack.
     */
    save(): number {
        this.ctx.save();
        return ++this.saveCount;
    }


    /**
     * Saves Matrix and clip, and allocates a SkBitmap for subsequent drawing.
     * Calling restore() discards changes to Matrix and clip, and draws the SkBitmap.
     * It returns the height of the stack.
     * See Canvas.h for more.
     * @param paint
     * @param bounds
     * @param backdrop
     * @param flags
     */
    saveLayer(paint?: Paint, bounds?: InputRect | null, backdrop?: ImageFilter | null,
        flags?: SaveLayerFlag): number {
        this.ctx.save(
            imageFilter ? new ImageFilter(imageFilter.filters) : undefined
        );
        return ++this.saveCount;
    }

    /**
     * Scales the current matrix by sx on the x-axis and sy on the y-axis.
     * @param sx
     * @param sy
     */
    scale(sx: number, sy: number): void {
        const m = new DOMMatrix().scale(sx, sy);
        this.concat(m);
    }

    /**
 *  Skews Matrix by sx on the x-axis and sy on the y-axis. A positive value of sx
 *  skews the drawing right as y-axis values increase; a positive value of sy skews
 *  the drawing down as x-axis values increase.
 * @param sx
 * @param sy
 */
    skew(sx: number, sy: number): void {
        const rSx = Math.tan(sx);
        const rSy = Math.tan(sy);
        const m = new DOMMatrix([1, rSy, rSx, 1, 0, 0]);
        this.concat(m);
    }

    /**
 * Translates Matrix by dx along the x-axis and dy along the y-axis.
 * @param dx
 * @param dy
 */
    translate(x: number, y: number): void {
        this.concat(new DOMMatrix().translate(x, y));
    }
    /**
     * Writes the given rectangle of pixels to the provided coordinates. The source pixels
     * will be converted to the canvas's alphaType and colorType if they do not match.
     * @param pixels
     * @param srcWidth
     * @param srcHeight
     * @param destX
     * @param destY
     * @param alphaType - defaults to Unpremul
     * @param colorType - defaults to RGBA_8888
     * @param colorSpace - defaults to SRGB
     */
    writePixels(pixels: Uint8Array | number[], srcWidth: number, srcHeight: number,
        destX: number, destY: number, alphaType?: AlphaType, colorType?: ColorType,
        colorSpace?: ColorSpace): boolean {
        throw new Error("writePixels not implemented.");
    }
}

export class SurfaceJS extends SkEmbindObject<"Surface"> implements Surface {
    private canvas: Canvas;
    private ctx: CanvasRenderingContext2D;
    // private proxyHandler: CanvasProxyHandler | null = null;

    constructor(ctx: CanvasRenderingContext2D, debug = false) {
        super("Surface");
        if (debug) {
            this.proxyHandler = new CanvasProxyHandler();
            this.ctx = new Proxy(ctx, this.proxyHandler);
        } else {
            this.ctx = ctx;
        }
        this.canvas = new CanvasJS(this.ctx);
    }
    /**
     * A convenient way to draw exactly once on the canvas associated with this surface.
     * This requires an environment where a global function called requestAnimationFrame is
     * available (e.g. on the web, not on Node). Users do not need to flush the surface,
     * or delete/dispose of it as that is taken care of automatically with this wrapper.
     *
     * Node users should call getCanvas() and work with that canvas directly.
     */
    drawOnce(drawFrame: (_: Canvas) => void): void {
        this.requestAnimationFrame(drawFrame);
    }

    /**
     * Clean up the surface and any extra memory.
     * [Deprecated]: In the future, calls to delete() will be sufficient to clean up the memory.
     */
    dispose(): void {
        // TODO: dispose of the SVG resource
        //this.svgCtx.dispose();
    }
    /**
     * Make sure any queued draws are sent to the screen or the GPU.
     */
    flush(): void {
        //   if (this.proxyHandler) {
        //     this.proxyHandler.flush();
        //   }
    }
    /**
     * Return a canvas that is backed by this surface. Any draws to the canvas will (eventually)
     * show up on the surface. The returned canvas is owned by the surface and does NOT need to
     * be cleaned up by the client.
     */
    getCanvas(): Canvas {
        return this.canvas;
    }
    height(): number {
        return this.ctx.canvas.height;
    }
    /**
     * Returns the ImageInfo associated with this surface.
     */
    imageInfo(): ImageInfo {
        throw new Error("Method not implemented.");
    }
    /**
     * Creates an Image from the provided texture and info. The Image will own the texture;
     * when the image is deleted, the texture will be cleaned up.
     * @param tex
     * @param info - describes the content of the texture.
     */
    makeImageFromTexture(tex: WebGLTexture, info: ImageInfo): Image | null {
        throw new Error("Method not implemented.");
    }
    /**
     * Returns a texture-backed image based on the content in src. It uses RGBA_8888, unpremul
     * and SRGB - for more control, use makeImageFromTexture.
     *
     * The underlying texture for this image will be created immediately from src, so
     * it can be disposed of after this call. This image will *only* be usable for this
     * surface (because WebGL textures are not transferable to other WebGL contexts).
     * For an image that can be used across multiple surfaces, at the cost of being lazily
     * loaded, see MakeLazyImageFromTextureSource.
     *
     * Not available for software-backed surfaces.
     * @param src
     * @param info - If provided, will be used to determine the width/height/format of the
     *               source image. If not, sensible defaults will be used.
     * @param srcIsPremul - set to true if the src data has premultiplied alpha. Otherwise, it will
     *               be assumed to be Unpremultiplied. Note: if this is true and info specifies
     *               Unpremul, Skia will not convert the src pixels first.
     */
    makeImageFromTextureSource(src: TextureSource, info?: ImageInfo | PartialImageInfo,
        srcIsPremul?: boolean): Image | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns current contents of the surface as an Image. This image will be optimized to be
     * drawn to another surface of the same type. For example, if this surface is backed by the
     * GPU, the returned Image will be backed by a GPU texture.
     */
    makeImageSnapshot(_bounds?: InputIRect): Image {
        const bounds = _bounds
            ? rectToXYWH(_bounds)
            : {
                x: 0,
                y: 0,
                width: this.width(),
                height: this.height(),
            };
        const data = this.ctx.getImageData(
            bounds.x,
            bounds.y,
            bounds.width,
            bounds.height
        );
        return new ImageJS(data);
    }

    /**
     * Returns a compatible Surface, haring the same raster or GPU properties of the original.
     * The pixels are not shared.
     * @param info - width, height, etc of the Surface.
     */
    makeSurface(info: ImageInfo): Surface {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns if this Surface is a GPU-backed surface or not.
     */
    reportBackendTypeIsGPU(): boolean {
        return true;
    }

    /**
     * A convenient way to draw multiple frames on the canvas associated with this surface.
     * This requires an environment where a global function called requestAnimationFrame is
     * available (e.g. on the web, not on Node). Users do not need to flush the surface,
     * as that is taken care of automatically with this wrapper.
     *
     * Users should probably call surface.requestAnimationFrame in the callback function to
     * draw multiple frames, e.g. of an animation.
     *
     * Node users should call getCanvas() and work with that canvas directly.
     *
     * Returns the animation id.
     */
    requestAnimationFrame(drawFrame: (_: Canvas) => void): number {
        return requestAnimationFrame(() => {
            drawFrame(this.canvas);
        });
    }
    /**
     * If this surface is GPU-backed, return the sample count of the surface.
     */
    sampleCnt(): number {
        throw new Error("Method not implemented.");
    }
    /**
     * Updates the underlying GPU texture of the image to be the contents of the provided
     * TextureSource. Has no effect on CPU backend or if img was not created with either
     * makeImageFromTextureSource or makeImageFromTexture.
     * If the provided TextureSource is of different dimensions than the Image, the contents
     * will be deformed (e.g. squished). The ColorType, AlphaType, and ColorSpace of src should
     * match the original settings used to create the Image or it may draw strange.
     *
     * @param img - A texture-backed Image.
     * @param src - A valid texture source of any dimensions.
     * @param srcIsPremul - set to true if the src data has premultiplied alpha. Otherwise, it will
     *               be assumed to be Unpremultiplied. Note: if this is true and the image was
     *               created with Unpremul, Skia will not convert.
     */
    updateTextureFromSource(img: Image, src: TextureSource, srcIsPremul?: boolean): void {
        throw new Error("Method not implemented.");
    }
    width(): number {
        return this.ctx.canvas.width;
    }
}

/**
 * See GrDirectContext.h for more on this class.
 */

export class GrDirectContextJS extends SkEmbindObject<"GrDirectContext"> implements GrDirectContext {
    private limit = 5 * 3840 * 2160 * 4;
    private cache: Map<string, ImageBitmap> = new Map();

    constructor(public readonly ctx: CanvasRenderingContext2D) {
        super("GrDirectContext");
    }

    getResourceCacheLimitBytes() {
        return this.limit;
    }

    getResourceCacheUsageBytes() {
        return Array.from(this.cache.values()).reduce(
            (acc, bitmap) => acc + bitmap.width * bitmap.height * 4,
            0
        );
    }

    releaseResourcesAndAbandonContext() {
        this.cache.clear();
    }

    setResourceCacheLimitBytes(limit: number) {
        this.limit = limit;
    }

    get(id: string) {
        return this.cache.get(id);
    }

    set(id: string, bitmap: ImageBitmap) {
        this.cache.set(id, bitmap);
    }
}