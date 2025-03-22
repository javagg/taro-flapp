import type {
    CanvasKit,
    Image,
    Color, ColorInt, ColorSpace, EmulatedCanvas2D, 
    GrDirectContext, ImageInfo, InputMatrix, InputVector3,
     IRect, MallocObj, Path, Rect, RRect, Surface, TypedArrayConstructor, WebGLOptions,
    SoundMap,
    ManagedSkottieAnimation,
    Vertices,
    InputFlattenedPointArray,
    ColorIntArray,
    VertexMode,
    SkottieAnimation,
    SkPicture,
    AnimatedImage,
    PartialImageInfo,
    TextureSource,
    WebGLContextHandle,
    SaveLayerFlag,
    InputRect,
    WebGPUDeviceContext,
    WebGPUCanvasOptions,
    WebGPUCanvasContext,
    PathConstructorAndFactory,
    ColorFilterFactory,
    ImageFilterFactory,
    MaskFilterFactory,
    // PathEffectFactory,
    RuntimeEffectFactory,
    ShaderFactory,
    TextStyleConstructor,
    TextBlobFactory,
    TypefaceFactory,
    PathEffectFactory,
    FontConstructor,
    BlenderFactory,
    PictureRecorder,
    DefaultConstructor,
    ContourMeasureIterConstructor,
    Paint,
} from "../canvaskit";

import {
    AlphaType as AlphaTypeEnum,
    BlendMode as BlendModeEnum,
    BlurStyle as BlurStyleEnum,
    ColorChannel as ColorChannelEnum,
    ColorSpace as ColorSpaceEnum,
    ColorType as ColorTypeEnum,
    FilterMode as FilterModeEnum,
    ClipOp as ClipOpEnum,
    FillType as FillTypeEnum,
    FontEdging as FontEdgingEnum,
    FontHinting as FontHintingEnum,
    // GlyphRunFlags as GlyphRunFlag,
    ImageFormat as ImageFormatEnum,
    MipmapMode as MipmapModeEnum,
    PaintStyle as PaintStyleEnum,
    Path1DEffectStyle as Path1DEffectStyleEnum,
    PathOp as PathOpEnum,
    PointMode as PointModeEnum,
    StrokeCap as StrokeCapEnum,
    StrokeJoin as StrokeJoinEnum,
    TileMode as TileModeEnum,
    VertexMode as VertexModeEnum,
    InputState as InputStateEnum,
    ModifierKey as ModifierKeyEnum,
    Affinity as AffinityEnum,
    DecorationStyle as DecorationStyleEnum,
    FontSlant as FontSlantEnum,
    FontWeight as FontWeightEnum,
    FontWidth as FontWidthEnum,
    PlaceholderAlignment as PlaceholderAlignmentEnum,
    RectHeightStyle as RectHeightStyleEnum,
    RectWidthStyle as RectWidthStyleEnum,
    TextAlign as TextAlignEnum,
    TextBaseline as TextBaselineEnum,
    TextDirection as TextDirectionEnum,
    TextHeightBehavior as TextHeightBehaviorEnum,
    ResizePolicy as ResizePolicyEnum,
    VerticalTextAlign as VerticalTextAlignEnum,
    PathVerb,
} from '../bass'

import { MallocObjJS, Matrix3, Matrix4, VectorHelpers, ColorMatrixHelpers, normalizeArray, } from "./draw";
import { ImageJS } from "./image";
import { EmulatedCanvas2DJS, SurfaceJS, GrDirectContextJS } from "./surface";
import { clampColorComp, createTexture, resolveContext } from "./utils";

import {
    _FontCollection,
    _TypefaceFactory,
    _Font,
    _FontMgr,
    _Typeface,
    _ParagraphBuilderFactory, _ParagraphBuilder,
    _ParagraphStyle,
    _TextStyle,
    _TypefaceFontProviderFactory,
    _TypefaceFontProvider,
} from "../mite"
import { PathEffectFactoryJS, PathJS } from "./path";
import { ColorFilterJS, ImageFilterJS, MaskFilterJS } from "./filter";
import { ShaderJS } from "./shader";
import { TextBlobJS } from "./blob";
import { RuntimeEffectJS } from "./effects";
import { BlenderJs } from "./blender";
import { PictureRecorderJS } from "./picture";
import { ContourMeasureIterJS } from "./contour";
import { PaintJS } from "./paint";

// This should contains all functions and variables that don't depend on the Web APIs
export abstract class CoreKit implements CanvasKit {
    /**
     * Constructs a Color with the same API as CSS's rgba(), that is
     * Internally, Colors are four unpremultiplied 32-bit floats: r, g, b, a.
     * In order to construct one with more precision or in a wider gamut,
     * use CanvasKit.Color4f().
     *
     * @param r - red value, clamped to [0, 255].
     * @param g - green value, clamped to [0, 255].
     * @param b - blue value, clamped to [0, 255].
     * @param a - alpha value, from 0 to 1.0. By default is 1.0 (opaque).
     */
    Color(r: number, g: number, b: number, a = 1): Float32Array {
        return new Float32Array([r / 255, g / 255, b / 255, a]);
    }

    /**
     * Construct a 4-float color. Float values are typically between 0.0 and 1.0.
     * @param r - red value.
     * @param g - green value.
     * @param b - blue value.
     * @param a - alpha value. By default is 1.0 (opaque).
     */
    Color4f(r: number, g: number, b: number, a?: number): Color {
        return Float32Array.of(r, g, b, a ?? 1);
    }

    /**
     * Constructs a Color as a 32 bit unsigned integer, with 8 bits assigned to each channel.
     * Channels are expected to be between 0 and 255 and will be clamped as such.
     * If a is omitted, it will be 255 (opaque).
     *
     * This is not the preferred way to use colors in Skia APIs, use Color or Color4f.
     * @param r - red value, clamped to [0, 255].
     * @param g - green value, clamped to [0, 255].
     * @param b - blue value, clamped to [0, 255].
     * @param a - alpha value, from 0 to 1.0. By default is 1.0 (opaque).
     */
    ColorAsInt(r: number, g: number, b: number, a?: number): ColorInt {
        const alpha = a === undefined ? 255 : a;
        // 合并颜色通道为一个 32 位无符号整数
        return (
            (clampColorComp(alpha) << 24 |
                clampColorComp(r) << 16 |
                clampColorComp(g) << 8 |
                clampColorComp(b)) >>> 0
        );
        // return colorAsInt(r, g, b, a);
    }

    /**
     * Returns a css style [r, g, b, a] where r, g, b are returned as
     * ints in the range [0, 255] and where a is scaled between 0 and 1.0.
     * [Deprecated] - this is trivial now that Color is 4 floats.
     */
    getColorComponents(c: Color): number[] {
        return [
            Math.floor(c[0] * 255),
            Math.floor(c[1] * 255),
            Math.floor(c[2] * 255),
            c[3],
        ];
    }

    /**
     * Returns a copy of the passed in color with a new alpha value applied.
     * [Deprecated] - this is trivial now that Color is 4 floats.
     */
    multiplyByAlpha(c: Color, alpha: number): Color {
        return Float32Array.of(c[0], c[1], c[2], (c[3] ?? 1) * alpha);
    }

    /**
     * Returns a rectangle with the given paramaters. See Rect.h for more.
     * @param left - The x coordinate of the upper-left corner.
     * @param top  - The y coordinate of the upper-left corner.
     * @param right - The x coordinate of the lower-right corner.
     * @param bottom - The y coordinate of the lower-right corner.
     */
    LTRBRect(left: number, top: number, right: number, bottom: number): Rect {
        return Float32Array.of(left, top, right, bottom)
    }
    /**
     * Returns a rectangle with the given paramaters. See Rect.h for more.
     * @param x - The x coordinate of the upper-left corner.
     * @param y  - The y coordinate of the upper-left corner.
     * @param width - The width of the rectangle.
     * @param height - The height of the rectangle.
     */
    XYWHRect(x: number, y: number, width: number, height: number): Rect {
        return Float32Array.of(x, y, x + width, y + height)
    }
    /**
     * Returns a rectangle with the given integer paramaters. See Rect.h for more.
     * @param left - The x coordinate of the upper-left corner.
     * @param top  - The y coordinate of the upper-left corner.
     * @param right - The x coordinate of the lower-right corner.
     * @param bottom - The y coordinate of the lower-right corner.
     */
    LTRBiRect(left: number, top: number, right: number, bottom: number): IRect {
        return Int32Array.of(left, top, right, bottom);
    }

    /**
     * Returns a rectangle with the given paramaters. See Rect.h for more.
     * @param x - The x coordinate of the upper-left corner.
     * @param y  - The y coordinate of the upper-left corner.
     * @param width - The width of the rectangle.
     * @param height - The height of the rectangle.
     */
    XYWHiRect(x: number, y: number, width: number, height: number): IRect {
        return Int32Array.of(x, y, x + width, y + height);
    }

    /**
     * Returns a rectangle with rounded corners consisting of the given rectangle and
     * the same radiusX and radiusY for all four corners.
     * @param rect - The base rectangle.
     * @param rx - The radius of the corners in the x direction.
     * @param ry - The radius of the corners in the y direction.
     */
    RRectXY(rect: InputRect, rx: number, ry: number): RRect {
        const _rect = normalizeArray(rect);
        return Float32Array.of(
            _rect[0],
            _rect[1],
            _rect[2],
            _rect[3],
            rx,
            ry,
            rx,
            ry,
            rx,
            ry,
            rx,
            ry
        );
    }

    /**
     * Generate bounding box for shadows relative to path. Includes both the ambient and spot
     * shadow bounds. This pairs with Canvas.drawShadow().
     * See SkShadowUtils.h for more details.
     * @param ctm - Current transformation matrix to device space.
     * @param path - The occluder used to generate the shadows.
     * @param zPlaneParams - Values for the plane function which returns the Z offset of the
     *                       occluder from the canvas based on local x and y values (the current
     *                       matrix is not applied).
     * @param lightPos - The 3D position of the light relative to the canvas plane. This is
     *                   independent of the canvas's current matrix.
     * @param lightRadius - The radius of the disc light.
     * @param flags - See SkShadowUtils.h; 0 means use default options.
     * @param dstRect - if provided, the bounds will be copied into this rect instead of allocating
     *                  a new one.
     * @returns The bounding rectangle or null if it could not be computed.
     */
    getShadowLocalBounds(ctm: InputMatrix, path: Path, zPlaneParams: InputVector3,
        lightPos: InputVector3, lightRadius: number, flags: number,
        dstRect?: Rect): Rect | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Malloc returns a TypedArray backed by the C++ memory of the
     * given length. It should only be used by advanced users who
     * can manage memory and initialize values properly. When used
     * correctly, it can save copying of data between JS and C++.
     * When used incorrectly, it can lead to memory leaks.
     * Any memory allocated by CanvasKit.Malloc needs to be released with CanvasKit.Free.
     *
     * const mObj = CanvasKit.Malloc(Float32Array, 20);
     * Get a TypedArray view around the malloc'd memory (this does not copy anything).
     * const ta = mObj.toTypedArray();
     * // store data into ta
     * const cf = CanvasKit.ColorFilter.MakeMatrix(ta); // mObj could also be used.
     *
     * // eventually...
     * CanvasKit.Free(mObj);
     *
     * @param typedArray - constructor for the typedArray.
     * @param len - number of *elements* to store.
     */
    Malloc(typedArray: TypedArrayConstructor, len: number): MallocObj {
        return new MallocObjJS(new typedArray(len));
    }

    /**
     * As Malloc but for GlyphIDs. This helper exists to make sure the JS side and the C++ side
     * stay in agreement with how wide GlyphIDs are.
     * @param len - number of GlyphIDs to make space for.
     */
    MallocGlyphIDs(len: number): MallocObj {
        return new MallocObjJS(new Uint16Array(len));
    }

    /**
     * Free frees the memory returned by Malloc.
     * Any memory allocated by CanvasKit.Malloc needs to be released with CanvasKit.Free.
     */
    Free(m: MallocObj): void { }

    // Surface related functions
    /**
     * Creates a Surface on a given canvas. If both GPU and CPU modes have been compiled in, this
     * will first try to create a GPU surface and then fallback to a CPU one if that fails. If just
     * the CPU mode has been compiled in, a CPU surface will be created.
     * @param canvas - either a canvas or a string with the DOM id of it.
     * @deprecated - Use MakeSWCanvasSurface, MakeWebGLCanvasSurface, or MakeGPUCanvasSurface.
     */
    MakeCanvasSurface(canvas: HTMLCanvasElement | OffscreenCanvas | string): Surface | null {
        const ctx = resolveContext(canvas);
        if (!ctx) {
            return null;
        }
        return new SurfaceJS(ctx);
    }

    /**
     * Creates a Raster (CPU) Surface that will draw into the provided Malloc'd buffer. This allows
     * clients to efficiently be able to read the current pixels w/o having to copy.
     * The length of pixels must be at least height * bytesPerRow bytes big.
     * @param ii
     * @param pixels
     * @param bytesPerRow - How many bytes are per row. This is at least width * bytesPerColorType. For example,
     *                      an 8888 ColorType has 4 bytes per pixel, so a 5 pixel wide 8888 surface needs at least
     *                      5 * 4 = 20 bytesPerRow. Some clients may have more than the usual to make the data line
     *                      up with a particular multiple.
     */
    MakeRasterDirectSurface(ii: ImageInfo, pixels: MallocObj, bytesPerRow: number): Surface | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a CPU backed (aka raster) surface.
     * @param canvas - either a canvas or a string with the DOM id of it.
     */
    MakeSWCanvasSurface(canvas: HTMLCanvasElement | OffscreenCanvas | string): Surface | null {
        return this.MakeCanvasSurface(canvas);
    }

    /**
     * A helper for creating a WebGL backed (aka GPU) surface and falling back to a CPU surface if
     * the GPU one cannot be created. This works for both WebGL 1 and WebGL 2.
     * @param canvas - Either a canvas or a string with the DOM id of it.
     * @param colorSpace - One of the supported color spaces. Default is SRGB.
     * @param opts - Options that will get passed to the creation of the WebGL context.
     */
    MakeWebGLCanvasSurface(canvas: HTMLCanvasElement | OffscreenCanvas | string,
        colorSpace?: ColorSpace, opts?: WebGLOptions): Surface | null {
        // const ctx = resolveContext(canvas, {
        //     colorSpace: colorSpace?.getNativeValue(),
        // });
        // if (!ctx) {
        //     return null;
        // }
        // return new SurfaceJS(ctx);
        return null;
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a CPU backed surface with the given dimensions, an SRGB colorspace, Unpremul
     * alphaType and 8888 color type. The pixels belonging to this surface  will be in memory and
     * not visible.
     * @param width - number of pixels of the width of the drawable area.
     * @param height - number of pixels of the height of the drawable area.
     */
    MakeSurface(width: number, height: number): Surface | null {
        const ctx = createTexture(width, height);
        return new SurfaceJS(ctx)
    }

    /**
     * Creates a WebGL Context from the given canvas with the given options. If options are omitted,
     * sensible defaults will be used.
     * @param canvas
     * @param opts
     */
    GetWebGLContext(canvas: HTMLCanvasElement, opts?: WebGLOptions): WebGLContextHandle {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Unable to get 2d context from canvas");
        }
        const id = ctxId++;
        this.contextes[id] = ctx;
        return id;
    }

    /**
     * Creates a GrDirectContext from the given WebGL Context.
     * @param ctx
     * @deprecated Use MakeWebGLContext instead.
     */
    MakeGrContext(ctx: WebGLContextHandle): GrDirectContext | null {
        throw new Error("Method not implemented.");
        return new GrDirectContextJS(this.contextes[ctx]);
    }

    /**
     * Creates a GrDirectContext from the given WebGL Context.
     * @param ctx
     */
    MakeWebGLContext(ctx: WebGLContextHandle): GrDirectContext | null {
        throw new Error("Method not implemented.");
        return new GrDirectContextJS(this.contextes[ctx]);
    }

    /**
     * Creates a Surface that will be drawn to the given GrDirectContext (and show up on screen).
     * @param ctx
     * @param width - number of pixels of the width of the visible area.
     * @param height - number of pixels of the height of the visible area.
     * @param colorSpace
     * @param sampleCount - sample count value from GL_SAMPLES. If not provided this will be looked up from
     *                      the canvas.
     * @param stencil - stencil count value from GL_STENCIL_BITS. If not provided this will be looked up
     *                  from the WebGL Context.
     */
    MakeOnScreenGLSurface(ctx: GrDirectContext, width: number, height: number,
        colorSpace: ColorSpace, sampleCount?: number, stencil?: number): Surface | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a context that operates over the given WebGPU Device.
     * @param device
     */
    MakeGPUDeviceContext(device: GPUDevice): WebGPUDeviceContext | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a Surface that draws to the given GPU texture.
     * @param ctx
     * @param texture - A texture that was created on the GPU device associated with `ctx`.
     * @param width - Width of the visible region in pixels.
     * @param height - Height of the visible region in pixels.
     * @param colorSpace
     */
    MakeGPUTextureSurface(ctx: WebGPUDeviceContext, texture: GPUTexture, width: number, height: number 
        colorSpace: ColorSpace): Surface | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates and configures a WebGPU context for the given canvas.
     * @param ctx
     * @param canvas
     * @param opts
     */
    MakeGPUCanvasContext(ctx: WebGPUDeviceContext, canvas: HTMLCanvasElement,
        opts?: WebGPUCanvasOptions): WebGPUCanvasContext | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a Surface backed by the next available texture in the swapchain associated with the
     * given WebGPU canvas context. The context must have been already successfully configured using
     * the same GPUDevice associated with `ctx`.
     * @param canvasContext - WebGPU context associated with the canvas. The canvas can either be an
     *                        on-screen HTMLCanvasElement or an OffscreenCanvas.
     * @param colorSpace
     * @param width - width of the visible region. If not present, the canvas width from `canvasContext`
     *                is used.
     * @param height - height of the visible region. If not present, the canvas width from `canvasContext`
     *                is used.
     */
    MakeGPUCanvasSurface(canvasContext: WebGPUCanvasContext, colorSpace: ColorSpace,
        width?: number, height?: number): Surface | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a (non-visible) Surface on the GPU. It has the given dimensions and uses 8888
     * color depth and premultiplied alpha. See Surface.h for more details.
     * @param ctx
     * @param width
     * @param height
     */
    MakeRenderTarget(ctx: GrDirectContext, width: number, height: number): Surface | null {
        throw new Error("Method not implemented.");
        // if (typeof args[0] === "number" && typeof args[1] === "number") {
        //     grCtx.ctx.canvas.width = args[0];
        //     grCtx.ctx.canvas.height = args[1];
        // } else if (typeof args[0] === "object") {
        //     grCtx.ctx.canvas.width = args[0].width;
        //     grCtx.ctx.canvas.height = args[0].height;
        // }
        // return new SurfaceJS(grCtx.ctx);
    }

    /**
     * Returns a (non-visible) Surface on the GPU. It has the settings provided by image info.
     * See Surface.h for more details.
     * @param ctx
     * @param info
     */
    MakeRenderTarget(ctx: GrDirectContext, info: ImageInfo): Surface | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a texture-backed image based on the content in src. It assumes the image is
     * RGBA_8888, unpremul and SRGB. This image can be re-used across multiple surfaces.
     *
     * Not available for software-backed surfaces.
     * @param src - CanvasKit will take ownership of the TextureSource and clean it up when
     *              the image is destroyed.
     * @param info - If provided, will be used to determine the width/height/format of the
     *               source image. If not, sensible defaults will be used.
     * @param srcIsPremul - set to true if the src data has premultiplied alpha. Otherwise, it will
     *         be assumed to be Unpremultiplied. Note: if this is true and info specifies
     *         Unpremul, Skia will not convert the src pixels first.
     */
    MakeLazyImageFromTextureSource(src: TextureSource, info?: ImageInfo | PartialImageInfo,
        srcIsPremul?: boolean): Image {
        throw new Error("Method not implemented.");
    }

    /**
     * Deletes the associated WebGLContext. Function not available on the CPU version.
     * @param ctx
     */
    deleteContext(ctx: WebGLContextHandle): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns the max size of the global cache for bitmaps used by CanvasKit.
     */
    getDecodeCacheLimitBytes(): number {
        throw new Error("Method not implemented.");
    }
    /**
     * Returns the current size of the global cache for bitmaps used by CanvasKit.
     */
    getDecodeCacheUsedBytes(): number {
        throw new Error("Method not implemented.");
    }

    /**
     * Sets the max size of the global cache for bitmaps used by CanvasKit.
     * @param size - number of bytes that can be used to cache bitmaps.
     */
    setDecodeCacheLimitBytes(size: number): void {
        throw new Error("Method not implemented.");
    }

    /**
     * Decodes the given bytes into an animated image. Returns null if the bytes were invalid.
     * The passed in bytes will be copied into the WASM heap, so the caller can dispose of them.
     *
     * The returned AnimatedImage will be "pointing to" the first frame, i.e. currentFrameDuration
     * and makeImageAtCurrentFrame will be referring to the first frame.
     * @param bytes
     */
    MakeAnimatedImageFromEncoded(bytes: Uint8Array | ArrayBuffer): AnimatedImage | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns an emulated Canvas2D of the given size.
     * @param width
     * @param height
     */
    MakeCanvas(width: number, height: number): EmulatedCanvas2D {
        const texture = createTexture(width, height);
        return new EmulatedCanvas2DJS(texture.canvas);
    }

    /**
     * Returns an image with the given pixel data and format.
     * Note that we will always make a copy of the pixel data, because of inconsistencies in
     * behavior between GPU and CPU (i.e. the pixel data will be turned into a GPU texture and
     * not modifiable after creation).
     *
     * @param info
     * @param bytes - bytes representing the pixel data.
     * @param bytesPerRow
     */
    MakeImage(info: ImageInfo, bytes: number[] | Uint8Array | Uint8ClampedArray,
        bytesPerRow: number): Image | null {

        const { width, height, colorSpace } = info
        // switch (colorSpace) {
        //     case "srgb":
        //     case "display-p3":
        //     case "adobe-rgb":
        //         break;
        //     default:
        //         throw new Error("Invalid color space");
        // }
        // const cs = colorSpace ?? "srgb";
        const imageData = new ImageData(
            bytes instanceof Uint8ClampedArray ? bytes : new Uint8ClampedArray(bytes),
            width,
            height,
            // {
            //     colorSpace: colorSpace
            //         ? (colorSpace as ColorSpaceJS).getNativeValue()
            //         : "srgb",
            // }
        );
        return new ImageJS(imageData);
    }

    /**
     * Return an Image backed by the encoded data, but attempt to defer decoding until the image
     * is actually used/drawn. This deferral allows the system to cache the result, either on the
     * CPU or on the GPU, depending on where the image is drawn.
     * This decoding uses the codecs that have been compiled into CanvasKit. If the bytes are
     * invalid (or an unrecognized codec), null will be returned. See Image.h for more details.
     * @param bytes
     */
    MakeImageFromEncoded(bytes: Uint8Array | ArrayBuffer): Image | null {
        throw new Error(
            `MakeImageFromEncoded in CanvasKit is synchronous and not supported on Web.
                Use MakeImageFromEncodedAsync instead.
                `
        );
    }

    /**
     * Returns an Image with the data from the provided CanvasImageSource (e.g. <img>). This will
     * use the browser's built in codecs, in that src will be drawn to a canvas and then readback
     * and placed into an Image.
     * @param src
     */
    MakeImageFromCanvasImageSource(src: CanvasImageSource): Image {
        return new ImageJS(src);
    }

    /**
     * Returns an SkPicture which has been serialized previously to the given bytes.
     * @param bytes
     */
    MakePicture(bytes: Uint8Array | ArrayBuffer): SkPicture | null {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns an Vertices based on the given positions and optional parameters.
     * See SkVertices.h (especially the Builder) for more details.
     * @param mode
     * @param positions
     * @param textureCoordinates
     * @param colors - either a list of int colors or a flattened color array.
     * @param indices
     * @param isVolatile
     */
    MakeVertices(mode: VertexMode, positions: InputFlattenedPointArray,
        textureCoordinates?: InputFlattenedPointArray | null,
        colors?: Float32Array | ColorIntArray | null, indices?: number[] | null,
        isVolatile?: boolean): Vertices {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a Skottie animation built from the provided json string.
     * Requires that Skottie be compiled into CanvasKit.
     * @param json
     */
    MakeAnimation(json: string): SkottieAnimation {
        throw new Error("Skottie is not available");
    }

    /**
     * Returns a managed Skottie animation built from the provided json string and assets.
     * Requires that Skottie be compiled into CanvasKit.
     * @param json
     * @param assets - a dictionary of named blobs: { key: ArrayBuffer, ... }
     * @param filterPrefix - an optional string acting as a name filter for selecting "interesting"
     *                       Lottie properties (surfaced in the embedded player controls)
     * @param soundMap - an optional mapping of sound identifiers (strings) to AudioPlayers.
     *                   Only needed if the animation supports sound.
     */
    MakeManagedAnimation(json: string, assets?: Record<string, ArrayBuffer>,
        filterPrefix?: string, soundMap?: SoundMap): ManagedSkottieAnimation {
        throw new Error("Skottie is not available");

    }

    // Constructors, i.e. things made with `new CanvasKit.Foo()`;
    //readonly ImageData = ImageDataConstructor;
    readonly ParagraphStyle =  _ParagraphStyle;
    readonly ContourMeasureIter: ContourMeasureIterConstructor = ContourMeasureIterJS
    readonly Font: FontConstructor = _Font;
    readonly Paint: DefaultConstructor<Paint> = PaintJS
    readonly Path: PathConstructorAndFactory = PathJS
    readonly PictureRecorder: DefaultConstructor<PictureRecorder> = PictureRecorderJS
    readonly TextStyle: TextStyleConstructor = _TextStyle
    // readonly SlottableTextProperty: SlottableTextPropertyConstructor;

    // Factories, i.e. things made with CanvasKit.Foo.MakeTurboEncabulator()
    readonly ParagraphBuilder = _ParagraphBuilder; //new _ParagraphBuilderFactory();
    readonly Blender: BlenderFactory = BlenderJs;
    readonly ColorFilter: ColorFilterFactory = ColorFilterJS
    readonly FontCollection = _FontCollection; // new _FontCollectionFactory();
    readonly FontMgr = _FontMgr; //new _FontMgrFactory();
    readonly ImageFilter: ImageFilterFactory = ImageFilterJS;
    readonly MaskFilter: MaskFilterFactory = MaskFilterJS
    readonly PathEffect: PathEffectFactory = PathEffectFactoryJS
    readonly RuntimeEffect: RuntimeEffectFactory = RuntimeEffectJS
    readonly Shader: ShaderFactory = ShaderJS
    readonly TextBlob: TextBlobFactory = TextBlobJS
    readonly Typeface: TypefaceFactory = _Typeface ; //new _TypefaceFactory();
    readonly TypefaceFontProvider = _TypefaceFontProvider; //new _TypefaceFontProviderFactory();

    // Misc
    readonly ColorMatrix = ColorMatrixHelpers;
    readonly Matrix = Matrix3;
    readonly  M44 = Matrix4;
    readonly Vector = VectorHelpers;

    // Core Enums
    AlphaType = AlphaTypeEnum;
    BlendMode = BlendModeEnum;
    BlurStyle = BlurStyleEnum;
    ClipOp = ClipOpEnum;
    ColorChannel = ColorChannelEnum;
    ColorType = ColorTypeEnum;
    FillType = FillTypeEnum;
    FilterMode = FilterModeEnum;
    FontEdging = FontEdgingEnum;
    FontHinting = FontHintingEnum;
    // GlyphRunFlags = GlyphRunFlag;
    ImageFormat = ImageFormatEnum;
    MipmapMode = MipmapModeEnum;
    PaintStyle = PaintStyleEnum;
    Path1DEffect = Path1DEffectStyleEnum;
    PathOp = PathOpEnum;
    PointMode = PointModeEnum;
    ColorSpace = ColorSpaceEnum;
    StrokeCap = StrokeCapEnum;
    StrokeJoin = StrokeJoinEnum;
    TileMode = TileModeEnum;
    VertexMode = VertexModeEnum;
    InputState = InputStateEnum;
    ModifierKey = ModifierKeyEnum;

    // Core Constants
    TRANSPARENT: Color = Float32Array.of(0, 0, 0, 0);
    BLACK: Color = Float32Array.of(0, 0, 0, 1);
    WHITE: Color = Float32Array.of(1, 1, 1, 1);
    RED: Color = Float32Array.of(1, 0, 0, 1);
    GREEN: Color = Float32Array.of(0, 1, 0, 1);
    BLUE: Color = Float32Array.of(0, 0, 1, 1);
    YELLOW: Color = Float32Array.of(1, 1, 0, 1);
    CYAN: Color = Float32Array.of(0, 1, 1, 1);
    MAGENTA: Color = Float32Array.of(1, 0, 1, 1);

    MOVE_VERB = PathVerb.Move;
    LINE_VERB = PathVerb.Line;
    QUAD_VERB = PathVerb.Quad;
    CONIC_VERB = PathVerb.Conic;
    CUBIC_VERB = PathVerb.Cubic;
    CLOSE_VERB = PathVerb.Close;

    SaveLayerInitWithPrevious: SaveLayerFlag = 1 << 2;
    SaveLayerF16ColorType: SaveLayerFlag = 1 << 4;

    /**
     * Use this shadow flag to indicate the occluding object is not opaque. Knowing that the
     * occluder is opaque allows us to cull shadow geometry behind it and improve performance.
     */
    ShadowTransparentOccluder: number = 1;
    /**
     * Use this shadow flag to not use analytic shadows.
     */
    readonly ShadowGeometricOnly: number = 2;
    /**
     * Use this shadow flag to indicate the light position represents a direction and light radius
     * is blur radius at elevation 1.
     */
    readonly ShadowDirectionalLight: number = 4;

    gpu = false // true if GPU code was compiled in
    managed_skottie = false  // true if advanced (managed) Skottie code was compiled in
    rt_effect = false  // true if RuntimeEffect was compiled in
    skottie = false  // true if base Skottie code was compiled in

    // Paragraph Enums
    Affinity = AffinityEnum
    DecorationStyle = DecorationStyleEnum
    FontSlant = FontSlantEnum
    FontWeight = FontWeightEnum
    FontWidth = FontWidthEnum
    PlaceholderAlignment = PlaceholderAlignmentEnum
    RectHeightStyle = RectHeightStyleEnum
    RectWidthStyle = RectWidthStyleEnum
    TextAlign = TextAlignEnum
    TextBaseline = TextBaselineEnum
    TextDirection = TextDirectionEnum
    TextHeightBehavior = TextHeightBehaviorEnum

    // other enums
    VerticalTextAlign = VerticalTextAlignEnum
    ResizePolicy = ResizePolicyEnum

    // Paragraph Constants
    NoDecoration: number;
    UnderlineDecoration: number;
    OverlineDecoration: number;
    LineThroughDecoration: number;
}