import { SkEmbindObject } from "../bass";
import type {
    ColorSpace,
    EncodedImageFormat,
    FilterMode,
    Image,
    ImageInfo,
    InputMatrix,
    MallocObj,
    MipmapMode,
    PartialImageInfo,
    Shader,
    TileMode,
} from "../canvaskit";

// import { ImageFormatEnum } from "./Core";
// import { HostObject } from "./HostObject";
// import { createTexture } from "./Core/Platform";
// import { ImageShader } from "./Shader/ImageShader";

const dataURLToByteArray = (dataUrl: string) => {
    // split the data URL at the comma to separate the metadata from the data
    const split = dataUrl.split(",");
    if (split.length !== 2) {
        throw new Error("Invalid data URL.");
    }

    // decode the base64 data to a string
    const decoded = atob(split[1]);

    // convert the string to a byte array
    const byteArray = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
        byteArray[i] = decoded.charCodeAt(i);
    }

    return byteArray;
};

/**
 * See SkImage.h for more information on this class.
 */
export class ImageJS extends SkEmbindObject<"Image"> implements Image {
    private image: HTMLCanvasElement;

    constructor(source: CanvasImageSource | ImageData) {
        super("Image");
        if (source instanceof HTMLCanvasElement) {
            this.image = source;
        } else {
            const width =
                typeof source.width === "number"
                    ? source.width
                    : source.width.animVal.value;
            const height =
                typeof source.height === "number"
                    ? source.height
                    : source.height.animVal.value;
            const ctx = createTexture(width, height);
            this.image = ctx.canvas;
            if (source instanceof ImageData) {
                ctx.putImageData(source, 0, 0);
            } else {
                ctx.drawImage(source, 0, 0);
            }
        }
    }

    getImage() {
        return this.image;
    }

    /**
     * Encodes this image's pixels to the specified format and returns them. Must be built with
     * the specified codec. If the options are unspecified, sensible defaults will be
     * chosen.
     * @param fmt - PNG is the default value.
     * @param quality - a value from 0 to 100; 100 is the least lossy. May be ignored.
     */
    encodeToBytes(fmt?: EncodedImageFormat, quality?: number): Uint8Array | null {
        // Get a data URL.
        let mime = "image/png";
        if (fmt?.value === ImageFormatEnum.JPEG) {
            mime = "image/jpeg";
        } else if (fmt?.value === ImageFormatEnum.WEBP) {
            mime = "image/webp";
        }
        const dataUrl = this.image.toDataURL(mime, quality);
        return dataURLToByteArray(dataUrl);
    }

    /**
     * Returns the color space associated with this object.
     * It is the user's responsibility to call delete() on this after it has been used.
     */
    getColorSpace(): ColorSpace {
        throw new Error("getColorSpace not implemented.");
    }

    /**
   * Returns the width, height, colorType and alphaType associated with this image.
   * Colorspace is separate so as to not accidentally leak that memory.
   */
    getImageInfo(): PartialImageInfo {
        return {
            alphaType: { value: 2 },
            colorType: { value: 2 },
            height: this.image.height,
            width: this.image.width,
        };
    }

    /**
   * Return the height in pixels of the image.
   */
    height(): number {
        return this.image.height;
    }
    /**
   * Returns an Image with the same "base" pixels as the this image, but with mipmap levels
   * automatically generated and attached.
   */
    makeCopyWithDefaultMipmaps(): Image {
        return new ImageJS(this.image);
    }

    /**
     * Returns this image as a shader with the specified tiling. It will use cubic sampling.
     * @param tx - tile mode in the x direction.
     * @param ty - tile mode in the y direction.
     * @param B - See CubicResampler in SkSamplingOptions.h for more information
     * @param C - See CubicResampler in SkSamplingOptions.h for more information
     * @param localMatrix
     */
    makeShaderCubic(tx: TileMode, ty: TileMode, B: number, C: number,
        localMatrix?: InputMatrix): Shader {
        throw new Error("Method not implemented.");
        return new ImageShader(this.image, localMatrix);
    }
    /**
     * Returns this image as a shader with the specified tiling. It will use cubic sampling.
     * @param tx - tile mode in the x direction.
     * @param ty - tile mode in the y direction.
     * @param fm - The filter mode.
     * @param mm - The mipmap mode. Note: for settings other than None, the image must have mipmaps
     *             calculated with makeCopyWithDefaultMipmaps;
     * @param localMatrix
     */
    makeShaderOptions(tx: TileMode, ty: TileMode, fm: FilterMode, mm: MipmapMode,
        localMatrix?: InputMatrix): Shader {
        throw new Error("Method not implemented.");
        return new ImageShader(this.image, localMatrix);
    }

    /**
     * Returns a TypedArray containing the pixels reading starting at (srcX, srcY) and does not
     * exceed the size indicated by imageInfo. See SkImage.h for more on the caveats.
     *
     * If dest is not provided, we allocate memory equal to the provided height * the provided
     * bytesPerRow to fill the data with.
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
   * Return the width in pixels of the image.
   */
    width(): number {
        return this.image.width;
    }
}
