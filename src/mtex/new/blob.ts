import { SkEmbindObject } from "../bass";
import { TextBlob } from "../canvaskit";

export class TextBlobJS extends SkEmbindObject<"TextBlob"> implements TextBlob {

    /**
 * Return a TextBlob with a single run of text.
 *
 * It does not perform typeface fallback for characters not found in the Typeface.
 * It does not perform kerning or other complex shaping; glyphs are positioned based on their
 * default advances.
 * @param glyphs - if using Malloc'd array, be sure to use CanvasKit.MallocGlyphIDs().
 * @param font
 */
    static MakeFromGlyphs(glyphs: InputGlyphIDArray, font: Font): TextBlob {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a TextBlob built from a single run of text with rotation, scale, and translations.
     *
     * It uses the default character-to-glyph mapping from the typeface in the font.
     * @param str
     * @param rsxforms
     * @param font
     */
    static MakeFromRSXform(str: string, rsxforms: InputFlattenedRSXFormArray, font: Font): TextBlob {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a TextBlob built from a single run of text with rotation, scale, and translations.
     *
     * @param glyphs - if using Malloc'd array, be sure to use CanvasKit.MallocGlyphIDs().
     * @param rsxforms
     * @param font
     */
    static MakeFromRSXformGlyphs(glyphs: InputGlyphIDArray, rsxforms: InputFlattenedRSXFormArray,
        font: Font): TextBlob {
        throw new Error("Method not implemented.");
    }

    /**
     * Return a TextBlob with a single run of text.
     *
     * It uses the default character-to-glyph mapping from the typeface in the font.
     * It does not perform typeface fallback for characters not found in the Typeface.
     * It does not perform kerning or other complex shaping; glyphs are positioned based on their
     * default advances.
     * @param str
     * @param font
     */
    static MakeFromText(str: string, font: Font): TextBlob {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns a TextBlob that has the glyphs following the contours of the given path.
     *
     * It is a convenience wrapper around MakeFromRSXform and ContourMeasureIter.
     * @param str
     * @param path
     * @param font
     * @param initialOffset - the length in pixels to start along the path.
     */
    static MakeOnPath(str: string, path: Path, font: Font, initialOffset?: number): TextBlob {
        throw new Error("Method not implemented.");
    }

    constructor(public readonly width: number, public readonly height: number) {
        super("TextBlob");
    }
}