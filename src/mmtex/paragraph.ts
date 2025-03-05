// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { ParagraphStyle } from "@/mtex/canvaskit";
import { LineBreaker } from "./line_breaker";
import { LayoutFragment } from "./layout_fragmenter";

// import { TextDirection, Offset, Rect } from './text_engine';

/**
 * Constraints for paragraph layout.
 */
export interface ParagraphConstraints {
    /** The width the paragraph should use. */
    width: number;
}

/**
 * A position in a paragraph of text.
 */
export class TextPosition {
    constructor(
        readonly offset: number,
        readonly affinity: TextAffinity = TextAffinity.downstream,
    ) { }
}

/**
 * Determines how to handle the cursor when it is placed at a position 
 * that contains bidirectional text.
 */
export enum TextAffinity {
    /** The cursor is positioned upstream of any bidirectional text. */
    upstream,

    /** The cursor is positioned downstream of any bidirectional text. */
    downstream,
}

/**
 * A rectangle that contains a part of a paragraph's text.
 */
export class TextBox {
    constructor(
        readonly left: number,
        readonly top: number,
        readonly right: number,
        readonly bottom: number,
        readonly direction: TextDirection,
    ) { }

    get width(): number {
        return this.right - this.left;
    }

    get height(): number {
        return this.bottom - this.top;
    }

    toRect(): Rect {
        return {
            left: this.left,
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            width: this.width,
            height: this.height,
        };
    }
}

/**
 * How to measure the width of boxes containing text.
 */
export enum BoxWidthStyle {
    /** Boxes use the width of their text. */
    tight,

    /** Boxes use the width of their text plus any trailing spaces. */
    max,
}

/**
 * How to measure the height of boxes containing text.
 */
export enum BoxHeightStyle {
    /** Boxes use the height of their text. */
    tight,

    /** Boxes use the height of their line. */
    max,

    /** 
     * Boxes use the height of their line plus any space above and below 
     * the line specified in the paragraph style.
     */
    includeLineSpacingMiddle,

    /**
     * Boxes use the height of their line plus any space above and below
     * the line specified in the paragraph style, but distributed evenly
     * above and below the line.
     */
    includeLineSpacingTop,

    /**
     * Similar to includeLineSpacingMiddle, but the baseline is at the
     * top of the line spacing.
     */
    strut,
}

/**
 * Information about a glyph in text.
 */
export interface GlyphInfo {
    /** The number of UTF-16 code units in the glyph cluster. */
    graphemeClusterLength: number;

    /** The directionality of the glyph cluster. */
    directionality: TextDirection;
}

/**
 * A paragraph of text.
 */
export interface Paragraph {
    /** The width of the paragraph. */
    readonly width: number;

    /** The height of the paragraph. */
    readonly height: number;

    /** The minimum intrinsic width of the paragraph. */
    readonly minIntrinsicWidth: number;

    /** The maximum intrinsic width of the paragraph. */
    readonly maxIntrinsicWidth: number;

    /** The alphabetic baseline of the paragraph. */
    readonly alphabeticBaseline: number;

    /** The ideographic baseline of the paragraph. */
    readonly ideographicBaseline: number;

    /** Whether the paragraph exceeded its maximum number of lines. */
    readonly didExceedMaxLines: boolean;

    /** Lays out the paragraph with the given constraints. */
    layout(constraints: ParagraphConstraints): void;

    /** Gets the position in the text for the given pixel offset. */
    getPositionForOffset(offset: Offset): TextPosition;

    /** Gets text boxes that contain the given text range. */
    getBoxesForRange(
        start: number,
        end: number,
        boxHeightStyle?: BoxHeightStyle,
        boxWidthStyle?: BoxWidthStyle,
    ): TextBox[];

    /** Gets the closest glyph information for the given offset. */
    getClosestGlyphInfo(offset: Offset): GlyphInfo | null;
}

/**
 * Metrics for a line of text.
 */
export interface LineMetrics {
    /** The index where this line begins in the text. */
    startIndex: number;

    /** The index where this line ends in the text. */
    endIndex: number;

    /** Whether this line ends with a hard line break. */
    hardBreak: boolean;

    /** The ascent of this line. */
    ascent: number;

    /** The descent of this line. */
    descent: number;

    /** Any additional space above this line. */
    unscaledAscent: number;

    /** The height of this line. */
    height: number;

    /** The width of this line. */
    width: number;

    /** The left offset of this line. */
    left: number;

    /** The baseline of this line. */
    baseline: number;

    /** The line number (0-based). */
    lineNumber: number;
}

/**
 * A builder for creating paragraphs.
 */
export interface ParagraphBuilder {
    /** Adds text to the paragraph. */
    addText(text: string): void;

    /** Pushes a style to the stack. */
    pushStyle(style: TextStyle): void;

    /** Pops the current style from the stack. */
    pop(): void;

    /** Builds the paragraph. */
    build(): Paragraph;
}

/**
 * The different ways of measuring the width of a line of text.
 */
export enum TextWidthBasis {
    /** 
     * The width is the width of the widest line, including any trailing 
     * spaces.
     */
    parent,

    /** The width is the width of the widest line without trailing spaces. */
    longestLine,
}

/**
 * The different ways of handling text that overflows its bounds.
 */
export enum TextOverflow {
    /** Clip the overflowing text. */
    clip,

    /** Fade the overflowing text to transparent. */
    fade,

    /** Show an ellipsis after the overflowing text. */
    ellipsis,

    /** Allow the text to overflow its bounds. */
    visible,
}

/**
 * The different ways of aligning text horizontally.
 */
export enum TextAlign {
    left,
    right,
    center,
    justify,
    start,
    end,
}

/**
 * The different ways of aligning text vertically.
 */
export enum TextAlignVertical {
    top,
    center,
    bottom,
}

/**
 * The different ways of handling text that wraps at soft line breaks.
 */
export enum TextWrap {
    /** Break text at word boundaries. */
    word,

    /** Break text at character boundaries. */
    character,
}

/**
 * A range of text within a paragraph.
 */
export class TextRange {
    constructor(
        readonly start: number,
        readonly end: number,
    ) { }

    /**
     * Returns true if this range contains the given offset.
     */
    contains(offset: number): boolean {
        return offset >= this.start && offset < this.end;
    }

    /**
     * Returns true if this range intersects with the given range.
     */
    intersects(other: TextRange): boolean {
        return other.start < this.end && this.start < other.end;
    }

    /**
     * Returns the length of this range.
     */
    get length(): number {
        return this.end - this.start;
    }

    /**
     * Returns true if this range is empty (start equals end).
     */
    get isEmpty(): boolean {
        return this.start === this.end;
    }
}

/**
 * A selection of text within a paragraph.
 */
export class TextSelection extends TextRange {
    constructor(
        start: number,
        end: number,
        readonly affinity: TextAffinity = TextAffinity.downstream,
        readonly isDirectional: boolean = false,
    ) {
        super(start, end);
    }

    /**
     * Returns the position where the selection starts.
     */
    get baseOffset(): number {
        return this.isDirectional ? this.start : Math.min(this.start, this.end);
    }

    /**
     * Returns the position where the selection ends.
     */
    get extentOffset(): number {
        return this.isDirectional ? this.end : Math.max(this.start, this.end);
    }

    /**
     * Creates a collapsed selection at the given offset.
     */
    static collapsed(offset: number, affinity = TextAffinity.downstream): TextSelection {
        return new TextSelection(offset, offset, affinity);
    }
}

// /**
//  * A paragraph style that can be built up incrementally.
//  */
// export class ParagraphStyle {
//     constructor(
//         readonly textAlign?: TextAlign,
//         readonly textDirection?: TextDirection,
//         readonly maxLines?: number,
//         readonly fontFamily?: string,
//         readonly fontSize?: number,
//         readonly height?: number,
//         readonly textHeightBehavior?: TextHeightBehavior,
//         readonly fontWeight?: FontWeight,
//         readonly fontStyle?: FontStyle,
//         readonly letterSpacing?: number,
//         readonly wordSpacing?: number,
//         readonly textBaseline?: TextBaseline,
//         readonly leadingDistribution?: TextLeadingDistribution,
//         readonly foreground?: Paint,
//         readonly background?: Paint,
//         readonly shadows?: Shadow[],
//         readonly fontFeatures?: FontFeature[],
//         readonly fontVariations?: FontVariation[],
//         readonly decoration?: TextDecoration,
//         readonly decorationColor?: Color,
//         readonly decorationStyle?: TextDecorationStyle,
//         readonly decorationThickness?: number,
//         readonly overflow?: TextOverflow,
//     ) { }

//     /**
//      * Returns a new paragraph style that is a combination of this style and the given style.
//      */
//     merge(other: ParagraphStyle | null): ParagraphStyle {
//         if (!other) return this;
//         return new ParagraphStyle(
//             other.textAlign ?? this.textAlign,
//             other.textDirection ?? this.textDirection,
//             other.maxLines ?? this.maxLines,
//             other.fontFamily ?? this.fontFamily,
//             other.fontSize ?? this.fontSize,
//             other.height ?? this.height,
//             other.textHeightBehavior ?? this.textHeightBehavior,
//             other.fontWeight ?? this.fontWeight,
//             other.fontStyle ?? this.fontStyle,
//             other.letterSpacing ?? this.letterSpacing,
//             other.wordSpacing ?? this.wordSpacing,
//             other.textBaseline ?? this.textBaseline,
//             other.leadingDistribution ?? this.leadingDistribution,
//             other.foreground ?? this.foreground,
//             other.background ?? this.background,
//             other.shadows ?? this.shadows,
//             other.fontFeatures ?? this.fontFeatures,
//             other.fontVariations ?? this.fontVariations,
//             other.decoration ?? this.decoration,
//             other.decorationColor ?? this.decorationColor,
//             other.decorationStyle ?? this.decorationStyle,
//             other.decorationThickness ?? this.decorationThickness,
//             other.overflow ?? this.overflow,
//         );
//     }
// }

/**
 * How text should be scaled to fit within its bounds.
 */
export enum TextScaleFactor {
    /** Scale the text up or down to fit exactly within its bounds. */
    fit,

    /** Scale the text down to fit within its bounds, but not up. */
    shrink,
}

/**
 * Defines how the paragraph's height should be handled.
 */
export interface TextHeightBehavior {
    /** Whether to apply additional leading at the top of the paragraph. */
    applyHeightToFirstAscent: boolean;

    /** Whether to apply additional leading at the bottom of the paragraph. */
    applyHeightToLastDescent: boolean;

    /** How to distribute additional leading space. */
    leadingDistribution: TextLeadingDistribution;
}

/**
 * A span of text with a specific style.
 */
export class ParagraphSpan {
    constructor(
        readonly text: string,
        readonly style: TextStyle,
        readonly start: number,
        readonly end: number,
    ) { }

    /**
     * Returns true if this span contains the given offset.
     */
    containsOffset(offset: number): boolean {
        return offset >= this.start && offset < this.end;
    }

    /**
     * Returns true if this span intersects with the given range.
     */
    intersectsRange(start: number, end: number): boolean {
        return start < this.end && this.start < end;
    }
}

/**
 * A concrete implementation of ParagraphBuilder.
 */
export class CanvasParagraphBuilder implements ParagraphBuilder {
    private readonly _spans: ParagraphSpan[] = [];
    private readonly _styleStack: TextStyle[] = [];
    private _text = '';

    constructor(
        private readonly _paragraphStyle: ParagraphStyle,
    ) {
        // Push the paragraph style as the initial style
        this._styleStack.push(new TextStyle({
            textAlign: _paragraphStyle.textAlign,
            textDirection: _paragraphStyle.textDirection,
            fontWeight: _paragraphStyle.fontWeight,
            fontStyle: _paragraphStyle.fontStyle,
            fontFamily: _paragraphStyle.fontFamily,
            fontSize: _paragraphStyle.fontSize,
            letterSpacing: _paragraphStyle.letterSpacing,
            wordSpacing: _paragraphStyle.wordSpacing,
            height: _paragraphStyle.height,
            leadingDistribution: _paragraphStyle.leadingDistribution,
            foreground: _paragraphStyle.foreground,
            background: _paragraphStyle.background,
            decoration: _paragraphStyle.decoration,
            decorationColor: _paragraphStyle.decorationColor,
            decorationStyle: _paragraphStyle.decorationStyle,
            decorationThickness: _paragraphStyle.decorationThickness,
            textBaseline: _paragraphStyle.textBaseline,
            shadows: _paragraphStyle.shadows,
            fontFeatures: _paragraphStyle.fontFeatures,
            fontVariations: _paragraphStyle.fontVariations,
        }));
    }

    addText(text: string): void {
        const start = this._text.length;
        this._text += text;
        const end = this._text.length;

        // Create a span with the current style
        const style = this._styleStack[this._styleStack.length - 1];
        this._spans.push(new ParagraphSpan(text, style, start, end));
    }

    pushStyle(style: TextStyle): void {
        // Merge the new style with the current style
        const currentStyle = this._styleStack[this._styleStack.length - 1];
        this._styleStack.push(currentStyle.merge(style));
    }

    pop(): void {
        if (this._styleStack.length > 1) {
            this._styleStack.pop();
        }
    }

    build(): Paragraph {
        return new CanvasParagraph(
            this._text,
            this._paragraphStyle,
            this._spans,
        );
    }
}

/**
 * A text style that can be built up incrementally.
 */
export class TextStyle {
    constructor(readonly props: {
        color?: number;
        decoration?: TextDecoration;
        decorationColor?: Color;
        decorationStyle?: TextDecorationStyle;
        decorationThickness?: number;
        fontWeight?: FontWeight;
        fontStyle?: FontStyle;
        textBaseline?: TextBaseline;
        fontFamily?: string;
        fontSize?: number;
        letterSpacing?: number;
        wordSpacing?: number;
        height?: number;
        leadingDistribution?: TextLeadingDistribution;
        locale?: string;
        background?: Paint;
        foreground?: Paint;
        shadows?: Shadow[];
        fontFeatures?: FontFeature[];
        fontVariations?: FontVariation[];
    } = {}) { }

    /**
     * Returns a new text style that is a combination of this style and the given style.
     */
    merge(other: TextStyle | null): TextStyle {
        if (!other) return this;
        return new TextStyle({
            ...this.props,
            ...other.props,
        });
    }

    /**
     * Returns the CSS font string for this style.
     */
    get cssFontString(): string {
        const parts: string[] = [];

        if (this.props.fontStyle) {
            parts.push(this.props.fontStyle.toString());
        }

        if (this.props.fontWeight) {
            parts.push(this.props.fontWeight.toString());
        }

        if (this.props.fontSize) {
            parts.push(`${this.props.fontSize}px`);
        }

        if (this.props.fontFamily) {
            parts.push(this.props.fontFamily);
        }

        return parts.join(' ');
    }
}

/**
 * A factory for creating paragraph builders.
 */
export class ParagraphBuilderFactory {
    /**
     * Creates a new paragraph builder with the given style.
     */
    static create(style: ParagraphStyle): ParagraphBuilder {
        return new CanvasParagraphBuilder(style);
    }
}

/**
 * A concrete implementation of Paragraph that renders to a canvas.
 */
export class CanvasParagraph implements Paragraph {
    private readonly _layoutService: LayoutService;
    private readonly _paintService: PaintService;
    private _width = 0;
    private _height = 0;
    private _minIntrinsicWidth = 0;
    private _maxIntrinsicWidth = 0;
    private _alphabeticBaseline = 0;
    private _ideographicBaseline = 0;
    private _didExceedMaxLines = false;
    private _lineMetrics: LineMetrics[] = [];

    constructor(
        readonly plainText: string,
        readonly style: ParagraphStyle,
        readonly spans: ParagraphSpan[],
    ) {
        this._layoutService = new LayoutService(this);
        this._paintService = new PaintService(this);
    }

    get width(): number { return this._width; }
    get height(): number { return this._height; }
    get minIntrinsicWidth(): number { return this._minIntrinsicWidth; }
    get maxIntrinsicWidth(): number { return this._maxIntrinsicWidth; }
    get alphabeticBaseline(): number { return this._alphabeticBaseline; }
    get ideographicBaseline(): number { return this._ideographicBaseline; }
    get didExceedMaxLines(): boolean { return this._didExceedMaxLines; }

    layout(constraints: ParagraphConstraints): void {
        // Reset layout state
        this._width = constraints.width;
        this._height = 0;
        this._lineMetrics = [];

        // Perform layout
        const lines = this._layoutService.layoutText(
            this.plainText,
            this.spans,
            constraints.width,
            this.style,
        );

        // Update metrics
        for (const line of lines) {
            this._height += line.height;
            this._lineMetrics.push(line.toMetrics(this._lineMetrics.length));
        }

        // Update intrinsic widths
        this._minIntrinsicWidth = this._layoutService.computeMinIntrinsicWidth();
        this._maxIntrinsicWidth = this._layoutService.computeMaxIntrinsicWidth();

        // Update baselines
        if (lines.length > 0) {
            const firstLine = lines[0];
            this._alphabeticBaseline = firstLine.baseline;
            this._ideographicBaseline = firstLine.baseline + (firstLine.height * 0.2);
        }

        // Check if we exceeded max lines
        if (this.style.maxLines !== undefined && lines.length > this.style.maxLines) {
            this._didExceedMaxLines = true;
            // Truncate lines and update height
            lines.length = this.style.maxLines;
            this._height = lines.reduce((h, l) => h + l.height, 0);
        }
    }

    paint(canvas: BitmapCanvas, offset: Offset): void {
        this._paintService.paint(canvas, offset);
    }

    getPositionForOffset(offset: Offset): TextPosition {
        return this._layoutService.getPositionForOffset(offset);
    }

    getBoxesForRange(
        start: number,
        end: number,
        boxHeightStyle: BoxHeightStyle = BoxHeightStyle.tight,
        boxWidthStyle: BoxWidthStyle = BoxWidthStyle.tight,
    ): TextBox[] {
        return this._layoutService.getBoxesForRange(
            start,
            end,
            boxHeightStyle,
            boxWidthStyle,
        );
    }

    getClosestGlyphInfo(offset: Offset): GlyphInfo | null {
        return this._layoutService.getClosestGlyphInfo(offset);
    }

    getLineMetrics(): LineMetrics[] {
        return this._lineMetrics;
    }

    /**
     * Returns the text direction for the given offset.
     */
    getTextDirection(offset: number): TextDirection {
        // Find the span that contains this offset
        const span = this.spans.find(s => s.containsOffset(offset));
        if (!span) {
            return this.style.textDirection ?? TextDirection.ltr;
        }
        return span.style.props.textDirection ?? this.style.textDirection ?? TextDirection.ltr;
    }

    /**
     * Returns true if the paragraph contains any right-to-left text.
     */
    containsRtlText(): boolean {
        return this.spans.some(span =>
            span.style.props.textDirection === TextDirection.rtl
        );
    }

    /**
     * Returns the style at the given offset.
     */
    getStyleForOffset(offset: number): TextStyle | null {
        const span = this.spans.find(s => s.containsOffset(offset));
        return span?.style ?? null;
    }
}

/**
 * A line of text in a paragraph.
 */
export interface ParagraphLine {
    /** The start index in the text. */
    start: number;

    /** The end index in the text. */
    end: number;

    /** Whether this line ends with a hard break. */
    hardBreak: boolean;

    /** The width of the line. */
    width: number;

    /** The height of the line. */
    height: number;

    /** The ascent of the line. */
    ascent: number;

    /** The descent of the line. */
    descent: number;

    /** The unscaled ascent of the line. */
    unscaledAscent: number;

    /** The baseline of the line. */
    baseline: number;

    /** The left offset of the line. */
    left: number;
}

/**
 * Metrics for a line of text in the engine.
 */
export class EngineLineMetrics implements LineMetrics {
    constructor(
        readonly startIndex: number,
        readonly endIndex: number,
        readonly hardBreak: boolean,
        readonly ascent: number,
        readonly descent: number,
        readonly unscaledAscent: number,
        readonly height: number,
        readonly width: number,
        readonly left: number,
        readonly baseline: number,
        readonly lineNumber: number,
    ) { }

    /**
     * Creates a copy of this metrics with the given fields replaced.
     */
    copyWith(fields: Partial<LineMetrics>): EngineLineMetrics {
        return new EngineLineMetrics(
            fields.startIndex ?? this.startIndex,
            fields.endIndex ?? this.endIndex,
            fields.hardBreak ?? this.hardBreak,
            fields.ascent ?? this.ascent,
            fields.descent ?? this.descent,
            fields.unscaledAscent ?? this.unscaledAscent,
            fields.height ?? this.height,
            fields.width ?? this.width,
            fields.left ?? this.left,
            fields.baseline ?? this.baseline,
            fields.lineNumber ?? this.lineNumber,
        );
    }
}

/**
 * A line of text with additional layout information.
 */
export class ParagraphLine {
    private readonly _fragments: LayoutFragment[] = [];
    private _width = 0;
    private _height = 0;
    private _baseline = 0;
    private _left = 0;
    private _y = 0;

    constructor(
        readonly start: number,
        readonly end: number,
        readonly hardBreak: boolean = false,
    ) { }

    get fragments(): LayoutFragment[] { return this._fragments; }
    get width(): number { return this._width; }
    get height(): number { return this._height; }
    get baseline(): number { return this._baseline; }
    get left(): number { return this._left; }

    addFragment(fragment: LayoutFragment): void {
        this._fragments.push(fragment);
        this._width += fragment.width;
        this._height = Math.max(this._height, fragment.height);
        this._baseline = Math.max(this._baseline, fragment.baseline);
    }

    layout(y: number): void {
        this._y = y;
        let x = this._left;

        for (const fragment of this._fragments) {
            fragment.position(x, y + this._baseline - fragment.baseline);
            x += fragment.width;
        }
    }

    toMetrics(lineNumber: number): EngineLineMetrics {
        return new EngineLineMetrics(
            this.start,
            this.end,
            this.hardBreak,
            this._baseline,
            this._height - this._baseline,
            this._baseline,
            this._height,
            this._width,
            this._left,
            this._baseline,
            lineNumber,
        );
    }
}

/**
 * A text style with engine-specific features.
 */
export class EngineTextStyle extends TextStyle {
    /**
     * Creates a text style with the given properties.
     */
    static create(props: {
        color?: number;
        decoration?: TextDecoration;
        decorationColor?: Color;
        decorationStyle?: TextDecorationStyle;
        decorationThickness?: number;
        fontWeight?: FontWeight;
        fontStyle?: FontStyle;
        textBaseline?: TextBaseline;
        fontFamily?: string;
        fontSize?: number;
        letterSpacing?: number;
        wordSpacing?: number;
        height?: number;
        leadingDistribution?: TextLeadingDistribution;
        locale?: string;
        background?: Paint;
        foreground?: Paint;
        shadows?: Shadow[];
        fontFeatures?: FontFeature[];
        fontVariations?: FontVariation[];
    }): EngineTextStyle {
        return new EngineTextStyle(props);
    }

    /**
     * Applies this style to a DOM element.
     */
    applyToDomElement(element: HTMLElement): void {
        applyTextStyleToElement(this, element);
    }
}

/**
 * A strut style with engine-specific features.
 */
export class EngineStrutStyle {
    constructor(
        readonly fontFamily?: string,
        readonly fontSize?: number,
        readonly height?: number,
        readonly leading?: number,
        readonly fontWeight?: FontWeight,
        readonly fontStyle?: FontStyle,
        readonly forceStrutHeight?: boolean,
    ) { }

    /**
     * Creates a copy of this style with the given fields replaced.
     */
    copyWith(fields: Partial<EngineStrutStyle>): EngineStrutStyle {
        return new EngineStrutStyle(
            fields.fontFamily ?? this.fontFamily,
            fields.fontSize ?? this.fontSize,
            fields.height ?? this.height,
            fields.leading ?? this.leading,
            fields.fontWeight ?? this.fontWeight,
            fields.fontStyle ?? this.fontStyle,
            fields.forceStrutHeight ?? this.forceStrutHeight,
        );
    }
}

/**
 * A placeholder in a paragraph.
 */
export class ParagraphPlaceholder {
    constructor(
        readonly width: number,
        readonly height: number,
        readonly alignment: PlaceholderAlignment,
        readonly baseline?: number,
        readonly offset?: number,
    ) { }
}

/**
 * How to align a placeholder within a line.
 */
export enum PlaceholderAlignment {
    /** Place the placeholder at the baseline. */
    baseline,

    /** Place the placeholder at the top of the line. */
    aboveBaseline,

    /** Place the placeholder at the bottom of the line. */
    belowBaseline,

    /** Place the placeholder at the middle of the line. */
    middle,

    /** Place the placeholder at the top of the line. */
    top,

    /** Place the placeholder at the bottom of the line. */
    bottom,
}

/**
 * Applies a text style to a DOM element.
 */
export function applyTextStyleToElement(style: TextStyle, element: HTMLElement): void {
    const props = style.props;
    const style$ = element.style;

    // Font properties
    if (props.fontFamily !== undefined) {
        style$.fontFamily = props.fontFamily;
    }
    if (props.fontSize !== undefined) {
        style$.fontSize = `${props.fontSize}px`;
    }
    if (props.fontWeight !== undefined) {
        style$.fontWeight = props.fontWeight.toString();
    }
    if (props.fontStyle !== undefined) {
        style$.fontStyle = props.fontStyle.toString();
    }

    // Text decoration
    if (props.decoration !== undefined) {
        style$.textDecoration = getTextDecorationString(props.decoration);
        if (props.decorationColor !== undefined) {
            style$.textDecorationColor = props.decorationColor.toCssString();
        }
        if (props.decorationStyle !== undefined) {
            style$.textDecorationStyle = props.decorationStyle.toString();
        }
        if (props.decorationThickness !== undefined) {
            style$.textDecorationThickness = `${props.decorationThickness}px`;
        }
    }

    // Spacing
    if (props.letterSpacing !== undefined) {
        style$.letterSpacing = `${props.letterSpacing}px`;
    }
    if (props.wordSpacing !== undefined) {
        style$.wordSpacing = `${props.wordSpacing}px`;
    }
    if (props.height !== undefined) {
        style$.lineHeight = props.height.toString();
    }

    // Colors and effects
    if (props.color !== undefined) {
        style$.color = new Color(props.color).toCssString();
    }
    if (props.background !== undefined) {
        style$.background = props.background.toString();
    }
}

/**
 * Converts a TextDecoration to its CSS string representation.
 */
function getTextDecorationString(decoration: TextDecoration): string {
    const decorations: string[] = [];
    if (decoration & TextDecoration.underline) {
        decorations.push('underline');
    }
    if (decoration & TextDecoration.overline) {
        decorations.push('overline');
    }
    if (decoration & TextDecoration.lineThrough) {
        decorations.push('line-through');
    }
    return decorations.join(' ') || 'none';
} 
