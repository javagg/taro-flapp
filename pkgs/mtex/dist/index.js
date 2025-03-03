import { colorToHex, convertToUpwardToPixelRatio, isEnglishWord, isPunctuation, isSquareCharacter, } from "./util";
import { default as layoutEngine, bidi, fromFragments, linebreaker, justification, scriptItemizer, textDecoration, fontSubstitution, } from '@react-pdf/textkit';
import FontStore from '@react-pdf/font';
export class SkEmbindObject {
    constructor(_type) {
        this._type = _type;
        this._deleted = false;
    }
    delete() {
        this._deleted = true;
    }
    deleteLater() {
        this._deleted = true;
    }
    isAliasOf(other) {
        return other._type === this._type;
    }
    isDeleted() {
        return this._deleted;
    }
}
export class _ParagraphBuilderFactory {
    /**
     * Creates a ParagraphBuilder using the fonts available from the given font provider.
     * @param style
     * @param fontSrc
     */
    MakeFromFontProvider(style, fontSrc) {
        throw new Error("MakeFromFontProvider not implemented.");
    }
    /**
     * Return a shaped array of lines
     */
    ShapeText(text, runs, width) {
        throw new Error("ShapeText not implemented.");
    }
    /**
     * Creates a ParagraphBuilder using the fonts available from the given font manager.
     * @param style
     * @param fontManager
     */
    Make(style, fontManager) {
        return this.MakeFromFontCollection(style, new _FontCollection());
    }
    /**
     * Creates a ParagraphBuilder using the given font collection.
     * @param style
     * @param fontCollection
     */
    MakeFromFontCollection(style, fontCollection) {
        return new _ParagraphBuilder(style);
    }
    /**
     * Whether the paragraph builder requires ICU data to be provided by the
     * client.
     */
    RequiresClientICU() {
        return false;
    }
}
export class _FontCollection extends SkEmbindObject {
    constructor() {
        super("FontCollection");
    }
    setDefaultFontManager(fontManager) { }
    enableFontFallback() { }
}
export class _FontCollectionFactory {
    Make() {
        return new _FontCollection();
    }
}
export class _FontMgr extends SkEmbindObject {
    /**
    * Return the number of font families loaded in this manager. Useful for debugging.
    */
    constructor() {
        super("FontMgr");
    }
    countFamilies() {
        return 0;
    }
    /**
     * Return the nth family name. Useful for debugging.
     * @param index
     */
    getFamilyName(index) {
        return "";
    }
    /**
     * Find the closest matching typeface to the specified familyName and style.
     */
    matchFamilyStyle(name, style) {
        throw new Error("matchFamilyStyle not implemented.");
    }
}
export class _FontMgrFactory {
    FromData(...buffers) {
        return null;
    }
}
export class _TypefaceFactory {
    GetDefault() {
        return null;
    }
    MakeTypefaceFromData(fontData) {
        return null;
    }
    MakeFreeTypeFaceFromData(fontData) {
        return null;
    }
}
export class _TypefaceFontProviderFactory {
    Make() {
        return new _TypefaceFontProvider();
    }
}
export class _TypefaceFontProvider extends _FontMgr {
    registerFont(bytes, family) {
        // if (bytes instanceof Uint8Array) {
        //     bytes = bytes.buffer;
        // }
        // // let arrayBuffer = uint8Array.buffer
        // // console.log(bytes)
        // const tf = new _TypefaceFactory().MakeFreeTypeFaceFromData(bytes)
        // this.typefaces.push(tf!)
        // const font = new FontFace(family, bytes);
        // font.load();
        // document.fonts.add(font);
    }
}
export class _Font extends SkEmbindObject {
    // /**
    //  * Constructs Font with default values with Typeface and size in points,
    //  * horizontal scale, and horizontal skew. Horizontal scale emulates condensed
    //  * and expanded fonts. Horizontal skew emulates oblique fonts.
    //  * @param face
    //  * @param size
    //  * @param scaleX
    //  * @param skewX
    //  */
    constructor(face, size, scaleX, skewX) {
        super("Font");
    }
    getMetrics() {
        return { ascent: 0, descent: 0, leading: 0 };
    }
    getGlyphBounds(glyphs, paint, output) {
        return new Float32Array([0, 0, 0, 0]);
    }
    getGlyphIDs(str, numCodePoints, output) {
        return new Uint16Array([]);
    }
    getGlyphWidths(glyphs, paint, output) {
        return new Float32Array([]);
    }
    getGlyphIntercepts(glyphs, positions, top, bottom) {
        return new Float32Array([]);
    }
    getScaleX() {
        return 1;
    }
    getSize() {
        return 0;
    }
    getSkewX() {
        return 1;
    }
    isEmbolden() {
        return false;
    }
    getTypeface() {
        return null;
    }
    setEdging(edging) { }
    setEmbeddedBitmaps(embeddedBitmaps) { }
    setHinting(hinting) { }
    setLinearMetrics(linearMetrics) {
    }
    setScaleX(sx) {
    }
    setSize(points) {
    }
    setSkewX(sx) {
    }
    setEmbolden(embolden) {
    }
    setSubpixel(subpixel) {
    }
    setTypeface(face) {
    }
}
export class _ParagraphStyle {
    constructor(ps) {
        Object.assign(this, ps);
    }
}
export class _TextStyle {
    constructor(ts) {
        Object.assign(this, ts);
    }
}
export class _ParagraphBuilder extends SkEmbindObject {
    constructor(style) {
        super("ParagraphBuilder");
        this.style = style;
        this.spans = [];
        this.styles = [];
    }
    /**
     * Pushes the information required to leave an open space.
     * @param width
     * @param height
     * @param alignment
     * @param baseline
     * @param offset
     */
    addPlaceholder(width, height, alignment, baseline, offset) {
        throw new Error("addPlaceholder not implemented.");
    }
    /**
     * Adds text to the builder. Forms the proper runs to use the upper-most style
     * on the style_stack.
     * @param str
     */
    addText(str) {
        console.log("ParagraphBuilder.addText", str);
        // console.log(this.style)
        let mergedStyle = {};
        this.styles.forEach((it) => {
            Object.assign(mergedStyle, it);
        });
        const span = new TextSpan(str, mergedStyle);
        this.spans.push(span);
    }
    /**
     * Returns a Paragraph object that can be used to be layout and paint the text to an
     * Canvas.
     */
    build() {
        console.log("ParagraphBuilder.build");
        // return new Paragraph(this.spans, this.style, this.iconFontData);
        return new _Paragraph(this.style);
    }
    /**
     * @param words is an array of word edges (starting or ending). You can
     * pass 2 elements (0 as a start of the entire text and text.size as the
     * end). This information is only needed for a specific API method getWords.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setWordsUtf8(words) { }
    /**
     * @param words is an array of word edges (starting or ending). You can
     * pass 2 elements (0 as a start of the entire text and text.size as the
     * end). This information is only needed for a specific API method getWords.
     *
     * The indices are expected to be relative to the UTF-16 representation of
     * the text.
     *
     * The `Intl.Segmenter` API can be used as a source for this data.
     */
    setWordsUtf16(words) { }
    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setGraphemeBreaksUtf8(graphemes) { }
    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setGraphemeBreaksUtf16(graphemes) { }
    /**
     * @param lineBreaks is an array of unsigned integers that should be
     * treated as pairs (index, break type) that point to the places of possible
     * line breaking if needed. It should include 0 as the first element.
     * Break type == 0 means soft break, break type == 1 is a hard break.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setLineBreaksUtf8(lineBreaks) { }
    /**
     * @param lineBreaks is an array of unsigned integers that should be
     * treated as pairs (index, break type) that point to the places of possible
     * line breaking if needed. It should include 0 as the first element.
     * Break type == 0 means soft break, break type == 1 is a hard break.
     *
     * The indices are expected to be relative to the UTF-16 representation of
     * the text.
     *
     * Chrome's `v8BreakIterator` API can be used as a source for this data.
     */
    setLineBreaksUtf16(lineBreaks) { }
    /**
     * Returns the entire Paragraph text (which is useful in case that text
     * was produced as a set of addText calls).
     */
    getText() {
        let text = "";
        this.spans.forEach((it) => {
            if (it instanceof TextSpan) {
                text += it.originText;
            }
        });
        if (typeof window === "object" && window.TextEncoder) {
            const encoder = new window.TextEncoder();
            const view = encoder.encode(text);
            return String.fromCharCode(...Array.from(view));
        }
        return text;
    }
    /**
    * Remove a style from the stack. Useful to apply different styles to chunks
    * of text such as bolding.
    */
    pop() {
        this.styles.pop();
    }
    /**
     * Push a style to the stack. The corresponding text added with addText will
     * use the top-most style.
     * @param textStyle
     */
    pushStyle(text) {
        this.styles.push(text);
    }
    /**
     * Pushes a TextStyle using paints instead of colors for foreground and background.
     * @param textStyle
     * @param fg
     * @param bg
     */
    pushPaintStyle(textStyle, fg, bg) {
        this.styles.push(textStyle);
    }
    /**
     * Resets this builder to its initial state, discarding any text, styles, placeholders that have
     * been added, but keeping the initial ParagraphStyle.
     */
    reset() {
        this.spans = [];
        this.styles = [];
    }
}
export class _Paragraph extends SkEmbindObject {
    constructor(style, context) {
        super("Paragraph");
        this.style = style;
        this.context = context;
        // private _textLayout = new TextLayout(this);
        this.glyphInfos = [];
        this.lineMetrics = [];
        this._didExceedMaxLines = false;
        this.previousLayoutWidth = 0;
        // if (this.iconFontData) {
        // this.iconFontMap = JSON.parse(this.iconFontData);
        //   }
    }
    didExceedMaxLines() {
        return this._didExceedMaxLines;
    }
    getAlphabeticBaseline() {
        return 0;
    }
    /**
     * Returns the index of the glyph that corresponds to the provided coordinate,
     * with the top left corner as the origin, and +y direction as down.
     */
    getGlyphPositionAtCoordinate(dx, dy) {
        this._textLayout.measureGlyphIfNeeded();
        for (let index = 0; index < this._textLayout.glyphInfos.length; index++) {
            const glyphInfo = this._textLayout.glyphInfos[index];
            const left = glyphInfo.graphemeLayoutBounds[0];
            const top = glyphInfo.graphemeLayoutBounds[1];
            const width = glyphInfo.graphemeLayoutBounds[2] - left;
            const height = glyphInfo.graphemeLayoutBounds[3] - top;
            if (dx >= left && dx <= left + width && dy >= top && dy <= top + height) {
                return { pos: index, affinity: { value: Affinity.Downstream } };
            }
        }
        for (let index = 0; index < this._textLayout.lineMetrics.length; index++) {
            const lineMetrics = this._textLayout.lineMetrics[index];
            const isLastLine = index === this._textLayout.lineMetrics.length - 1;
            const left = 0;
            const top = lineMetrics.yOffset;
            const width = lineMetrics.width;
            const height = lineMetrics.height;
            if (dy >= top && dy <= top + height) {
                if (dx <= 0) {
                    return {
                        pos: lineMetrics.startIndex,
                        affinity: { value: Affinity.Downstream },
                    };
                }
                else if (dx >= width) {
                    return {
                        pos: lineMetrics.endIndex,
                        affinity: { value: Affinity.Downstream },
                    };
                }
            }
            if (dy >= top + height && isLastLine) {
                return {
                    pos: lineMetrics.endIndex,
                    affinity: { value: Affinity.Downstream },
                };
            }
        }
        return { pos: 0, affinity: { value: Affinity.Upstream } };
    }
    /**
     * Returns the information associated with the closest glyph at the specified
     * paragraph coordinate, or null if the paragraph is empty.
     */
    getClosestGlyphInfoAtCoordinate(dx, dy) {
        return this.getGlyphInfoAt(this.getGlyphPositionAtCoordinate(dx, dy).pos);
    }
    /**
     * Returns the information associated with the glyph at the specified UTF-16
     * offset within the paragraph's visible lines, or null if the index is out
     * of bounds, or points to a codepoint that is logically after the last
     * visible codepoint.
     */
    getGlyphInfoAt(index) {
        var _a;
        this.measureGlyphIfNeeded();
        return (_a = this.glyphInfos[index]) !== null && _a !== void 0 ? _a : null;
    }
    getHeight() {
        const lineMetrics = this.getLineMetrics();
        let height = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            height += lineMetrics[i].height * lineMetrics[i].heightMultiplier;
            if (i > 0 && i < lineMetrics.length) {
                height += lineMetrics[i].height * 0.15;
            }
        }
        // console.log("getHeight", height);
        return height;
    }
    getIdeographicBaseline() {
        return 0;
    }
    /**
     * Returns the line number of the line that contains the specified UTF-16
     * offset within the paragraph, or -1 if the index is out of bounds, or
     * points to a codepoint that is logically after the last visible codepoint.
     */
    getLineNumberAt(index) {
        var _a, _b;
        return (_b = (_a = this.getLineMetricsOfRange(index, index)[0]) === null || _a === void 0 ? void 0 : _a.lineNumber) !== null && _b !== void 0 ? _b : 0;
    }
    getLineMetrics() {
        return this.lineMetrics;
    }
    /**
     * Returns the LineMetrics of the line at the specified line number, or null
     * if the line number is out of bounds, or is larger than or equal to the
     * specified max line number.
     */
    getLineMetricsAt(lineNumber) {
        var _a;
        return (_a = this.lineMetrics[lineNumber]) !== null && _a !== void 0 ? _a : null;
    }
    getLineMetricsOfRange(start, end) {
        let lineMetrics = [];
        this.lineMetrics.forEach((it) => {
            const range0 = [start, end];
            const range1 = [it.startIndex, it.endIndex];
            const hasIntersection = range0[1] >= range1[0] && range1[1] >= range0[0];
            if (hasIntersection) {
                lineMetrics.push(it);
            }
        });
        return lineMetrics;
    }
    getLongestLine() {
        return 0;
    }
    getMaxIntrinsicWidth() {
        var _a;
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(maxWidth, (_a = lineMetrics[i].justifyWidth) !== null && _a !== void 0 ? _a : lineMetrics[i].width);
        }
        // console.log("getMaxIntrinsicWidth", maxWidth);
        return maxWidth;
    }
    getMaxWidth() {
        var _a;
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(maxWidth, (_a = lineMetrics[i].justifyWidth) !== null && _a !== void 0 ? _a : lineMetrics[i].width);
        }
        // console.log("getMaxWidth", maxWidth);
        return maxWidth;
    }
    getMinIntrinsicWidth() {
        const lineMetrics = this.getLineMetrics();
        let width = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            width = Math.max(width, lineMetrics[i].width);
        }
        // console.log("getMinIntrinsicWidth", width);
        return width;
    }
    /**
     * Returns the total number of visible lines in the paragraph.
     */
    getNumberOfLines() {
        return this.lineMetrics.length;
    }
    getRectsForPlaceholders() {
        return [];
    }
    /**
     * Returns bounding boxes that enclose all text in the range of glpyh indexes [start, end).
     * @param start
     * @param end
     * @param hStyle
     * @param wStyle
     */
    getRectsForRange(start, end, hStyle, wStyle) {
        this.measureGlyphIfNeeded();
        let result = [];
        this.lineMetrics.forEach((it) => {
            const range0 = [start, end];
            const range1 = [it.startIndex, it.endIndex];
            const hasIntersection = range0[1] > range1[0] && range1[1] > range0[0];
            if (hasIntersection) {
                const intersecRange = [
                    Math.max(range0[0], range1[0]),
                    Math.min(range0[1], range1[1]),
                ];
                let currentLineLeft = -1;
                let currentLineTop = -1;
                let currentLineWidth = 0;
                let currentLineHeight = 0;
                for (let index = intersecRange[0]; index < intersecRange[1]; index++) {
                    const glyphInfo = this.glyphInfos[index];
                    if (glyphInfo) {
                        if (currentLineLeft < 0) {
                            currentLineLeft = glyphInfo.graphemeLayoutBounds[0];
                        }
                        if (currentLineTop < 0) {
                            currentLineTop = glyphInfo.graphemeLayoutBounds[1];
                        }
                        currentLineTop = Math.min(currentLineTop, glyphInfo.graphemeLayoutBounds[1]);
                        currentLineWidth =
                            glyphInfo.graphemeLayoutBounds[2] - currentLineLeft;
                        currentLineHeight = Math.max(currentLineHeight, glyphInfo.graphemeLayoutBounds[3] - currentLineTop);
                    }
                }
                result.push({
                    rect: new Float32Array([
                        currentLineLeft,
                        currentLineTop,
                        currentLineLeft + currentLineWidth,
                        currentLineTop + currentLineHeight,
                    ]),
                    dir: { value: TextDirection.LTR },
                });
            }
        });
        if (result.length === 0) {
            const lastSpan = this.spans[this.spans.length - 1];
            const lastLine = this.lineMetrics[this.lineMetrics.length - 1];
            if (end > lastLine.endIndex &&
                lastSpan instanceof TextSpan &&
                lastSpan.originText.endsWith("\n")) {
                return [
                    {
                        rect: new Float32Array([
                            0,
                            lastLine.yOffset,
                            0,
                            lastLine.yOffset + lastLine.height,
                        ]),
                        dir: { value: TextDirection.LTR },
                    },
                ];
            }
        }
        return result;
    }
    /**
     * Finds the first and last glyphs that define a word containing the glyph at index offset.
     * @param offset
     */
    getWordBoundary(offset) {
        return { start: offset, end: offset };
    }
    /**
     * Returns an array of ShapedLine objects, describing the paragraph.
     */
    getShapedLines() {
        return [];
    }
    /**
     * Lays out the text in the paragraph so it is wrapped to the given width.
     * @param width
     */
    layout(width) {
        console.log("Paragraph.layout");
        if (this.skImageCache) {
            this.skImageCache.delete();
        }
        this.skImageCache = undefined;
        // this._textLayout.layout(width);
        let layoutWidth = width;
        if (layoutWidth < 0) {
            layoutWidth = this.previousLayoutWidth;
        }
        this.previousLayoutWidth = layoutWidth;
        // this.initCanvas();
        this.glyphInfos = [];
        let currentLineMetrics = {
            startIndex: 0,
            endIndex: 0,
            endExcludingWhitespaces: 0,
            endIncludingNewline: 0,
            isHardBreak: false,
            ascent: 0,
            descent: 0,
            height: 0,
            // heightMultiplier: Math.max(
            //     1,
            //     (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
            // ),
            width: 0,
            // justifyWidth:
            //     this.paragraph.paragraphStyle.textAlign?.value === TextAlign.Justify
            //         ? layoutWidth
            //         : undefined,
            left: 0,
            // yOffset: 0,
            baseline: 0,
            lineNumber: 0,
            // isLastLine: false,
        };
        let lineMetrics = [];
        const spans = spanWithNewline(this.spans);
        spans.forEach((span) => {
            var _a, _b, _c, _d;
            if (span instanceof TextSpan) {
                this.context.font = span.toCanvasFont();
                // TextLayout.sharedLayoutContext.font = span.toCanvasFont();
                // const matrics = TextLayout.sharedLayoutContext.measureText(span.originText);
                const matrics = this.context.measureText(span.originText);
                let iconFontWidth = 0;
                if (this.iconFontData) {
                    const fontSize = (_a = span.style.fontSize) !== null && _a !== void 0 ? _a : 14;
                    iconFontWidth = fontSize;
                    currentLineMetrics.ascent = fontSize;
                    currentLineMetrics.descent = 0;
                    span.letterBaseline = fontSize;
                    span.letterHeight = fontSize;
                }
                else {
                    // const mHeight = TextLayout.sharedLayoutContext.measureText("M").width;
                    const mHeight = this.context.measureText("M").width;
                    currentLineMetrics.ascent = mHeight * 1.15;
                    currentLineMetrics.descent = mHeight * 0.35;
                    span.letterBaseline = mHeight * 1.15;
                    span.letterHeight = mHeight * 1.15 + mHeight * 0.35;
                }
                if (span.style.heightMultiplier && span.style.heightMultiplier > 0) {
                    currentLineMetrics.heightMultiplier = Math.max(currentLineMetrics.heightMultiplier, span.style.heightMultiplier / 1.5);
                }
                currentLineMetrics.height = Math.max(currentLineMetrics.height, currentLineMetrics.ascent + currentLineMetrics.descent);
                currentLineMetrics.baseline = Math.max(currentLineMetrics.baseline, currentLineMetrics.ascent);
                if (this.iconFontData) {
                    const textWidth = span.charSequence.length * iconFontWidth;
                    currentLineMetrics.endIndex += span.charSequence.length;
                    currentLineMetrics.width += textWidth;
                }
                else if (currentLineMetrics.width + matrics.width < layoutWidth &&
                    !span.hasLetterSpacing() &&
                    !span.hasWordSpacing() &&
                    !forceCalcGlyphInfos) {
                    // fast measure
                    if (span instanceof NewlineSpan) {
                        const newLineMatrics = this.createNewLine(currentLineMetrics);
                        lineMetrics.push(currentLineMetrics);
                        currentLineMetrics = newLineMatrics;
                    }
                    else {
                        currentLineMetrics.endIndex += span.charSequence.length;
                        currentLineMetrics.width += matrics.width;
                        if (((_c = (_b = span.style.fontStyle) === null || _b === void 0 ? void 0 : _b.slant) === null || _c === void 0 ? void 0 : _c.value) === FontSlant.Italic) {
                            currentLineMetrics.width += 2;
                        }
                    }
                }
                else {
                    let letterMeasureResult = LetterMeasurer.measureLetters(span, this.context);
                    let advances = letterMeasureResult.advances;
                    if (span instanceof NewlineSpan) {
                        advances = [0, 0];
                    }
                    if (Math.abs(advances[advances.length - 1] - layoutWidth) < 10 &&
                        layoutWidth === this.previousLayoutWidth) {
                        layoutWidth = advances[advances.length - 1];
                    }
                    let currentWord = "";
                    let currentWordWidth = 0;
                    let currentWordLength = 0;
                    let nextWordWidth = 0;
                    let canBreak = true;
                    let forceBreak = false;
                    for (let index = 0; index < span.charSequence.length; index++) {
                        const letter = span.charSequence[index];
                        currentWord += letter;
                        let currentLetterLeft = currentWordWidth;
                        let spanEnded = span.charSequence[index + 1] === undefined;
                        let nextWord = (_d = currentWord + span.charSequence[index + 1]) !== null && _d !== void 0 ? _d : "";
                        if (advances[index + 1] === undefined) {
                            currentWordWidth += advances[index] - advances[index - 1];
                        }
                        else {
                            currentWordWidth += advances[index + 1] - advances[index];
                        }
                        if (advances[index + 2] === undefined) {
                            nextWordWidth = currentWordWidth;
                        }
                        else {
                            nextWordWidth =
                                currentWordWidth + (advances[index + 2] - advances[index + 1]);
                        }
                        currentWordLength += 1;
                        canBreak = true;
                        forceBreak = false;
                        if (spanEnded) {
                            canBreak = true;
                        }
                        else if (isEnglishWord(nextWord)) {
                            canBreak = false;
                        }
                        if (isPunctuation(nextWord[nextWord.length - 1]) &&
                            currentLineMetrics.width + nextWordWidth >= layoutWidth) {
                            forceBreak = true;
                        }
                        if (span instanceof NewlineSpan) {
                            forceBreak = true;
                        }
                        const currentGlyphLeft = currentLineMetrics.width + currentLetterLeft;
                        const currentGlyphTop = currentLineMetrics.yOffset;
                        const currentGlyphWidth = (() => {
                            if (advances[index + 1] === undefined) {
                                return advances[index] - advances[index - 1];
                            }
                            else {
                                return advances[index + 1] - advances[index];
                            }
                        })();
                        const currentGlyphHeight = currentLineMetrics.height;
                        const currentGlyphInfo = {
                            graphemeLayoutBounds: Float32Array.from([
                                currentGlyphLeft,
                                currentGlyphTop,
                                currentGlyphLeft + currentGlyphWidth,
                                currentGlyphTop + currentGlyphHeight,
                            ]),
                            graphemeClusterTextRange: { start: index, end: index + 1 },
                            dir: { value: TextDirection.LTR },
                            isEllipsis: false,
                        };
                        this.glyphInfos.push(currentGlyphInfo);
                        if (!canBreak) {
                            continue;
                        }
                        else if (!forceBreak &&
                            currentLineMetrics.width + currentWordWidth <= layoutWidth) {
                            currentLineMetrics.width += currentWordWidth;
                            currentLineMetrics.endIndex += currentWordLength;
                            currentWord = "";
                            currentWordWidth = 0;
                            currentWordLength = 0;
                            canBreak = true;
                        }
                        else if (forceBreak ||
                            currentLineMetrics.width + currentWordWidth > layoutWidth) {
                            const newLineMatrics = this.createNewLine(currentLineMetrics);
                            lineMetrics.push(currentLineMetrics);
                            currentLineMetrics = newLineMatrics;
                            currentLineMetrics.width += currentWordWidth;
                            currentLineMetrics.endIndex += currentWordLength;
                            currentWord = "";
                            currentWordWidth = 0;
                            currentWordLength = 0;
                            canBreak = true;
                        }
                    }
                    if (currentWord.length > 0) {
                        currentLineMetrics.width += currentWordWidth;
                        currentLineMetrics.endIndex += currentWordLength;
                    }
                }
            }
        });
        lineMetrics.push(currentLineMetrics);
        if (this.style.maxLines &&
            lineMetrics.length > this.style.maxLines) {
            this._didExceedMaxLines = true;
            lineMetrics = lineMetrics.slice(0, this.style.maxLines);
        }
        else {
            this._didExceedMaxLines = false;
        }
        lineMetrics[lineMetrics.length - 1].isLastLine = true;
        this.lineMetrics = lineMetrics;
    }
    /**
     * When called after shaping, returns the glyph IDs which were not matched
     * by any of the provided fonts.
     */
    unresolvedCodepoints() {
        return [];
    }
    createNewLine(currentLineMetrics) {
        var _a;
        return {
            startIndex: currentLineMetrics.endIndex,
            endIndex: currentLineMetrics.endIndex,
            endExcludingWhitespaces: 0,
            endIncludingNewline: 0,
            isHardBreak: false,
            ascent: currentLineMetrics.ascent,
            descent: currentLineMetrics.descent,
            height: currentLineMetrics.height,
            heightMultiplier: Math.max(1, ((_a = this.style.heightMultiplier) !== null && _a !== void 0 ? _a : 1.5) / 1.5),
            width: 0,
            justifyWidth: currentLineMetrics.justifyWidth,
            left: 0,
            yOffset: currentLineMetrics.yOffset +
                currentLineMetrics.height * currentLineMetrics.heightMultiplier +
                currentLineMetrics.height * 0.15, // 行间距
            baseline: currentLineMetrics.baseline,
            lineNumber: currentLineMetrics.lineNumber + 1,
            isLastLine: false,
        };
    }
    measureGlyphIfNeeded() {
        if (Object.keys(this.glyphInfos).length <= 0) {
            this.layout(-1, true);
        }
    }
}
class _Paint extends SkEmbindObject {
    constructor() {
        super("Paint");
        this._color = Float32Array.from([0, 0, 0, 255]);
        this._strokeCap = CanvasKit.StrokeCap.Butt;
        this._strokeJoin = CanvasKit.StrokeJoin.Bevel;
        this._strokeMiter = 0;
        this._strokeWidth = 0;
        this._alpha = 1.0;
        this._antiAlias = true;
    }
    /**
     * Returns a copy of this paint.
     */
    copy() {
        const newValue = new _Paint();
        Object.assign(newValue, this);
        return newValue;
    }
    getColor() {
        return this._color;
    }
    getStrokeCap() {
        return this._strokeCap;
    }
    getStrokeJoin() {
        return this._strokeJoin;
    }
    getStrokeMiter() {
        return this._strokeMiter;
    }
    getStrokeWidth() {
        return this._strokeWidth;
    }
    setAlphaf(alpha) {
        this._alpha = alpha;
    }
    setAntiAlias(aa) {
        this._antiAlias = aa;
    }
    /**
     * Sets the blend mode that is, the mode used to combine source color
     * with destination color.
     * @param mode
     */
    setBlendMode(mode) {
        throw new Error("Method not implemented.");
    }
    /**
     * Sets the current blender, increasing its refcnt, and if a blender is already
     * present, decreasing that object's refcnt.
     *
     * * A nullptr blender signifies the default SrcOver behavior.
     *
     * * For convenience, you can call setBlendMode() if the blend effect can be expressed
     * as one of those values.
     * @param blender
     */
    setBlender(blender) {
        throw new Error("Method not implemented.");
    }
    setColor(color, colorSpace) {
        this._color = color;
    }
    setColorComponents(r, g, b, a, colorSpace) {
        this.setColor(Float32Array.from([r, g, b, a]));
    }
    setColorFilter(filter) { }
    setColorInt(color, colorSpace) { }
    setDither(shouldDither) {
        throw new Error("Method not implemented.");
    }
    setImageFilter(filter) {
        throw new Error("Method not implemented.");
    }
    setMaskFilter(filter) {
        throw new Error("Method not implemented.");
    }
    setPathEffect(effect) {
        throw new Error("Method not implemented.");
    }
    setShader(shader) {
        throw new Error("Method not implemented.");
    }
    setStrokeCap(cap) {
        throw new Error("Method not implemented.");
    }
    setStrokeJoin(join) {
        throw new Error("Method not implemented.");
    }
    setStrokeMiter(limit) {
        throw new Error("Method not implemented.");
    }
    setStrokeWidth(width) {
        throw new Error("Method not implemented.");
    }
    setStyle(style) {
        throw new Error("Method not implemented.");
    }
}
export class Span {
    constructor() {
        this.letterBaseline = 0;
        this.letterHeight = 0;
        this.lettersBounding = [];
    }
}
export class TextSpan extends Span {
    constructor(text, style) {
        super();
        this.text = text;
        this.style = style;
        this.charSequence = Array.from(text);
        this.originText = text;
    }
    hasLetterSpacing() {
        return (this.style.letterSpacing !== undefined && this.style.letterSpacing > 1);
    }
    hasWordSpacing() {
        return this.style.wordSpacing !== undefined && this.style.wordSpacing > 1;
    }
    hasJustifySpacing(paragraphStyle) {
        var _a;
        return ((_a = paragraphStyle.textAlign) === null || _a === void 0 ? void 0 : _a.value) === TextAlign.Justify;
    }
    toBackgroundFillStyle() {
        if (this.style.backgroundColor) {
            return colorToHex(this.style.backgroundColor);
        }
        else {
            return "#000000";
        }
    }
    toTextFillStyle() {
        if (this.style.color) {
            return colorToHex(this.style.color);
        }
        else {
            return "#000000";
        }
    }
    toDecorationStrokeStyle() {
        if (this.style.decorationColor) {
            return colorToHex(this.style.decorationColor);
        }
        else {
            return "#000000";
        }
    }
    toCanvasFont() {
        var _a, _b, _c, _d;
        let font = `${this.style.fontSize}px system-ui, Roboto`;
        const fontWeight = (_b = (_a = this.style.fontStyle) === null || _a === void 0 ? void 0 : _a.weight) === null || _b === void 0 ? void 0 : _b.value;
        if (fontWeight && fontWeight !== 400) {
            if (fontWeight >= 900) {
                font = "900 " + font;
            }
            else {
                font = fontWeight.toFixed(0) + " " + font;
            }
        }
        const slant = (_d = (_c = this.style.fontStyle) === null || _c === void 0 ? void 0 : _c.slant) === null || _d === void 0 ? void 0 : _d.value;
        if (slant) {
            switch (slant) {
                case FontSlant.Italic:
                    font = "italic " + font;
                    break;
                case FontSlant.Oblique:
                    font = "oblique " + font;
                    break;
            }
        }
        return font;
    }
}
export class NewlineSpan extends TextSpan {
    constructor() {
        super("\n", {});
    }
}
export const spanWithNewline = (spans) => {
    let result = [];
    spans.forEach((span) => {
        if (span instanceof TextSpan) {
            if (span.originText.indexOf("\n") >= 0) {
                const components = span.originText.split("\n");
                for (let index = 0; index < components.length; index++) {
                    const component = components[index];
                    if (index > 0) {
                        result.push(new NewlineSpan());
                    }
                    result.push(new TextSpan(component, span.style));
                }
                return;
            }
        }
        result.push(span);
    });
    return result;
};
class LetterMeasurer {
    static measureLetters(span, context) {
        let advances = [0];
        let curPosWidth = 0;
        for (let index = 0; index < span.charSequence.length; index++) {
            const letter = span.charSequence[index];
            let wordWidth = (() => {
                if (isSquareCharacter(letter)) {
                    return this.measureSquareCharacter(context);
                }
                else {
                    return this.measureNormalLetter(letter, context);
                }
            })();
            if (span.hasWordSpacing() &&
                letter === " " &&
                isEnglishWord(span.charSequence[index - 1])) {
                wordWidth = span.style.wordSpacing;
            }
            else if (span.hasLetterSpacing()) {
                wordWidth += span.style.letterSpacing;
            }
            curPosWidth += wordWidth;
            advances.push(curPosWidth);
        }
        return { advances };
    }
    static measureNormalLetter(letter, context) {
        var _a;
        const width = (_a = this.widthFromCache(context, letter)) !== null && _a !== void 0 ? _a : context.measureText(letter).width;
        this.setWidthToCache(context, letter, width);
        return width;
    }
    static measureSquareCharacter(context) {
        var _a;
        const width = (_a = this.widthFromCache(context, "测")) !== null && _a !== void 0 ? _a : context.measureText("测").width;
        this.setWidthToCache(context, "测", width);
        return width;
    }
    static widthFromCache(context, word) {
        var _a;
        const cacheKey = context.font + "_" + word;
        return (_a = this.measureLRUCache[cacheKey]) === null || _a === void 0 ? void 0 : _a.width;
    }
    static setWidthToCache(context, word, width) {
        const cacheKey = context.font + "_" + word;
        if (this.measureLRUCache[cacheKey]) {
            this.measureLRUCache[cacheKey].useCount++;
            return;
        }
        this.measureLRUCache[cacheKey] = {
            useCount: 1,
            width: width,
        };
        if (Object.keys(this.measureLRUCache).length > this.LRUConfig.maxCacheCount) {
            this.clearCache();
        }
    }
    static clearCache() {
        const keys = Object.keys(this.measureLRUCache).sort((a, b) => {
            return this.measureLRUCache[a].useCount > this.measureLRUCache[b].useCount
                ? 1
                : -1;
        });
        keys
            .slice(0, this.LRUConfig.maxCacheCount - this.LRUConfig.minCacheCount)
            .forEach((it) => {
            delete this.measureLRUCache[it];
        });
    }
}
LetterMeasurer.LRUConfig = {
    maxCacheCount: 1000,
    minCacheCount: 200,
};
LetterMeasurer.measureLRUCache = {};
// export class TextLayout {
//     static sharedLayoutCanvas: HTMLCanvasElement;
//     static sharedLayoutContext: CanvasRenderingContext2D;
//     constructor(readonly paragraph: Paragraph) { }
//     glyphInfos: GlyphInfo[] = [];
//     lineMetrics: LineMetrics[] = [];
//     didExceedMaxLines: boolean = false;
//     private previousLayoutWidth: number = 0;
//     private initCanvas() {
//         if (!TextLayout.sharedLayoutCanvas) {
//             TextLayout.sharedLayoutCanvas = createCanvas(1, 1);
//             TextLayout.sharedLayoutContext =
//                 TextLayout.sharedLayoutCanvas!.getContext(
//                     "2d"
//                 ) as CanvasRenderingContext2D;
//         }
//     }
//     measureGlyphIfNeeded() {
//         if (Object.keys(this.glyphInfos).length <= 0) {
//             this.layout(-1, true);
//         }
//     }
//     layout(layoutWidth: number, forceCalcGlyphInfos: boolean = false): void {
//         if (layoutWidth < 0) {
//             layoutWidth = this.previousLayoutWidth;
//         }
//         this.previousLayoutWidth = layoutWidth;
//         this.initCanvas();
//         this.glyphInfos = [];
//         let currentLineMetrics: LineMetrics = {
//             startIndex: 0,
//             endIndex: 0,
//             endExcludingWhitespaces: 0,
//             endIncludingNewline: 0,
//             isHardBreak: false,
//             ascent: 0,
//             descent: 0,
//             height: 0,
//             heightMultiplier: Math.max(
//                 1,
//                 (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
//             ),
//             width: 0,
//             justifyWidth:
//                 this.paragraph.paragraphStyle.textAlign?.value === TextAlign.Justify
//                     ? layoutWidth
//                     : undefined,
//             left: 0,
//             yOffset: 0,
//             baseline: 0,
//             lineNumber: 0,
//             isLastLine: false,
//         };
//         let lineMetrics: LineMetrics[] = [];
//         const spans = spanWithNewline(this.paragraph.spans);
//         spans.forEach((span) => {
//             if (span instanceof TextSpan) {
//                 TextLayout.sharedLayoutContext.font = span.toCanvasFont();
//                 const matrics = TextLayout.sharedLayoutContext.measureText(span.originText);
//                 let iconFontWidth = 0;
//                 if (this.paragraph.iconFontData) {
//                     const fontSize = span.style.fontSize ?? 14;
//                     iconFontWidth = fontSize;
//                     currentLineMetrics.ascent = fontSize;
//                     currentLineMetrics.descent = 0;
//                     span.letterBaseline = fontSize;
//                     span.letterHeight = fontSize;
//                 } else {
//                     const mHeight = TextLayout.sharedLayoutContext.measureText("M").width;
//                     currentLineMetrics.ascent = mHeight * 1.15;
//                     currentLineMetrics.descent = mHeight * 0.35;
//                     span.letterBaseline = mHeight * 1.15;
//                     span.letterHeight = mHeight * 1.15 + mHeight * 0.35;
//                 }
//                 if (span.style.heightMultiplier && span.style.heightMultiplier > 0) {
//                     currentLineMetrics.heightMultiplier = Math.max(
//                         currentLineMetrics.heightMultiplier,
//                         span.style.heightMultiplier / 1.5
//                     );
//                 }
//                 currentLineMetrics.height = Math.max(
//                     currentLineMetrics.height,
//                     currentLineMetrics.ascent + currentLineMetrics.descent
//                 );
//                 currentLineMetrics.baseline = Math.max(
//                     currentLineMetrics.baseline,
//                     currentLineMetrics.ascent
//                 );
//                 if (this.paragraph.iconFontData) {
//                     const textWidth = span.charSequence.length * iconFontWidth;
//                     currentLineMetrics.endIndex += span.charSequence.length;
//                     currentLineMetrics.width += textWidth;
//                 } else if (
//                     currentLineMetrics.width + matrics.width < layoutWidth &&
//                     !span.hasLetterSpacing() &&
//                     !span.hasWordSpacing() &&
//                     !forceCalcGlyphInfos
//                 ) {
//                     // fast measure
//                     if (span instanceof NewlineSpan) {
//                         const newLineMatrics: LineMetrics =
//                             this.createNewLine(currentLineMetrics);
//                         lineMetrics.push(currentLineMetrics);
//                         currentLineMetrics = newLineMatrics;
//                     } else {
//                         currentLineMetrics.endIndex += span.charSequence.length;
//                         currentLineMetrics.width += matrics.width;
//                         if (span.style.fontStyle?.slant?.value === FontSlant.Italic) {
//                             currentLineMetrics.width += 2;
//                         }
//                     }
//                 } else {
//                     let letterMeasureResult = LetterMeasurer.measureLetters(
//                         span,
//                         TextLayout.sharedLayoutContext
//                     );
//                     let advances: number[] = letterMeasureResult.advances;
//                     if (span instanceof NewlineSpan) {
//                         advances = [0, 0];
//                     }
//                     if (
//                         Math.abs(advances[advances.length - 1] - layoutWidth) < 10 &&
//                         layoutWidth === this.previousLayoutWidth
//                     ) {
//                         layoutWidth = advances[advances.length - 1];
//                     }
//                     let currentWord = "";
//                     let currentWordWidth = 0;
//                     let currentWordLength = 0;
//                     let nextWordWidth = 0;
//                     let canBreak = true;
//                     let forceBreak = false;
//                     for (let index = 0; index < span.charSequence.length; index++) {
//                         const letter = span.charSequence[index];
//                         currentWord += letter;
//                         let currentLetterLeft = currentWordWidth;
//                         let spanEnded = span.charSequence[index + 1] === undefined;
//                         let nextWord = currentWord + span.charSequence[index + 1] ?? "";
//                         if (advances[index + 1] === undefined) {
//                             currentWordWidth += advances[index] - advances[index - 1];
//                         } else {
//                             currentWordWidth += advances[index + 1] - advances[index];
//                         }
//                         if (advances[index + 2] === undefined) {
//                             nextWordWidth = currentWordWidth;
//                         } else {
//                             nextWordWidth =
//                                 currentWordWidth + (advances[index + 2] - advances[index + 1]);
//                         }
//                         currentWordLength += 1;
//                         canBreak = true;
//                         forceBreak = false;
//                         if (spanEnded) {
//                             canBreak = true;
//                         } else if (isEnglishWord(nextWord)) {
//                             canBreak = false;
//                         }
//                         if (
//                             isPunctuation(nextWord[nextWord.length - 1]) &&
//                             currentLineMetrics.width + nextWordWidth >= layoutWidth
//                         ) {
//                             forceBreak = true;
//                         }
//                         if (span instanceof NewlineSpan) {
//                             forceBreak = true;
//                         }
//                         const currentGlyphLeft =
//                             currentLineMetrics.width + currentLetterLeft;
//                         const currentGlyphTop = currentLineMetrics.yOffset;
//                         const currentGlyphWidth = (() => {
//                             if (advances[index + 1] === undefined) {
//                                 return advances[index] - advances[index - 1];
//                             } else {
//                                 return advances[index + 1] - advances[index];
//                             }
//                         })();
//                         const currentGlyphHeight = currentLineMetrics.height;
//                         const currentGlyphInfo: GlyphInfo = {
//                             graphemeLayoutBounds: valueOfRectXYWH(
//                                 currentGlyphLeft,
//                                 currentGlyphTop,
//                                 currentGlyphWidth,
//                                 currentGlyphHeight
//                             ),
//                             graphemeClusterTextRange: { start: index, end: index + 1 },
//                             dir: { value: TextDirection.LTR },
//                             isEllipsis: false,
//                         };
//                         this.glyphInfos.push(currentGlyphInfo);
//                         if (!canBreak) {
//                             continue;
//                         } else if (
//                             !forceBreak &&
//                             currentLineMetrics.width + currentWordWidth <= layoutWidth
//                         ) {
//                             currentLineMetrics.width += currentWordWidth;
//                             currentLineMetrics.endIndex += currentWordLength;
//                             currentWord = "";
//                             currentWordWidth = 0;
//                             currentWordLength = 0;
//                             canBreak = true;
//                         } else if (
//                             forceBreak ||
//                             currentLineMetrics.width + currentWordWidth > layoutWidth
//                         ) {
//                             const newLineMatrics: LineMetrics =
//                                 this.createNewLine(currentLineMetrics);
//                             lineMetrics.push(currentLineMetrics);
//                             currentLineMetrics = newLineMatrics;
//                             currentLineMetrics.width += currentWordWidth;
//                             currentLineMetrics.endIndex += currentWordLength;
//                             currentWord = "";
//                             currentWordWidth = 0;
//                             currentWordLength = 0;
//                             canBreak = true;
//                         }
//                     }
//                     if (currentWord.length > 0) {
//                         currentLineMetrics.width += currentWordWidth;
//                         currentLineMetrics.endIndex += currentWordLength;
//                     }
//                 }
//             }
//         });
//         lineMetrics.push(currentLineMetrics);
//         if (
//             this.paragraph.paragraphStyle.maxLines &&
//             lineMetrics.length > this.paragraph.paragraphStyle.maxLines
//         ) {
//             this.didExceedMaxLines = true;
//             lineMetrics = lineMetrics.slice(
//                 0,
//                 this.paragraph.paragraphStyle.maxLines
//             );
//         } else {
//             this.didExceedMaxLines = false;
//         }
//         // logger.debug("TextLayout.layout.lineMetrics", lineMetrics);
//         // if (logger.profileMode) {
//         //   const layoutCostTime = new Date().getTime() - layoutStartTime;
//         //   logger.profile("Layout cost", layoutCostTime);
//         // }
//         lineMetrics[lineMetrics.length - 1].isLastLine = true;
//         this.lineMetrics = lineMetrics;
//     }
//     private createNewLine(currentLineMetrics: LineMetrics): LineMetrics {
//         return {
//             startIndex: currentLineMetrics.endIndex,
//             endIndex: currentLineMetrics.endIndex,
//             endExcludingWhitespaces: 0,
//             endIncludingNewline: 0,
//             isHardBreak: false,
//             ascent: currentLineMetrics.ascent,
//             descent: currentLineMetrics.descent,
//             height: currentLineMetrics.height,
//             heightMultiplier: Math.max(
//                 1,
//                 (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
//             ),
//             width: 0,
//             justifyWidth: currentLineMetrics.justifyWidth,
//             left: 0,
//             yOffset:
//                 currentLineMetrics.yOffset +
//                 currentLineMetrics.height * currentLineMetrics.heightMultiplier +
//                 currentLineMetrics.height * 0.15, // 行间距
//             baseline: currentLineMetrics.baseline,
//             lineNumber: currentLineMetrics.lineNumber + 1,
//             isLastLine: false,
//         };
//     }
// }
export class Drawer {
    constructor(paragraph) {
        this.paragraph = paragraph;
    }
    // private initCanvas() {
    //     if (!Drawer.sharedRenderCanvas) {
    //         Drawer.sharedRenderCanvas = createCanvas(
    //             Math.min(4000, 1000 * Drawer.pixelRatio),
    //             Math.min(4000, 1000 * Drawer.pixelRatio)
    //         );
    //         Drawer.sharedRenderContext = Drawer.sharedRenderCanvas!.getContext(
    //             "2d"
    //         ) as CanvasRenderingContext2D;
    //     }
    // }
    draw(context) {
        // this.initCanvas();
        const width = convertToUpwardToPixelRatio(this.paragraph.getMaxWidth() * Drawer.pixelRatio, Drawer.pixelRatio);
        const height = convertToUpwardToPixelRatio(this.paragraph.getHeight() * Drawer.pixelRatio, Drawer.pixelRatio);
        if (width <= 0 || height <= 0) {
            const context = Drawer.sharedRenderContext;
            context.clearRect(0, 0, 1, 1);
            return context.getImageData(0, 0, 1, 1);
        }
        // const context = Drawer.sharedRenderContext;
        context.clearRect(0, 0, width, height);
        context.save();
        context.scale(Drawer.pixelRatio, Drawer.pixelRatio);
        let didExceedMaxLines = false;
        let spanLetterStartIndex = 0;
        let linesDrawingRightBounds = {};
        const spans = spanWithNewline(this.paragraph.spans);
        let linesUndrawed = {};
        this.paragraph.getLineMetrics().forEach((it) => {
            linesUndrawed[it.lineNumber] = it.endIndex - it.startIndex;
        });
        spans.forEach((span) => {
            var _a, _b, _c, _d, _e, _f, _g;
            if (didExceedMaxLines)
                return;
            if (span instanceof TextSpan) {
                if (span instanceof NewlineSpan) {
                    spanLetterStartIndex++;
                    return;
                }
                let spanUndrawLength = span.charSequence.length;
                let spanLetterEndIndex = spanLetterStartIndex + span.charSequence.length;
                const lineMetrics = this.paragraph.getLineMetricsOfRange(spanLetterStartIndex, spanLetterEndIndex);
                context.font = span.toCanvasFont();
                while (spanUndrawLength > 0) {
                    let currentDrawText = [];
                    let currentDrawLine;
                    for (let index = 0; index < lineMetrics.length; index++) {
                        const line = lineMetrics[index];
                        if (linesUndrawed[line.lineNumber] > 0) {
                            const currentDrawLength = Math.min(linesUndrawed[line.lineNumber], spanUndrawLength);
                            currentDrawText = span.charSequence.slice(span.charSequence.length - spanUndrawLength, span.charSequence.length - spanUndrawLength + currentDrawLength);
                            spanUndrawLength -= currentDrawLength;
                            linesUndrawed[line.lineNumber] -= currentDrawLength;
                            currentDrawLine = line;
                            break;
                        }
                    }
                    if (!currentDrawLine)
                        break;
                    if (this.paragraph.didExceedMaxLines() &&
                        this.paragraph.paragraphStyle.maxLines ===
                            currentDrawLine.lineNumber + 1 &&
                        linesUndrawed[currentDrawLine.lineNumber] <= 0) {
                        const trimLength = isSquareCharacter(currentDrawText[currentDrawText.length - 1])
                            ? 1
                            : 3;
                        currentDrawText = currentDrawText.slice(0, currentDrawText.length - trimLength);
                        currentDrawText.push(...Array.from((_a = this.paragraph.paragraphStyle.ellipsis) !== null && _a !== void 0 ? _a : "..."));
                        didExceedMaxLines = true;
                    }
                    let drawingLeft = (() => {
                        var _a, _b;
                        if (linesDrawingRightBounds[currentDrawLine.lineNumber] === undefined) {
                            const textAlign = (_a = this.paragraph.paragraphStyle.textAlign) === null || _a === void 0 ? void 0 : _a.value;
                            const textDirection = (_b = this.paragraph.paragraphStyle.textDirection) === null || _b === void 0 ? void 0 : _b.value;
                            if (textAlign === TextAlign.Center) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    (this.paragraph.getMaxWidth() - currentDrawLine.width) / 2.0;
                            }
                            else if (textAlign === TextAlign.Right ||
                                (textAlign === TextAlign.End &&
                                    textDirection !== TextDirection.RTL) ||
                                (textAlign === TextAlign.Start &&
                                    textDirection === TextDirection.RTL)) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    this.paragraph.getMaxWidth() - currentDrawLine.width;
                            }
                            else {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] = 0;
                            }
                        }
                        return linesDrawingRightBounds[currentDrawLine.lineNumber];
                    })();
                    const drawingRight = drawingLeft +
                        (() => {
                            if (currentDrawText.length === 1 && currentDrawText[0] === "\n") {
                                return 0;
                            }
                            const extraLetterSpacing = span.hasLetterSpacing()
                                ? currentDrawText.length * span.style.letterSpacing
                                : 0;
                            return (context.measureText(currentDrawText.join("")).width +
                                extraLetterSpacing);
                        })();
                    linesDrawingRightBounds[currentDrawLine.lineNumber] = drawingRight;
                    const textTop = currentDrawLine.baseline * currentDrawLine.heightMultiplier -
                        span.letterBaseline;
                    const textBaseline = currentDrawLine.baseline * currentDrawLine.heightMultiplier;
                    const textHeight = span.letterHeight;
                    this.drawBackground(span, context, {
                        currentDrawLine,
                        drawingLeft,
                        drawingRight,
                        textBaseline,
                        textTop,
                        textHeight,
                    });
                    context.save();
                    if (span.style.shadows && span.style.shadows.length > 0) {
                        context.shadowColor = span.style.shadows[0].color
                            ? colorToHex(span.style.shadows[0].color)
                            : "transparent";
                        context.shadowOffsetX = (_c = (_b = span.style.shadows[0].offset) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : 0;
                        context.shadowOffsetY = (_e = (_d = span.style.shadows[0].offset) === null || _d === void 0 ? void 0 : _d[1]) !== null && _e !== void 0 ? _e : 0;
                        context.shadowBlur = (_f = span.style.shadows[0].blurRadius) !== null && _f !== void 0 ? _f : 0;
                    }
                    context.fillStyle = span.toTextFillStyle();
                    if (this.paragraph.iconFontData) {
                        for (let index = 0; index < currentDrawText.length; index++) {
                            const currentDrawLetter = currentDrawText[index];
                            const letterWidth = (_g = span.style.fontSize) !== null && _g !== void 0 ? _g : 14;
                            this.fillIcon(context, currentDrawLetter, letterWidth, drawingLeft, textBaseline + currentDrawLine.yOffset);
                            drawingLeft += letterWidth;
                        }
                    }
                    else if (span.hasLetterSpacing() ||
                        span.hasWordSpacing() ||
                        span.hasJustifySpacing(this.paragraph.paragraphStyle)) {
                        const letterSpacing = span.hasLetterSpacing()
                            ? span.style.letterSpacing
                            : 0;
                        const justifySpacing = span.hasJustifySpacing(this.paragraph.paragraphStyle) &&
                            !currentDrawLine.isLastLine
                            ? this.computeJustifySpacing(currentDrawText, currentDrawLine.width, currentDrawLine.justifyWidth)
                            : 0;
                        for (let index = 0; index < currentDrawText.length; index++) {
                            const currentDrawLetter = currentDrawText[index];
                            context.fillText(currentDrawLetter, drawingLeft, textBaseline + currentDrawLine.yOffset);
                            const letterWidth = context.measureText(currentDrawLetter).width;
                            if (span.hasWordSpacing() &&
                                currentDrawLetter === " " &&
                                isEnglishWord(currentDrawText[index - 1])) {
                                drawingLeft += span.style.wordSpacing;
                            }
                            else {
                                drawingLeft += letterWidth + letterSpacing;
                            }
                            if (!isEnglishWord(currentDrawText[index])) {
                                drawingLeft += justifySpacing;
                            }
                        }
                    }
                    else {
                        context.fillText(currentDrawText.join(""), drawingLeft, textBaseline + currentDrawLine.yOffset);
                    }
                    context.restore();
                    // logger.debug(
                    //   "Drawer.draw.fillText",
                    //   currentDrawText,
                    //   drawingLeft,
                    //   textBaseline + currentDrawLine.yOffset
                    // );
                    this.drawDecoration(span, context, {
                        currentDrawLine,
                        drawingLeft,
                        drawingRight,
                        textBaseline,
                        textTop,
                        textHeight,
                    });
                    if (didExceedMaxLines) {
                        break;
                    }
                }
                spanLetterStartIndex = spanLetterEndIndex;
            }
        });
        context.restore();
        return context.getImageData(0, 0, width, height);
    }
    fillIcon(context, text, fontSize, x, y) {
        var _a;
        const svgPath = (_a = this.paragraph.iconFontMap) === null || _a === void 0 ? void 0 : _a[text];
        if (!svgPath) {
            console.log("fill icon not found", text.charCodeAt(0).toString(16));
            return;
        }
        const pathCommands = svgPath.match(/[A-Za-z]\d+([\.\d,]+)?/g);
        if (!pathCommands)
            return;
        context.save();
        context.beginPath();
        let lastControlPoint = null;
        pathCommands.forEach((command) => {
            const type = command.charAt(0);
            const args = command
                .substring(1)
                .split(",")
                .map(parseFloat)
                .map((it, index) => {
                let value = it;
                if (index % 2 === 1) {
                    value = 150 - value + 150;
                }
                return value * (fontSize / 300);
            });
            if (type === "M") {
                context.moveTo(args[0], args[1]);
            }
            else if (type === "L") {
                context.lineTo(args[0], args[1]);
            }
            else if (type === "C") {
                context.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]);
                lastControlPoint = [args[2], args[3]];
            }
            else if (type === "Q") {
                context.quadraticCurveTo(args[0], args[1], args[2], args[3]);
                lastControlPoint = [args[0], args[1]];
            }
            else if (type === "A") {
                // no need A
            }
            else if (type === "Z") {
                context.closePath();
            }
        });
        context.fill();
        context.restore();
    }
    computeJustifySpacing(text, lineWidth, justifyWidth) {
        let count = 0;
        for (let index = 0; index < text.length; index++) {
            if (!isEnglishWord(text[index])) {
                count++;
            }
        }
        return (justifyWidth - lineWidth) / (count - 1);
    }
    drawBackground(span, context, options) {
        if (span.style.backgroundColor) {
            const { currentDrawLine, drawingLeft, drawingRight, textTop, textHeight, } = options;
            context.fillStyle = span.toBackgroundFillStyle();
            context.fillRect(drawingLeft, textTop + currentDrawLine.yOffset, drawingRight - drawingLeft, textHeight);
        }
    }
    drawDecoration(span, context, options) {
        var _a, _b, _c;
        const { currentDrawLine, drawingLeft, drawingRight, textBaseline, textTop, textHeight, } = options;
        if (span.style.decoration) {
            context.save();
            context.strokeStyle = span.toDecorationStrokeStyle();
            context.lineWidth =
                ((_a = span.style.decorationThickness) !== null && _a !== void 0 ? _a : 1) *
                    Math.max(1, ((_b = span.style.fontSize) !== null && _b !== void 0 ? _b : 12) / 14);
            const decorationStyle = (_c = span.style.decorationStyle) === null || _c === void 0 ? void 0 : _c.value;
            switch (decorationStyle) {
                case DecorationStyle.Dashed:
                    context.lineCap = "butt";
                    context.setLineDash([4, 2]);
                    break;
                case DecorationStyle.Dotted:
                    context.lineCap = "butt";
                    context.setLineDash([2, 2]);
                    break;
            }
            if (span.style.decoration === UnderlineDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textBaseline + 1);
                context.lineTo(drawingRight, currentDrawLine.yOffset + textBaseline + 1);
                context.stroke();
                if (decorationStyle === DecorationStyle.Double) {
                    context.beginPath();
                    context.moveTo(drawingLeft, currentDrawLine.yOffset + textBaseline + 3);
                    context.lineTo(drawingRight, currentDrawLine.yOffset + textBaseline + 3);
                    context.stroke();
                }
            }
            if (span.style.decoration === LineThroughDecoration || span.style.decoration === 3) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + textHeight / 2.0);
                context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + textHeight / 2.0);
                if (decorationStyle === DecorationStyle.Double) {
                    context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2);
                    context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2);
                }
                context.stroke();
            }
            if (span.style.decoration === OverlineDecoration) {
                context.beginPath();
                context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop);
                context.lineTo(drawingRight, currentDrawLine.yOffset + textTop);
                if (decorationStyle === DecorationStyle.Double) {
                    context.moveTo(drawingLeft, currentDrawLine.yOffset + textTop + 2);
                    context.lineTo(drawingRight, currentDrawLine.yOffset + textTop + 2);
                }
                context.stroke();
            }
            context.restore();
        }
    }
}
Drawer.pixelRatio = 1.0;
let drawParagraphSharedPaint = null;
const TextAlignEnums = {
    Left: { value: 0 },
    Right: { value: 1 },
    Center: { value: 2 },
    Justify: { value: 3 },
    Start: { value: 4 },
    End: { value: 5 },
};
const AlphaTypeEnums = {
    Opaque: { value: 0 },
    Premul: { value: 1 },
    Unpremul: { value: 2 },
};
const ColorTypeEnums = {
    Alpha_8: { value: 0 },
    RGB_565: { value: 1 },
    RGBA_8888: { value: 2 },
    BGRA_8888: { value: 3 },
    RGBA_1010102: { value: 4 },
    RGB_101010x: { value: 5 },
    Gray_8: { value: 6 },
    RGBA_F16: { value: 7 },
    RGBA_F32: { value: 8 },
};
class _ColorSpace extends SkEmbindObject {
    constructor() {
        super("ColorSpace");
    }
}
export function install(canvasKit, pixelRatio, embeddingFonts, iconFonts) {
    // if (typeof canvasKit.ParagraphBuilder === "undefined") {
    // installPolyfill(canvasKit);
    canvasKit.ParagraphBuilder = new _ParagraphBuilderFactory();
    canvasKit.FontCollection = new _FontCollectionFactory();
    canvasKit.FontMgr = new _FontMgrFactory();
    canvasKit.Typeface = new _TypefaceFactory();
    canvasKit.TypefaceFontProvider = new _TypefaceFontProviderFactory();
    canvasKit.Font = _Font;
    canvasKit.ParagraphStyle = (ps) => {
        return new _ParagraphStyle(ps);
    };
    canvasKit.TextStyle = (ts) => {
        return new _TextStyle(ts);
    };
    // Paragraph Enums
    canvasKit.TextAlign = TextAlignEnums;
    canvasKit.TextDirection = {
        RTL: { value: 0 },
        LTR: { value: 1 },
    };
    canvasKit.TextBaseline = {
        Alphabetic: { value: 0 },
        Ideographic: { value: 1 },
    };
    canvasKit.RectHeightStyle = {
        Tight: { value: 0 },
        Max: { value: 1 },
        IncludeLineSpacingMiddle: { value: 2 },
        IncludeLineSpacingTop: { value: 3 },
        IncludeLineSpacingBottom: { value: 4 },
        Strut: { value: 5 },
    };
    canvasKit.RectWidthStyle = {
        Tight: { value: 0 },
        Max: { value: 1 },
    };
    canvasKit.Affinity = {
        Upstream: { value: 0 },
        Downstream: { value: 1 },
    };
    canvasKit.FontWeight = {
        Invisible: { value: 0 },
        Thin: { value: 100 },
        ExtraLight: { value: 200 },
        Light: { value: 300 },
        Normal: { value: 400 },
        Medium: { value: 500 },
        SemiBold: { value: 600 },
        Bold: { value: 700 },
        ExtraBold: { value: 800 },
        Black: { value: 900 },
        ExtraBlack: { value: 1000 },
    };
    canvasKit.FontWidth = {
        UltraCondensed: { value: 0 },
        ExtraCondensed: { value: 1 },
        Condensed: { value: 2 },
        SemiCondensed: { value: 3 },
        Normal: { value: 4 },
        SemiExpanded: { value: 5 },
        Expanded: { value: 6 },
        ExtraExpanded: { value: 7 },
        UltraExpanded: { value: 8 },
    };
    canvasKit.FontSlant = {
        Upright: { value: 0 },
        Italic: { value: 1 },
        Oblique: { value: 2 },
    };
    canvasKit.DecorationStyle = {
        Solid: { value: 0 },
        Double: { value: 1 },
        Dotted: { value: 2 },
        Dashed: { value: 3 },
        Wavy: { value: 4 },
    };
    canvasKit.TextHeightBehavior = {
        All: { value: 0 },
        DisableFirstAscent: { value: 1 },
        DisableLastDescent: { value: 2 },
        DisableAll: { value: 3 },
    };
    canvasKit.PlaceholderAlignment = {
        Baseline: { value: 0 },
        AboveBaseline: { value: 1 },
        BelowBaseline: { value: 2 },
        Top: { value: 3 },
        Bottom: { value: 4 },
        Middle: { value: 5 },
    };
    // Paragraph Constants
    canvasKit.NoDecoration = 0;
    canvasKit.UnderlineDecoration = 1;
    canvasKit.OverlineDecoration = 2;
    canvasKit.LineThroughDecoration = 3;
    Drawer.pixelRatio = pixelRatio;
    // const originMakeFromFontCollectionMethod =
    //     canvasKit.ParagraphBuilder.MakeFromFontCollection;
    // canvasKit.ParagraphBuilder.MakeFromFontCollection = function (
    //     style: any,
    //     fontCollection: any
    // ) {
    //     return ParagraphBuilder.MakeFromFontCollection(
    //         originMakeFromFontCollectionMethod,
    //         style,
    //         fontCollection,
    //         embeddingFonts,
    //         iconFonts
    //     );
    // };
    canvasKit.Canvas.prototype.drawParagraph = function (paragraph, dx, dy) {
        console.log(`drawParagraph ${paragraph} at (${dx}, ${dy})`);
        let canvasImg = paragraph.skImageCache;
        if (!canvasImg) {
            const drawer = new Drawer(paragraph);
            const imageData = drawer.draw();
            canvasImg = canvasKit.MakeImage({
                width: imageData.width,
                height: imageData.height,
                alphaType: AlphaTypeEnums.Unpremul,
                colorType: ColorTypeEnums.RGBA_8888,
                colorSpace: new _ColorSpace()
                // colorSpace: {
                //     SRGB:
                // }   canvasKit.ColorSpace.SRGB,
            }, imageData.data, 4 * imageData.width);
            paragraph.skImageCache = canvasImg;
            paragraph.skImageWidth = imageData.width;
            paragraph.skImageHeight = imageData.height;
        }
        const srcRect = canvasKit.XYWHRect(0, 0, paragraph.skImageWidth, paragraph.skImageHeight);
        const dstRect = canvasKit.XYWHRect(Math.ceil(dx), Math.ceil(dy), paragraph.skImageWidth / Drawer.pixelRatio, paragraph.skImageHeight / Drawer.pixelRatio);
        // 明确 drawParagraphSharedPaint 的类型为 _Paint | null
        const skPaint = drawParagraphSharedPaint !== null && drawParagraphSharedPaint !== void 0 ? drawParagraphSharedPaint : new _Paint();
        drawParagraphSharedPaint = skPaint;
        this.drawImageRect(canvasImg, srcRect, dstRect, skPaint);
    };
}
function initLayout() {
    const fontStore = new FontStore();
    const instance = fontSubstitution();
    const helvetica = fontStore.getFont({ fontFamily: 'Helvetica' }).data;
    let frag = { string: 'Hello' };
    let aas = fromFragments([frag]);
    // console.log(aas);
    // let engine = bidi();
    // let bbb = engine(aas);
    // console.log(bbb);
    let layout = layoutEngine({
        bidi: bidi,
        linebreaker: linebreaker,
        justification: justification,
        fontSubstitution: fontSubstitution,
        scriptItemizer: scriptItemizer,
        textDecoration: textDecoration,
    });
    console.log(layout);
    const run2 = { start: 3, end: 5, attributes: { font: [helvetica] } };
    const cccc = instance({ string: 'Lorem\nLorem Lorem', runs: [run2] });
    const reee = layout(cccc, { x: 10, y: 10, width: 100, height: 100 });
    // const aaa = bidi(fromFragments([
    //   { string: 'Hello' },
    // ]));
    console.log("aaa");
    console.log(reee);
}
