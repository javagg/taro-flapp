import { SkEmbindObject } from "../bass";
import type {
    ImageFilter, ColorFilter, MaskFilter,
    InputMatrix, IRect, Rect, BlendMode,
    Color,
    ColorChannel,
    CubicResampler,
    FilterOptions,
    Image,
    Shader,
    TileMode,
    BlurStyle,
    InputColor,
    ColorSpace,
    InputRect,
    InputColorMatrix,
} from "../canvaskit";
import { makeBlur } from "./c2d";

export class ImageFilterJS extends SkEmbindObject<"ImageFilter"> implements ImageFilter {

    /**
    * Create a filter that takes a BlendMode and uses it to composite the two filters together.
    *
    *  At least one of background and foreground should be non-null in nearly all circumstances.
    *
    *  @param blend       The blend mode that defines the compositing operation
    *  @param background The Dst pixels used in blending; if null, use the dynamic source image
    *                    (e.g. a saved layer).
    *  @param foreground The Src pixels used in blending; if null, use the dynamic source image.
    */
    static MakeBlend(blend: BlendMode, background: ImageFilter | null, foreground: ImageFilter | null): ImageFilter {
        throw new Error("MakeBlend not implemented.");
    }

    /**
    * Create a filter that blurs its input by the separate X and Y sigmas. The provided tile mode
    * is used when the blur kernel goes outside the input image.
    *
    * @param sigmaX - The Gaussian sigma value for blurring along the X axis.
    * @param sigmaY - The Gaussian sigma value for blurring along the Y axis.
    * @param mode
    * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
    */
    static MakeBlur(sigmaX: number, sigmaY: number, mode: TileMode,
        input: ImageFilter | null): ImageFilter {
        // throw new Error("Method not implemented.");
        return new BlurImageFilter(sigmaX, sigmaY, input as ImageFilterJS);
    }

    /**
    * Create a filter that applies the color filter to the input filter results.
    * @param cf
    * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
    */
    static MakeColorFilter(cf: ColorFilter, input: ImageFilter | null): ImageFilter {
        // throw new Error("Method not implemented.");
        return new ComposeImageFilter(cf, input);
    }

    /**
    * Create a filter that composes 'inner' with 'outer', such that the results of 'inner' are
    * treated as the source bitmap passed to 'outer'.
    * If either param is null, the other param will be returned.
    * @param outer
    * @param inner - if null, it will use the dynamic source image (e.g. a saved layer)
    */
    static MakeCompose(outer: ImageFilter | null, inner: ImageFilter | null): ImageFilter {
        // throw new Error("Method not implemented.");
        return new ComposeImageFilter(outer, inner);
    }

    /**
    *  Create a filter that dilates each input pixel's channel values to the max value within the
    *  given radii along the x and y axes.
    *  @param radiusX  The distance to dilate along the x axis to either side of each pixel.
    *  @param radiusY  The distance to dilate along the y axis to either side of each pixel.
    *  @param input     if null, it will use the dynamic source image (e.g. a saved layer).
    */
    static MakeDilate(radiusX: number, radiusY: number, input: ImageFilter | null): ImageFilter {
        throw new Error("Method not implemented.");
    }

    /**
    *  Create a filter that moves each pixel in its color input based on an (x,y) vector encoded
    *  in its displacement input filter. Two color components of the displacement image are
    *  mapped into a vector as scale * (color[xChannel], color[yChannel]), where the channel
    *  selectors are one of R, G, B, or A.
    *  The mapping takes the 0-255 RGBA values of the image and scales them to be [-0.5 to 0.5],
    *  in a similar fashion to https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap
    *
    *  At least one of displacement and color should be non-null in nearly all circumstances.
    *
    *  @param xChannel RGBA channel that encodes the x displacement per pixel.
    *  @param yChannel RGBA channel that encodes the y displacement per pixel.
    *  @param scale    Scale applied to displacement extracted from image.
    *  @param displacement The filter defining the displacement image, or null to use source.
    *  @param color   The filter providing the color pixels to be displaced, or null to use source.
    */
    static MakeDisplacementMap(xChannel: ColorChannel, yChannel: ColorChannel, scale: number,
        displacement: ImageFilter | null, color: ImageFilter | null): ImageFilter {
        // no flutter
        throw new Error("Method not implemented.");
    }
    /**
    *  Create a filter that draws a drop shadow under the input content. This filter produces an
    *  image that includes the inputs' content.
    *  @param dx       The X offset of the shadow.
    *  @param dy       The Y offset of the shadow.
    *  @param sigmaX   The blur radius for the shadow, along the X axis.
    *  @param sigmaY   The blur radius for the shadow, along the Y axis.
    *  @param color    The color of the drop shadow.
    *  @param input    The input filter; if null, it will use the dynamic source image.
    */
    static MakeDropShadow(dx: number, dy: number, sigmaX: number, sigmaY: number, color: Color,
        input: ImageFilter | null): ImageFilter {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
    *  Just like MakeDropShadow, except the input content is not in the resulting image.
    *  @param dx       The X offset of the shadow.
    *  @param dy       The Y offset of the shadow.
    *  @param sigmaX   The blur radius for the shadow, along the X axis.
    *  @param sigmaY   The blur radius for the shadow, along the Y axis.
    *  @param color    The color of the drop shadow.
    *  @param input    The input filter; if null, it will use the dynamic source image.
    */
    static MakeDropShadowOnly(dx: number, dy: number, sigmaX: number, sigmaY: number, color: Color,
        input: ImageFilter | null): ImageFilter {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
    *  Create a filter that erodes each input pixel's channel values to the minimum channel value
    *  within the given radii along the x and y axes.
    *  @param radiusX  The distance to erode along the x axis to either side of each pixel.
    *  @param radiusY  The distance to erode along the y axis to either side of each pixel.
    *  @param input     if null, it will use the dynamic source image (e.g. a saved layer).
    */
    static MakeErode(radiusX: number, radiusY: number, input: ImageFilter | null): ImageFilter {
        throw new Error("Method not implemented.");
    }

    /**
    *  Create a filter using the given image as a source. Returns null if 'image' is null.
    *
    *  @param img      The image that is output by the filter, subset by 'srcRect'.
    *  @param sampling The sampling to use when drawing the image.
    */
    static MakeImage(img: Image, sampling: FilterOptions | CubicResampler): ImageFilter | null {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
    *  Create a filter that draws the 'srcRect' portion of image into 'dstRect' using the given
    *  filter quality. Similar to Canvas.drawImageRect. Returns null if 'image' is null.
    *
    *  @param img      The image that is output by the filter, subset by 'srcRect'.
    *  @param sampling The sampling to use when drawing the image.
    *  @param srcRect  The source pixels sampled into 'dstRect'.
    *  @param dstRect  The local rectangle to draw the image into.
    */
    static MakeImage(img: Image, sampling: FilterOptions | CubicResampler,
        srcRect: InputRect, dstRect: InputRect): ImageFilter | null {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
    * Create a filter that transforms the input image by 'matrix'. This matrix transforms the
    * local space, which means it effectively happens prior to any transformation coming from the
    * Canvas initiating the filtering.
    * @param matr
    * @param sampling
    * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
    */
    static MakeMatrixTransform(matr: InputMatrix, sampling: FilterOptions | CubicResampler,
        input: ImageFilter | null): ImageFilter {
        throw new Error("Method not implemented.");
    }

    /**
    *  Create a filter that offsets the input filter by the given vector.
    *  @param dx       The x offset in local space that the image is shifted.
    *  @param dy       The y offset in local space that the image is shifted.
    *  @param input    The input that will be moved, if null, will use the dynamic source image.
    */
    static MakeOffset(dx: number, dy: number, input: ImageFilter | null): ImageFilter {
        // no flutter
        throw new Error("Method not implemented.");
    }

    /**
    * Transforms a shader into an image filter
    *
    * @param shader - The Shader to be transformed
    */
    static MakeShader(shader: Shader): ImageFilter {
        // no flutter
        throw new Error("Method not implemented.");
    }

    constructor() {
        super("ImageFilter");
    }

    /**
     * Returns an IRect that is the updated bounds of inputRect after this
     * filter has been applied.
     *
     * @param drawBounds - The local (pre-transformed) bounding box of the
     *        geometry being drawn _before_ the filter is applied.
     * @param ctm - If provided, the current transform at the time the filter
     *        would be used.
     * @param outputRect - If provided, the result will be output to this array
     *        rather than allocating a new one.
     * @returns an IRect describing the updated bounds.
     */
    getOutputBounds(
        drawBounds: Rect,
        ctm?: InputMatrix,
        outputRect?: IRect
    ): IRect {
        throw new Error("Method not implemented.");
    }
}

class BlurImageFilter extends ImageFilterJS {
    constructor(
        readonly sigmaX: number,
        readonly sigmaY: number,
        readonly input: ImageFilterJS | null = null
    ) {
        super();
        const blur = makeBlur(sigmaX, sigmaY);
        //   this._filters.push(blur);
        //   if (input) {
        //     this._filters.push(...input.filters);
        //   }
    }
}

export class ComposeImageFilter extends ImageFilterJS {
        constructor(
          outer: NativeFilter<string> | null,
          inner: NativeFilter<string> | null
        ) {
          super();
    //       if (inner) {
    //         // The input here is SourceGraphic but it should be result
    //         this._filters.push(...inner.filters);
    //       }
    //       if (outer) {
    //         this._filters.push(...outer.filters);
    //       }
        }
}

export class ColorFilterJS extends SkEmbindObject<"ColorFilter"> implements ColorFilter {
    /**
     * Makes a color filter with the given color, blend mode, and colorSpace.
     * @param color
     * @param mode
     * @param colorSpace - If omitted, will use SRGB
     */
    static MakeBlend(color: InputColor, mode: BlendMode, colorSpace?: ColorSpace): ColorFilter {
        throw new Error("Function not implemented.");
    }
    /**
     * Makes a color filter composing two color filters.
     * @param outer
     * @param inner
     */
    static MakeCompose(outer: ColorFilter, inner: ColorFilter): ColorFilter {
        throw new Error("Function not implemented.");
    }

    /**
     * Makes a color filter that is linearly interpolated between two other color filters.
     * @param t - a float in the range of 0.0 to 1.0.
     * @param dst
     * @param src
     */
    static MakeLerp(t: number, dst: ColorFilter, src: ColorFilter): ColorFilter {
        throw new Error("Function not implemented.");
    }

    /**
     * Makes a color filter that converts between linear colors and sRGB colors.
     */
    static MakeLinearToSRGBGamma(): ColorFilter {
        throw new Error("Function not implemented.");
    }

    /**
     * Creates a color filter using the provided color matrix.
     * @param cMatrix
     */
    static MakeMatrix(cMatrix: InputColorMatrix): ColorFilter {
        throw new Error("Function not implemented.");
    }

    /**
     * Makes a color filter that converts between sRGB colors and linear colors.
     */
    static MakeSRGBToLinearGamma(): ColorFilter {
        throw new Error("Function not implemented.");
    }

    /**
     * Makes a color filter that multiplies the luma of its input into the alpha channel,
     * and sets the red, green, and blue channels to zero.
     */
    static MakeLuma(): ColorFilter {
        throw new Error("Function not implemented.");
    }

    constructor() {
        super("ColorFilter");
    }
}

export class MaskFilterJS extends SkEmbindObject<"MaskFilter"> implements MaskFilter {

    /**
     * Create a blur maskfilter
     * @param style
     * @param sigma - Standard deviation of the Gaussian blur to apply. Must be > 0.
     * @param respectCTM - if true the blur's sigma is modified by the CTM.
     */
    static MakeBlur(style: BlurStyle, sigma: number, respectCTM: boolean): MaskFilter {
        return new BlurMaskFilter(style, sigma);
    }

    constructor() {
        super("MaskFilter");
    }
}

export class BlurMaskFilter extends MaskFilterJS {
    constructor(readonly style: BlurStyle, readonly sigma: number) {
        super()
        const blur = makeBlur(sigma, sigma);
        //   this._filters.push(blur);
        //   if (this.style === BlurStyleEnum.Solid) {
        //     this._filters.push(makeMerge([blur, SourceGraphic]));
        //   } else if (this.style === BlurStyleEnum.Outer) {
        //     this._filters.push(makeComposite(blur, SourceGraphic, "out"));
        //   } else if (this.style === BlurStyleEnum.Inner) {
        //     this._filters.push(makeComposite(blur, SourceGraphic, "in"));
        //   }
    }
}