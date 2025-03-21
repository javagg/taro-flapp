import {
    colorToHex,
    convertToUpwardToPixelRatio,
    createCanvas,
    isEnglishWord,
    isPunctuation,
    isSquareCharacter,
} from "./util";

import {
    ParagraphBuilder, PositionWithAffinity, GlyphInfo,
    ParagraphStyle, Paragraph, FontCollection, InputGraphemes, TextStyle,
    ShapedLine, URange, FontMgr, PlaceholderAlignment, InputWords, InputLineBreaks,
    TypefaceFontProvider, FontBlock, TextBaseline, LineMetrics, RectHeightStyle,
    RectWithDirection, RectWidthStyle,
} from "./canvaskit";
import {
    SkEmbindObject, _Paint, Affinity as AffinityEnums, TextDirection as TextDirectionEnums,
    TextAlign, FontSlant, TextDirection

} from "./bass";


interface LetterRect {
    x: number;
    y: number;
    w: number;
    h: number;
}

class Span {
    letterBaseline: number = 0;
    letterHeight: number = 0;
    lettersBounding: LetterRect[] = [];
}

class TextSpan extends Span {
    charSequence: string[];
    originText: string;

    constructor(private readonly text: string, readonly style: TextStyle) {
        super();
        this.charSequence = Array.from(text);
        this.originText = text;
    }

    hasLetterSpacing() {
        return (
            this.style.letterSpacing !== undefined && this.style.letterSpacing > 1
        );
    }

    hasWordSpacing() {
        return this.style.wordSpacing !== undefined && this.style.wordSpacing > 1;
    }

    hasJustifySpacing(paragraphStyle: ParagraphStyle) {
        return paragraphStyle.textAlign === TextAlign.Justify;
    }

    toBackgroundFillStyle(): string {
        if (this.style.backgroundColor) {
            return colorToHex(this.style.backgroundColor as Float32Array);
        } else {
            return "#000000";
        }
    }

    toTextFillStyle(): string {
        if (this.style.color) {
            return colorToHex(this.style.color as Float32Array);
        } else {
            return "#000000";
        }
    }

    toDecorationStrokeStyle(): string {
        if (this.style.decorationColor) {
            return colorToHex(this.style.decorationColor as Float32Array);
        } else {
            return "#000000";
        }
    }

    toCanvasFont(): string {
        let font = `${this.style.fontSize}px system-ui, Roboto`;
        const fontWeight = this.style.fontStyle?.weight?.value;
        if (fontWeight && fontWeight !== 400) {
            if (fontWeight >= 900) {
                font = "900 " + font;
            } else {
                font = fontWeight.toFixed(0) + " " + font;
            }
        }
        const slant = this.style.fontStyle?.slant;
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

class NewlineSpan extends TextSpan {
    constructor() {
        super("\n", {});
    }
}

const spanWithNewline = (spans: Span[]): Span[] => {
    let result: Span[] = [];
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


class TextPaintService {
    constructor(readonly paragraph: _Paragraph) { }

    draw(context: CanvasRenderingContext2D, pixelRatio: number): ImageData {
        const width = convertToUpwardToPixelRatio(this.paragraph.getMaxWidth() * pixelRatio, pixelRatio);
        const height = convertToUpwardToPixelRatio(this.paragraph.getHeight() * pixelRatio, pixelRatio);
        if (width <= 0 || height <= 0) {
            context.clearRect(0, 0, 1, 1);
            return context.getImageData(0, 0, 1, 1);
        }
        context.clearRect(0, 0, width, height);
        context.save();
        context.scale(pixelRatio, pixelRatio);

        let didExceedMaxLines = false;
        let spanLetterStartIndex = 0;
        let linesDrawingRightBounds: Record<number, number> = {};

        const spans = spanWithNewline(this.paragraph.spans);
        let linesUndrawed: Record<number, number> = {};
        this.paragraph.getLineMetrics().forEach((it) => {
            linesUndrawed[it.lineNumber] = it.endIndex - it.startIndex;
        });
        spans.forEach((span) => {
            if (didExceedMaxLines) return;
            if (span instanceof TextSpan) {
                if (span instanceof NewlineSpan) {
                    spanLetterStartIndex++;
                    return;
                }
                let spanUndrawLength = span.charSequence.length;
                let spanLetterEndIndex =
                    spanLetterStartIndex + span.charSequence.length;
                const lineMetrics = this.paragraph.getLineMetricsOfRange(
                    spanLetterStartIndex,
                    spanLetterEndIndex
                );

                context.font = span.toCanvasFont();

                while (spanUndrawLength > 0) {
                    let currentDrawText: string[] = [];
                    let currentDrawLine: LineMetrics | undefined;
                    for (let index = 0; index < lineMetrics.length; index++) {
                        const line = lineMetrics[index];
                        if (linesUndrawed[line.lineNumber] > 0) {
                            const currentDrawLength = Math.min(
                                linesUndrawed[line.lineNumber],
                                spanUndrawLength
                            );
                            currentDrawText = span.charSequence.slice(
                                span.charSequence.length - spanUndrawLength,
                                span.charSequence.length - spanUndrawLength + currentDrawLength
                            );
                            spanUndrawLength -= currentDrawLength;
                            linesUndrawed[line.lineNumber] -= currentDrawLength;
                            currentDrawLine = line;
                            break;
                        }
                    }

                    if (!currentDrawLine) break;

                    if (
                        this.paragraph.didExceedMaxLines() &&
                        this.paragraph.paragraphStyle.maxLines ===
                        currentDrawLine.lineNumber + 1 &&
                        linesUndrawed[currentDrawLine.lineNumber] <= 0
                    ) {
                        const trimLength = isSquareCharacter(
                            currentDrawText[currentDrawText.length - 1]
                        )
                            ? 1
                            : 3;
                        currentDrawText = currentDrawText.slice(
                            0,
                            currentDrawText.length - trimLength
                        );
                        currentDrawText.push(
                            ...Array.from(this.paragraph.paragraphStyle.ellipsis ?? "...")
                        );
                        didExceedMaxLines = true;
                    }

                    let drawingLeft = (() => {
                        if (
                            linesDrawingRightBounds[currentDrawLine.lineNumber] === undefined
                        ) {
                            const textAlign = this.paragraph.paragraphStyle.textAlign;
                            const textDirection =
                                this.paragraph.paragraphStyle.textDirection;
                            if (textAlign === TextAlign.Center) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    (this.paragraph.getMaxWidth() - currentDrawLine.width) / 2.0;
                            } else if (
                                textAlign === TextAlign.Right ||
                                (textAlign === TextAlign.End &&
                                    textDirection !== TextDirection.RTL) ||
                                (textAlign === TextAlign.Start &&
                                    textDirection === TextDirection.RTL)
                            ) {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] =
                                    this.paragraph.getMaxWidth() - currentDrawLine.width;
                            } else {
                                linesDrawingRightBounds[currentDrawLine.lineNumber] = 0;
                            }
                        }
                        return linesDrawingRightBounds[currentDrawLine.lineNumber];
                    })();

                    const drawingRight =
                        drawingLeft +
                        (() => {
                            if (currentDrawText.length === 1 && currentDrawText[0] === "\n") {
                                return 0;
                            }
                            const extraLetterSpacing = span.hasLetterSpacing()
                                ? currentDrawText.length * span.style.letterSpacing!
                                : 0;
                            return (
                                context.measureText(currentDrawText.join("")).width +
                                extraLetterSpacing
                            );
                        })();

                    linesDrawingRightBounds[currentDrawLine.lineNumber] = drawingRight;

                    const textTop =
                        currentDrawLine.baseline * currentDrawLine.heightMultiplier -
                        span.letterBaseline;
                    const textBaseline =
                        currentDrawLine.baseline * currentDrawLine.heightMultiplier;
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
                            ? colorToHex(span.style.shadows[0].color as Float32Array)
                            : "transparent";
                        context.shadowOffsetX = span.style.shadows[0].offset?.[0] ?? 0;
                        context.shadowOffsetY = span.style.shadows[0].offset?.[1] ?? 0;
                        context.shadowBlur = span.style.shadows[0].blurRadius ?? 0;
                    }
                    context.fillStyle = span.toTextFillStyle();
                    if (this.paragraph.iconFontData) {
                        for (let index = 0; index < currentDrawText.length; index++) {
                            const currentDrawLetter = currentDrawText[index];
                            const letterWidth = span.style.fontSize ?? 14;
                            this.fillIcon(
                                context,
                                currentDrawLetter,
                                letterWidth,
                                drawingLeft,
                                textBaseline + currentDrawLine.yOffset
                            );
                            drawingLeft += letterWidth;
                        }
                    } else if (
                        span.hasLetterSpacing() ||
                        span.hasWordSpacing() ||
                        span.hasJustifySpacing(this.paragraph.paragraphStyle)
                    ) {
                        const letterSpacing = span.hasLetterSpacing()
                            ? span.style.letterSpacing!
                            : 0;
                        const justifySpacing =
                            span.hasJustifySpacing(this.paragraph.paragraphStyle) &&
                                !currentDrawLine.isLastLine
                                ? this.computeJustifySpacing(
                                    currentDrawText,
                                    currentDrawLine.width,
                                    currentDrawLine.justifyWidth!
                                )
                                : 0;
                        for (let index = 0; index < currentDrawText.length; index++) {
                            const currentDrawLetter = currentDrawText[index];
                            console.log("currentDrawLetter:", currentDrawLetter);
                            context.fillText(
                                currentDrawLetter,
                                drawingLeft,
                                textBaseline + currentDrawLine.yOffset
                            );
                            const letterWidth = context.measureText(currentDrawLetter).width;
                            if (
                                span.hasWordSpacing() &&
                                currentDrawLetter === " " &&
                                isEnglishWord(currentDrawText[index - 1])
                            ) {
                                drawingLeft += span.style.wordSpacing!;
                            } else {
                                drawingLeft += letterWidth + letterSpacing;
                            }
                            if (!isEnglishWord(currentDrawText[index])) {
                                drawingLeft += justifySpacing;
                            }
                        }
                    } else {
                        context.fillText(
                            currentDrawText.join(""),
                            drawingLeft,
                            textBaseline + currentDrawLine.yOffset
                        );
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

    private fillIcon(
        context: CanvasRenderingContext2D,
        text: string,
        fontSize: number,
        x: number,
        y: number
    ) {
        const svgPath = this.paragraph.iconFontMap?.[text];
        if (!svgPath) {
            console.log("fill icon not found", text.charCodeAt(0).toString(16));
            return;
        }
        const pathCommands = svgPath.match(/[A-Za-z]\d+([\.\d,]+)?/g);
        if (!pathCommands) return;
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
            } else if (type === "L") {
                context.lineTo(args[0], args[1]);
            } else if (type === "C") {
                context.bezierCurveTo(
                    args[0],
                    args[1],
                    args[2],
                    args[3],
                    args[4],
                    args[5]
                );
                lastControlPoint = [args[2], args[3]];
            } else if (type === "Q") {
                context.quadraticCurveTo(args[0], args[1], args[2], args[3]);
                lastControlPoint = [args[0], args[1]];
            } else if (type === "A") {
                // no need A
            } else if (type === "Z") {
                context.closePath();
            }
        });
        context.fill();
        context.restore();
    }

    private computeJustifySpacing(
        text: string[],
        lineWidth: number,
        justifyWidth: number
    ): number {
        let count = 0;
        for (let index = 0; index < text.length; index++) {
            if (!isEnglishWord(text[index])) {
                count++;
            }
        }
        return (justifyWidth - lineWidth) / (count - 1);
    }

    private drawBackground(
        span: TextSpan,
        context: CanvasRenderingContext2D,
        options: {
            currentDrawLine: LineMetrics;
            drawingLeft: number;
            drawingRight: number;
            textBaseline: number;
            textTop: number;
            textHeight: number;
        }
    ) {
        if (span.style.backgroundColor) {
            const {
                currentDrawLine,
                drawingLeft,
                drawingRight,
                textTop,
                textHeight,
            } = options;
            context.fillStyle = span.toBackgroundFillStyle();
            context.fillRect(
                drawingLeft,
                textTop + currentDrawLine.yOffset,
                drawingRight - drawingLeft,
                textHeight
            );
        }
    }

    private drawDecoration(
        span: TextSpan,
        context: CanvasRenderingContext2D,
        options: {
            currentDrawLine: LineMetrics;
            drawingLeft: number;
            drawingRight: number;
            textBaseline: number;
            textTop: number;
            textHeight: number;
        }
    ) {
        const {
            currentDrawLine,
            drawingLeft,
            drawingRight,
            textBaseline,
            textTop,
            textHeight,
        } = options;
        if (span.style.decoration) {
            context.save();
            context.strokeStyle = span.toDecorationStrokeStyle();
            context.lineWidth =
                (span.style.decorationThickness ?? 1) *
                Math.max(1, (span.style.fontSize ?? 12) / 14);
            const decorationStyle = span.style.decorationStyle;

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
                context.lineTo(
                    drawingRight,
                    currentDrawLine.yOffset + textBaseline + 1
                );
                context.stroke();
                if (decorationStyle === DecorationStyle.Double) {
                    context.beginPath();
                    context.moveTo(
                        drawingLeft,
                        currentDrawLine.yOffset + textBaseline + 3
                    );
                    context.lineTo(
                        drawingRight,
                        currentDrawLine.yOffset + textBaseline + 3
                    );
                    context.stroke();
                }
            }
            if (span.style.decoration === LineThroughDecoration || span.style.decoration === 3) {
                context.beginPath();
                context.moveTo(
                    drawingLeft,
                    currentDrawLine.yOffset + textTop + textHeight / 2.0
                );
                context.lineTo(
                    drawingRight,
                    currentDrawLine.yOffset + textTop + textHeight / 2.0
                );
                if (decorationStyle === DecorationStyle.Double) {
                    context.moveTo(
                        drawingLeft,
                        currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2
                    );
                    context.lineTo(
                        drawingRight,
                        currentDrawLine.yOffset + textTop + textHeight / 2.0 + 2
                    );
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


interface LetterMeasureResult {
    useCount: number;
    width: number;
}

class LetterMeasurer {
    private static LRUConfig = {
        maxCacheCount: 1000,
        minCacheCount: 200,
    };

    private static measureLRUCache: Record<string, LetterMeasureResult> = {};

    static measureLetters(
        span: TextSpan,
        context: CanvasRenderingContext2D
    ): { advances: number[] } {
        let advances: number[] = [0];
        let curPosWidth = 0;
        for (let index = 0; index < span.charSequence.length; index++) {
            const letter = span.charSequence[index];
            let wordWidth = (() => {
                if (isSquareCharacter(letter)) {
                    return this.measureSquareCharacter(context);
                } else {
                    return this.measureNormalLetter(letter, context);
                }
            })();
            if (
                span.hasWordSpacing() &&
                letter === " " &&
                isEnglishWord(span.charSequence[index - 1])
            ) {
                wordWidth = span.style.wordSpacing!;
            } else if (span.hasLetterSpacing()) {
                wordWidth += span.style.letterSpacing!;
            }
            curPosWidth += wordWidth;
            advances.push(curPosWidth);
        }
        return { advances };
    }

    private static measureNormalLetter(
        letter: string,
        context: CanvasRenderingContext2D
    ): number {
        const width =
            this.widthFromCache(context, letter) ?? context.measureText(letter).width;
        this.setWidthToCache(context, letter, width);
        return width;
    }

    private static measureSquareCharacter(
        context: CanvasRenderingContext2D
    ): number {
        const width =
            this.widthFromCache(context, "测") ?? context.measureText("测").width;
        this.setWidthToCache(context, "测", width);
        return width;
    }

    private static widthFromCache(
        context: CanvasRenderingContext2D,
        word: string
    ): number | undefined {
        const cacheKey = context.font + "_" + word;
        return this.measureLRUCache[cacheKey]?.width;
    }

    private static setWidthToCache(
        context: CanvasRenderingContext2D,
        word: string,
        width: number
    ) {
        const cacheKey = context.font + "_" + word;
        if (this.measureLRUCache[cacheKey]) {
            this.measureLRUCache[cacheKey].useCount++;
            return;
        }
        this.measureLRUCache[cacheKey] = {
            useCount: 1,
            width: width,
        };
        if (
            Object.keys(this.measureLRUCache).length > this.LRUConfig.maxCacheCount
        ) {
            this.clearCache();
        }
    }

    private static clearCache() {
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

class TextLayoutService {
    static sharedLayoutCanvas: HTMLCanvasElement;
    static sharedLayoutContext: CanvasRenderingContext2D;

    constructor(readonly paragraph: _Paragraph) { }

    glyphInfos: GlyphInfo[] = [];
    lineMetrics: LineMetrics[] = [];
    didExceedMaxLines: boolean = false;

    private previousLayoutWidth: number = 0;

    private initCanvas() {
        if (!TextLayoutService.sharedLayoutCanvas) {
            TextLayoutService.sharedLayoutCanvas = createCanvas(1, 1);
            TextLayoutService.sharedLayoutContext =
                TextLayoutService.sharedLayoutCanvas!.getContext(
                    "2d"
                ) as CanvasRenderingContext2D;
        }
    }

    measureGlyphIfNeeded() {
        if (Object.keys(this.glyphInfos).length <= 0) {
            this.layout(-1, true);
        }
    }

    layout(layoutWidth: number, forceCalcGlyphInfos: boolean = false): void {
        let layoutStartTime!: number;
        // if (logger.profileMode) {
        //   layoutStartTime = new Date().getTime();
        // }
        if (layoutWidth < 0) {
            layoutWidth = this.previousLayoutWidth;
        }
        this.previousLayoutWidth = layoutWidth;
        this.initCanvas();
        this.glyphInfos = [];
        let currentLineMetrics: LineMetrics = {
            startIndex: 0,
            endIndex: 0,
            endExcludingWhitespaces: 0,
            endIncludingNewline: 0,
            isHardBreak: false,
            ascent: 0,
            descent: 0,
            height: 0,
            heightMultiplier: Math.max(
                1,
                (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
            ),
            width: 0,
            justifyWidth:
                this.paragraph.paragraphStyle.textAlign === TextAlign.Justify
                    ? layoutWidth
                    : undefined,
            left: 0,
            yOffset: 0,
            baseline: 0,
            lineNumber: 0,
            isLastLine: false,
        };
        let lineMetrics: LineMetrics[] = [];
        const spans = spanWithNewline(this.paragraph.spans);
        spans.forEach((span) => {
            if (span instanceof TextSpan) {
                TextLayoutService.sharedLayoutContext.font = span.toCanvasFont();
                const matrics = TextLayoutService.sharedLayoutContext.measureText(span.originText);

                let iconFontWidth = 0;
                if (this.paragraph.iconFontData) {
                    const fontSize = span.style.fontSize ?? 14;
                    iconFontWidth = fontSize;
                    currentLineMetrics.ascent = fontSize;
                    currentLineMetrics.descent = 0;
                    span.letterBaseline = fontSize;
                    span.letterHeight = fontSize;
                } else {
                    const mHeight = TextLayoutService.sharedLayoutContext.measureText("M").width;
                    currentLineMetrics.ascent = mHeight * 1.15;
                    currentLineMetrics.descent = mHeight * 0.35;
                    span.letterBaseline = mHeight * 1.15;
                    span.letterHeight = mHeight * 1.15 + mHeight * 0.35;
                }

                if (span.style.heightMultiplier && span.style.heightMultiplier > 0) {
                    currentLineMetrics.heightMultiplier = Math.max(
                        currentLineMetrics.heightMultiplier,
                        span.style.heightMultiplier / 1.5
                    );
                }

                currentLineMetrics.height = Math.max(
                    currentLineMetrics.height,
                    currentLineMetrics.ascent + currentLineMetrics.descent
                );

                currentLineMetrics.baseline = Math.max(
                    currentLineMetrics.baseline,
                    currentLineMetrics.ascent
                );

                if (this.paragraph.iconFontData) {
                    const textWidth = span.charSequence.length * iconFontWidth;
                    currentLineMetrics.endIndex += span.charSequence.length;
                    currentLineMetrics.width += textWidth;
                } else if (
                    currentLineMetrics.width + matrics.width < layoutWidth &&
                    !span.hasLetterSpacing() &&
                    !span.hasWordSpacing() &&
                    !forceCalcGlyphInfos
                ) {
                    // fast measure
                    if (span instanceof NewlineSpan) {
                        const newLineMatrics: LineMetrics =
                            this.createNewLine(currentLineMetrics);
                        lineMetrics.push(currentLineMetrics);
                        currentLineMetrics = newLineMatrics;
                    } else {
                        currentLineMetrics.endIndex += span.charSequence.length;
                        currentLineMetrics.width += matrics.width;
                        if (span.style.fontStyle?.slant === FontSlant.Italic) {
                            currentLineMetrics.width += 2;
                        }
                    }
                } else {
                    let letterMeasureResult = LetterMeasurer.measureLetters(
                        span,
                        TextLayoutService.sharedLayoutContext
                    );
                    let advances: number[] = letterMeasureResult.advances;

                    if (span instanceof NewlineSpan) {
                        advances = [0, 0];
                    }

                    if (
                        Math.abs(advances[advances.length - 1] - layoutWidth) < 10 &&
                        layoutWidth === this.previousLayoutWidth
                    ) {
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
                        let nextWord = currentWord + span.charSequence[index + 1] ?? "";
                        if (advances[index + 1] === undefined) {
                            currentWordWidth += advances[index] - advances[index - 1];
                        } else {
                            currentWordWidth += advances[index + 1] - advances[index];
                        }
                        if (advances[index + 2] === undefined) {
                            nextWordWidth = currentWordWidth;
                        } else {
                            nextWordWidth =
                                currentWordWidth + (advances[index + 2] - advances[index + 1]);
                        }
                        currentWordLength += 1;
                        canBreak = true;
                        forceBreak = false;

                        if (spanEnded) {
                            canBreak = true;
                        } else if (isEnglishWord(nextWord)) {
                            canBreak = false;
                        }
                        if (
                            isPunctuation(nextWord[nextWord.length - 1]) &&
                            currentLineMetrics.width + nextWordWidth >= layoutWidth
                        ) {
                            forceBreak = true;
                        }
                        if (span instanceof NewlineSpan) {
                            forceBreak = true;
                        }

                        const currentGlyphLeft =
                            currentLineMetrics.width + currentLetterLeft;
                        const currentGlyphTop = currentLineMetrics.yOffset;
                        const currentGlyphWidth = (() => {
                            if (advances[index + 1] === undefined) {
                                return advances[index] - advances[index - 1];
                            } else {
                                return advances[index + 1] - advances[index];
                            }
                        })();
                        const currentGlyphHeight = currentLineMetrics.height;
                        const currentGlyphInfo: GlyphInfo = {
                            graphemeLayoutBounds: Float32Array.of(// valueOfRectXYWH(
                                currentGlyphLeft,
                                currentGlyphTop,
                                currentGlyphLeft + currentGlyphWidth,
                                currentGlyphTop + currentGlyphHeight
                            ),
                            graphemeClusterTextRange: { start: index, end: index + 1 },
                            dir: TextDirection.LTR,
                            isEllipsis: false,
                        };
                        this.glyphInfos.push(currentGlyphInfo);

                        if (!canBreak) {
                            continue;
                        } else if (
                            !forceBreak &&
                            currentLineMetrics.width + currentWordWidth <= layoutWidth
                        ) {
                            currentLineMetrics.width += currentWordWidth;
                            currentLineMetrics.endIndex += currentWordLength;
                            currentWord = "";
                            currentWordWidth = 0;
                            currentWordLength = 0;
                            canBreak = true;
                        } else if (
                            forceBreak ||
                            currentLineMetrics.width + currentWordWidth > layoutWidth
                        ) {
                            const newLineMatrics: LineMetrics =
                                this.createNewLine(currentLineMetrics);
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
        if (
            this.paragraph.paragraphStyle.maxLines &&
            lineMetrics.length > this.paragraph.paragraphStyle.maxLines
        ) {
            this.didExceedMaxLines = true;
            lineMetrics = lineMetrics.slice(
                0,
                this.paragraph.paragraphStyle.maxLines
            );
        } else {
            this.didExceedMaxLines = false;
        }
        // logger.debug("TextLayout.layout.lineMetrics", lineMetrics);
        // if (logger.profileMode) {
        //   const layoutCostTime = new Date().getTime() - layoutStartTime;
        //   logger.profile("Layout cost", layoutCostTime);
        // }
        lineMetrics[lineMetrics.length - 1].isLastLine = true;
        this.lineMetrics = lineMetrics;
        // console.log("TextLayout.layout.lineMetrics", lineMetrics);
    }

    private createNewLine(currentLineMetrics: LineMetrics): LineMetrics {
        return {
            startIndex: currentLineMetrics.endIndex,
            endIndex: currentLineMetrics.endIndex,
            endExcludingWhitespaces: 0,
            endIncludingNewline: 0,
            isHardBreak: false,
            ascent: currentLineMetrics.ascent,
            descent: currentLineMetrics.descent,
            height: currentLineMetrics.height,
            heightMultiplier: Math.max(
                1,
                (this.paragraph.paragraphStyle.heightMultiplier ?? 1.5) / 1.5
            ),
            width: 0,
            justifyWidth: currentLineMetrics.justifyWidth,
            left: 0,
            yOffset:
                currentLineMetrics.yOffset +
                currentLineMetrics.height * currentLineMetrics.heightMultiplier +
                currentLineMetrics.height * 0.15, // 行间距
            baseline: currentLineMetrics.baseline,
            lineNumber: currentLineMetrics.lineNumber + 1,
            isLastLine: false,
        };
    }
}

export class _Paragraph extends SkEmbindObject<"Paragraph"> implements Paragraph {
    iconFontMap?: Record<string, string>;

    private _textLayout = new TextLayoutService(this);
    private _painter = new TextPaintService(this);

    constructor(
        readonly spans: Span[],
        readonly paragraphStyle: ParagraphStyle,
        readonly iconFontData?: string
    ) {
        super("Paragraph");
        if (this.iconFontData) {
            // this.iconFontMap = JSON.parse(this.iconFontData);
        }
    }


    didExceedMaxLines(): boolean {
        return this._textLayout.didExceedMaxLines;
    }

    getAlphabeticBaseline(): number {
        return 0;
    }

    /**
     * Returns the index of the glyph that corresponds to the provided coordinate,
     * with the top left corner as the origin, and +y direction as down.
     */
    getGlyphPositionAtCoordinate(dx: number, dy: number): PositionWithAffinity {
        // throw new Error("getGlyphPositionAtCoordinate not implemented")
        this._textLayout.measureGlyphIfNeeded();
        for (let index = 0; index < this._textLayout.glyphInfos.length; index++) {
            const glyphInfo = this._textLayout.glyphInfos[index];
            const left = glyphInfo.graphemeLayoutBounds[0];
            const top = glyphInfo.graphemeLayoutBounds[1];
            const width = glyphInfo.graphemeLayoutBounds[2] - left;
            const height = glyphInfo.graphemeLayoutBounds[3] - top;
            if (dx >= left && dx <= left + width && dy >= top && dy <= top + height) {
                return { pos: index, affinity: AffinityEnums.Downstream };
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
                        affinity: AffinityEnums.Downstream,
                    };
                } else if (dx >= width) {
                    return {
                        pos: lineMetrics.endIndex,
                        affinity: AffinityEnums.Downstream,
                    };
                }
            }
            if (dy >= top + height && isLastLine) {
                return {
                    pos: lineMetrics.endIndex,
                    affinity: AffinityEnums.Downstream,
                };
            }
        }
        return { pos: 0, affinity: AffinityEnums.Upstream };
    }

    /**
     * Returns the information associated with the closest glyph at the specified
     * paragraph coordinate, or null if the paragraph is empty.
     */
    getClosestGlyphInfoAtCoordinate(dx: number, dy: number): GlyphInfo | null {
        return this.getGlyphInfoAt(this.getGlyphPositionAtCoordinate(dx, dy).pos);
    }

    /**
     * Returns the information associated with the glyph at the specified UTF-16
     * offset within the paragraph's visible lines, or null if the index is out
     * of bounds, or points to a codepoint that is logically after the last
     * visible codepoint.
     */
    getGlyphInfoAt(index: number): GlyphInfo | null {
        // throw new Error("getGlyphInfoAt not implemented")

        this._textLayout.measureGlyphIfNeeded();
        return this._textLayout.glyphInfos[index] ?? null;
    }

    getHeight(): number {
        const lineMetrics = this.getLineMetrics();
        let height = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            height += lineMetrics[i].height * lineMetrics[i].heightMultiplier;
            if (i > 0 && i < lineMetrics.length) {
                height += lineMetrics[i].height * 0.15;
            }
        }
        console.log("getHeight", height);
        return height;
    }

    getIdeographicBaseline(): number {
        return 0;
    }

    /**
     * Returns the line number of the line that contains the specified UTF-16
     * offset within the paragraph, or -1 if the index is out of bounds, or
     * points to a codepoint that is logically after the last visible codepoint.
     */
    getLineNumberAt(index: number): number {
        return this.getLineMetricsOfRange(index, index)[0]?.lineNumber ?? 0;
    }

    getLineMetrics(): LineMetrics[] {
        // console.log("getLineMetrics");
        return this._textLayout.lineMetrics;
    }

    /**
     * Returns the LineMetrics of the line at the specified line number, or null
     * if the line number is out of bounds, or is larger than or equal to the
     * specified max line number.
     */
    getLineMetricsAt(lineNumber: number): LineMetrics | null {
        return this._textLayout.lineMetrics[lineNumber] ?? null;
    }

    getLineMetricsOfRange(start: number, end: number): LineMetrics[] {
        let lineMetrics: LineMetrics[] = [];
        this._textLayout.lineMetrics.forEach((it) => {
            const range0 = [start, end];
            const range1 = [it.startIndex, it.endIndex];
            const hasIntersection = range0[1] >= range1[0] && range1[1] >= range0[0];
            if (hasIntersection) {
                lineMetrics.push(it);
            }
        });
        return lineMetrics;
    }

    getLongestLine(): number {
        return 0;
    }

    getMaxIntrinsicWidth(): number {
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(
                maxWidth,
                lineMetrics[i].justifyWidth ?? lineMetrics[i].width
            );
        }
        // console.log("getMaxIntrinsicWidth", maxWidth);
        return maxWidth;
    }

    getMaxWidth(): number {
        const lineMetrics = this.getLineMetrics();
        let maxWidth = 0;
        for (let i = 0; i < lineMetrics.length; i++) {
            maxWidth = Math.max(
                maxWidth,
                lineMetrics[i].justifyWidth ?? lineMetrics[i].width
            );
        }
        // console.log("getMaxWidth", maxWidth);
        return maxWidth;
    }

    getMinIntrinsicWidth(): number {
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
    getNumberOfLines(): number {
        return this._textLayout.lineMetrics.length;
    }

    getRectsForPlaceholders(): RectWithDirection[] {
        return [];
    }

    /**
     * Returns bounding boxes that enclose all text in the range of glpyh indexes [start, end).
     * @param start
     * @param end
     * @param hStyle
     * @param wStyle
     */
    getRectsForRange(
        start: number,
        end: number,
        hStyle: RectHeightStyle,
        wStyle: RectWidthStyle,
    ): RectWithDirection[] {
        this._textLayout.measureGlyphIfNeeded();
        let result: RectWithDirection[] = [];
        this._textLayout.lineMetrics.forEach((it) => {
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
                    const glyphInfo = this._textLayout.glyphInfos[index];
                    if (glyphInfo) {
                        if (currentLineLeft < 0) {
                            currentLineLeft = glyphInfo.graphemeLayoutBounds[0];
                        }
                        if (currentLineTop < 0) {
                            currentLineTop = glyphInfo.graphemeLayoutBounds[1];
                        }
                        currentLineTop = Math.min(
                            currentLineTop,
                            glyphInfo.graphemeLayoutBounds[1]
                        );
                        currentLineWidth =
                            glyphInfo.graphemeLayoutBounds[2] - currentLineLeft;
                        currentLineHeight = Math.max(
                            currentLineHeight,
                            glyphInfo.graphemeLayoutBounds[3] - currentLineTop
                        );
                    }
                }
                result.push({
                    rect: new Float32Array([
                        currentLineLeft,
                        currentLineTop,
                        currentLineLeft + currentLineWidth,
                        currentLineTop + currentLineHeight,
                    ]),
                    dir: TextDirectionEnums.LTR,
                });
            }
        });
        if (result.length === 0) {
            const lastSpan = this.spans[this.spans.length - 1];
            const lastLine =
                this._textLayout.lineMetrics[this._textLayout.lineMetrics.length - 1];
            if (
                end > lastLine.endIndex &&
                lastSpan instanceof TextSpan &&
                lastSpan.originText.endsWith("\n")
            ) {
                return [
                    {
                        rect: new Float32Array([
                            0,
                            lastLine.yOffset,
                            0,
                            lastLine.yOffset + lastLine.height,
                        ]),
                        dir: TextDirectionEnums.LTR,
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
    getWordBoundary(offset: number): URange {
        throw new Error("Not implemented");
        return { start: offset, end: offset };
    }

    /**
     * Returns an array of ShapedLine objects, describing the paragraph.
     */
    getShapedLines(): ShapedLine[] {
        throw new Error("Not implemented");
        return [];
    }

    /**
     * Lays out the text in the paragraph so it is wrapped to the given width.
     * @param width
     */
    layout(width: number): void {
        this._textLayout.layout(width);
    }

    /**
     * When called after shaping, returns the glyph IDs which were not matched
     * by any of the provided fonts.
     */
    unresolvedCodepoints(): number[] {
        throw new Error("Not implemented");
        return [];
    }

    draw(context: CanvasRenderingContext2D, pixelRatio: number = 1.0):ImageData  {
        return this._painter.draw(context, pixelRatio)
    }
}

export class _ParagraphBuilder extends SkEmbindObject<"ParagraphBuilder"> implements ParagraphBuilder {
    static MakeFromFontProvider(style: ParagraphStyle, fontSrc: TypefaceFontProvider): ParagraphBuilder {
        throw new Error("MakeFromFontProvider not implemented.");
    }

    static ShapeText(text: string, runs: FontBlock[], width?: number): ShapedLine[] {
        throw new Error("ShapeText not implemented.");
    }

    static Make(style: ParagraphStyle, fontManager: FontMgr): ParagraphBuilder {
        return this.MakeFromFontCollection(style, null);
    }

    static MakeFromFontCollection(
        style: ParagraphStyle,
        fontCollection: FontCollection
    ): ParagraphBuilder {
        return new _ParagraphBuilder(style);
        throw new Error("MakeFromFontCollection not implemented.");
    }

    static RequiresClientICU(): boolean {
        return false;
    }

    constructor(readonly style: ParagraphStyle, readonly iconFontData?: string) {
        super("ParagraphBuilder")
    }

    private spans: Span[] = [];
    private styles: TextStyle[] = [];

    /**
     * Pushes the information required to leave an open space.
     * @param width
     * @param height
     * @param alignment
     * @param baseline
     * @param offset
     */
    addPlaceholder(
        width?: number,
        height?: number,
        alignment?: PlaceholderAlignment,
        baseline?: TextBaseline,
        offset?: number
    ): void { }

    /**
     * Adds text to the builder. Forms the proper runs to use the upper-most style
     * on the style_stack.
     * @param str
     */
    addText(str: string): void {
        console.log("ParagraphBuilder.addText", str);
        let mergedStyle: TextStyle = {};
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
    build(): _Paragraph {
        console.log("ParagraphBuilder.build");
        console.log("spans:", this.spans.length);
        return new _Paragraph(this.spans, this.style, this.iconFontData);
    }

    /**
     * @param words is an array of word edges (starting or ending). You can
     * pass 2 elements (0 as a start of the entire text and text.size as the
     * end). This information is only needed for a specific API method getWords.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setWordsUtf8(words: InputWords): void { }
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
    setWordsUtf16(words: InputWords): void { }

    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setGraphemeBreaksUtf8(graphemes: InputGraphemes): void { }
    /**
     * @param graphemes is an array of indexes in the input text that point
     * to the start of each grapheme.
     *
     * The indices are expected to be relative to the UTF-16 representation of
     * the text.
     *
     * The `Intl.Segmenter` API can be used as a source for this data.
     */
    setGraphemeBreaksUtf16(graphemes: InputGraphemes): void { }

    /**
     * @param lineBreaks is an array of unsigned integers that should be
     * treated as pairs (index, break type) that point to the places of possible
     * line breaking if needed. It should include 0 as the first element.
     * Break type == 0 means soft break, break type == 1 is a hard break.
     *
     * The indices are expected to be relative to the UTF-8 representation of
     * the text.
     */
    setLineBreaksUtf8(lineBreaks: InputLineBreaks): void { }
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
    setLineBreaksUtf16(lineBreaks: InputLineBreaks): void { }

    /**
     * Returns the entire Paragraph text (which is useful in case that text
     * was produced as a set of addText calls).
     */
    getText(): string {
        throw new Error("Method not implemented.");
        // let text = "";
        // this.spans.forEach((it) => {
        //   if (it instanceof TextSpan) {
        //     text += it.originText;
        //   }
        // });
        // if (typeof window === "object" && window.TextEncoder) {
        //   const encoder = new window.TextEncoder();
        //   const view = encoder.encode(text);
        //   return String.fromCharCode(...Array.from(view));
        // }
        // return text;
    }

    /**
     * Remove a style from the stack. Useful to apply different styles to chunks
     * of text such as bolding.
     */
    pop(): void {
        // logger.debug("ParagraphBuilder.pop");
        this.styles.pop();
    }

    /**
     * Push a style to the stack. The corresponding text added with addText will
     * use the top-most style.
     * @param textStyle
     */
    pushStyle(textStyle: TextStyle): void {
        // logger.debug("ParagraphBuilder.pushStyle", textStyle);
        this.styles.push(textStyle);
    }

    /**
     * Pushes a TextStyle using paints instead of colors for foreground and background.
     * @param textStyle
     * @param fg
     * @param bg
     */
    pushPaintStyle(textStyle: TextStyle, fg: _Paint, bg: _Paint): void {
        // logger.debug("ParagraphBuilder.pushPaintStyle", textStyle, fg, bg);
        this.styles.push(textStyle);
    }

    /**
     * Resets this builder to its initial state, discarding any text, styles, placeholders that have
     * been added, but keeping the initial ParagraphStyle.
     */
    reset(): void {
        // logger.debug("ParagraphBuilder.reset");
        throw new Error("Method not implemented.");
        this.spans = [];
        this.styles = [];
    }
}
