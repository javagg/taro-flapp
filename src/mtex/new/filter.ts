import { SkEmbindObject } from "../bass";
import type {
    ImageFilter, InputMatrix, IRect, Rect, BlendMode,
    ImageFilterFactory as CKImageFilterFactory,
    MaskFilterFactory as CKMaskFilterFactory,
    Color,
    ColorChannel,
    CubicResampler,
    FilterOptions,
    Image,
    Shader,
    TileMode,
    BlurStyle,
} from "../canvaskit";
import { ColorFilter, MaskFilter } from "../canvaskit";
import { makeBlur } from "./svg";

export abstract class ImageFilterJS
    extends SkEmbindObject<"ImageFilter">
    //   extends NativeFilter<"ImageFilter">
    implements ImageFilter {
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

export class BlurImageFilter extends ImageFilterJS {
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

//   export class ComposeImageFilter extends ImageFilterJS {
//     constructor(
//       outer: NativeFilter<string> | null,
//       inner: NativeFilter<string> | null
//     ) {
//       super();
//       if (inner) {
//         // The input here is SourceGraphic but it should be result
//         this._filters.push(...inner.filters);
//       }
//       if (outer) {
//         this._filters.push(...outer.filters);
//       }
//     }
//   }


export abstract class ColorFilterJS extends SkEmbindObject<"ColorFilter">
//   extends NativeFilter<"ColorFilter">
//   implements ColorFilter
{
    constructor() {
        super("ColorFilter");
    }
}

export const ImageFilterFactory: CKImageFilterFactory = {
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
    MakeBlend(blend: BlendMode, background: ImageFilter | null,
        foreground: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    /**
     * Create a filter that blurs its input by the separate X and Y sigmas. The provided tile mode
     * is used when the blur kernel goes outside the input image.
     *
     * @param sigmaX - The Gaussian sigma value for blurring along the X axis.
     * @param sigmaY - The Gaussian sigma value for blurring along the Y axis.
     * @param mode
     * @param input - if null, it will use the dynamic source image (e.g. a saved layer)
     */
    MakeBlur: function (sigmaX: number, sigmaY: number, mode: TileMode, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeColorFilter: function (cf: ColorFilter, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeCompose: function (outer: ImageFilter | null, inner: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeDilate: function (radiusX: number, radiusY: number, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeDisplacementMap: function (xChannel: ColorChannel, yChannel: ColorChannel, scale: number, displacement: ImageFilter | null, color: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeDropShadow: function (dx: number, dy: number, sigmaX: number, sigmaY: number, color: Color, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeDropShadowOnly: function (dx: number, dy: number, sigmaX: number, sigmaY: number, color: Color, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeErode: function (radiusX: number, radiusY: number, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeImage: function (img: Image, sampling: FilterOptions | CubicResampler): ImageFilter | null {
        throw new Error("Function not implemented.");
    },
    MakeMatrixTransform: function (matr: InputMatrix, sampling: FilterOptions | CubicResampler, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeOffset: function (dx: number, dy: number, input: ImageFilter | null): ImageFilter {
        throw new Error("Function not implemented.");
    },
    MakeShader: function (shader: Shader): ImageFilter {
        throw new Error("Function not implemented.");
    }
}


export abstract class MaskFilterJS extends SkEmbindObject<"MaskFilter"> implements MaskFilter {
    
}
export class BlurMaskFilter extends MaskFilterJS {
    constructor(readonly style: BlurStyle, readonly sigma: number) {
      super("MaskFilter");
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

  export const MaskFilterFactory: CKMaskFilterFactory = {
    /**
     * Create a blur maskfilter
     * @param style
     * @param sigma - Standard deviation of the Gaussian blur to apply. Must be > 0.
     * @param respectCTM - if true the blur's sigma is modified by the CTM.
     */
    MakeBlur(style: BlurStyle, sigma: number, respectCTM: boolean): MaskFilter {
      return new BlurMaskFilter(style, sigma);
    },
  };
  