import type {
  TextBlobFactory as CKTextBlobFactory,
  Font,
  InputFlattenedRSXFormArray,
  InputGlyphIDArray,
  Path,
  TextBlob,
} from "canvaskit-wasm";

export const TextBlobFactory: CKTextBlobFactory = {
  /**
 * Return a TextBlob with a single run of text.
 *
 * It does not perform typeface fallback for characters not found in the Typeface.
 * It does not perform kerning or other complex shaping; glyphs are positioned based on their
 * default advances.
 * @param glyphs - if using Malloc'd array, be sure to use CanvasKit.MallocGlyphIDs().
 * @param font
 */
  MakeFromGlyphs: function (_glyphs: InputGlyphIDArray, _font: Font): TextBlob {
    throw new Error("MakeFromGlyphs not implemented.");
  },

  /**
 * Returns a TextBlob built from a single run of text with rotation, scale, and translations.
 *
 * It uses the default character-to-glyph mapping from the typeface in the font.
 * @param str
 * @param rsxforms
 * @param font
 */
  MakeFromRSXform: function (
    _str: string,
    _rsxforms: InputFlattenedRSXFormArray,
    _font: Font
  ): TextBlob {
    throw new Error("Function not implemented.");
  },

  /**
 * Returns a TextBlob built from a single run of text with rotation, scale, and translations.
 *
 * @param glyphs - if using Malloc'd array, be sure to use CanvasKit.MallocGlyphIDs().
 * @param rsxforms
 * @param font
 */
  MakeFromRSXformGlyphs: function (
    _glyphs: InputGlyphIDArray,
    _rsxforms: InputFlattenedRSXFormArray,
    _font: Font
  ): TextBlob {
    throw new Error("Function not implemented.");
  },

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
  MakeFromText: function (_str: string, _font: Font): TextBlob {
    throw new Error("Function not implemented.");
  },

  /**
 * Returns a TextBlob that has the glyphs following the contours of the given path.
 *
 * It is a convenience wrapper around MakeFromRSXform and ContourMeasureIter.
 * @param str
 * @param path
 * @param font
 * @param initialOffset - the length in pixels to start along the path.
 */
  MakeOnPath: function (
    _str: string,
    _path: Path,
    _font: Font,
    _initialOffset?: number | undefined
  ): TextBlob {
    throw new Error("Function not implemented.");
  },
};
