// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { FontWeight } from "@/mtex/canvaskit";


/**
 * Defines the style for a span of text.
 */
export class SpanStyle {
    constructor({
        color,
        decoration,
        decorationColor,
        decorationStyle,
        decorationThickness,
        fontWeight = FontWeight.normal,
        fontStyle = FontStyle.normal,
        textBaseline,
        fontFamily = 'sans-serif',
        fontSize,
        letterSpacing,
        wordSpacing,
        height,
        locale,
        background,
        foreground,
        shadows,
        fontFeatures = null,
        fontVariations = null,
        textDirection,
    }: {
        color?: number;
        decoration?: TextDecoration;
        decorationColor?: number;
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
        locale?: string;
        background?: Paint;
        foreground?: Paint;
        shadows?: Shadow[];
        fontFeatures?: FontFeature[] | null;
        fontVariations?: FontVariation[] | null;
        textDirection?: TextDirection;
    } = {}) {
        this.color = color;
        this.decoration = decoration;
        this.decorationColor = decorationColor;
        this.decorationStyle = decorationStyle;
        this.decorationThickness = decorationThickness;
        this.fontWeight = fontWeight;
        this.fontStyle = fontStyle;
        this.textBaseline = textBaseline;
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.letterSpacing = letterSpacing;
        this.wordSpacing = wordSpacing;
        this.height = height;
        this.locale = locale;
        this.background = background;
        this.foreground = foreground;
        this.shadows = shadows;
        this.fontFeatures = fontFeatures;
        this.fontVariations = fontVariations;
        this.textDirection = textDirection;
    }

    readonly color?: number;
    readonly decoration?: TextDecoration;
    readonly decorationColor?: number;
    readonly decorationStyle?: TextDecorationStyle;
    readonly decorationThickness?: number;
    readonly fontWeight: FontWeight;
    readonly fontStyle: FontStyle;
    readonly textBaseline?: TextBaseline;
    readonly fontFamily: string;
    readonly fontSize?: number;
    readonly letterSpacing?: number;
    readonly wordSpacing?: number;
    readonly height?: number;
    readonly locale?: string;
    readonly background?: Paint;
    readonly foreground?: Paint;
    readonly shadows?: Shadow[];
    readonly fontFeatures: FontFeature[] | null;
    readonly fontVariations: FontVariation[] | null;
    readonly textDirection?: TextDirection;

    /**
     * Returns the CSS font string for this style.
     */
    get cssFontString(): string {
        const fontStyle = this.fontStyle?.toCssString() ?? 'normal';
        const fontWeight = this.fontWeight?.toCssString() ?? 'normal';
        const fontSize = this.fontSize ? `${this.fontSize}px` : 'inherit';
        return `${fontStyle} ${fontWeight} ${fontSize} ${this.fontFamily}`;
    }

    /**
     * Creates a copy of this style with the given fields replaced.
     */
    copyWith({
        color,
        decoration,
        decorationColor,
        decorationStyle,
        decorationThickness,
        fontWeight,
        fontStyle,
        textBaseline,
        fontFamily,
        fontSize,
        letterSpacing,
        wordSpacing,
        height,
        locale,
        background,
        foreground,
        shadows,
        fontFeatures,
        fontVariations,
        textDirection,
    }: {
        color?: number;
        decoration?: TextDecoration;
        decorationColor?: number;
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
        locale?: string;
        background?: Paint;
        foreground?: Paint;
        shadows?: Shadow[];
        fontFeatures?: FontFeature[] | null;
        fontVariations?: FontVariation[] | null;
        textDirection?: TextDirection;
    } = {}): SpanStyle {
        return new SpanStyle({
            color: color ?? this.color,
            decoration: decoration ?? this.decoration,
            decorationColor: decorationColor ?? this.decorationColor,
            decorationStyle: decorationStyle ?? this.decorationStyle,
            decorationThickness: decorationThickness ?? this.decorationThickness,
            fontWeight: fontWeight ?? this.fontWeight,
            fontStyle: fontStyle ?? this.fontStyle,
            textBaseline: textBaseline ?? this.textBaseline,
            fontFamily: fontFamily ?? this.fontFamily,
            fontSize: fontSize ?? this.fontSize,
            letterSpacing: letterSpacing ?? this.letterSpacing,
            wordSpacing: wordSpacing ?? this.wordSpacing,
            height: height ?? this.height,
            locale: locale ?? this.locale,
            background: background ?? this.background,
            foreground: foreground ?? this.foreground,
            shadows: shadows ?? this.shadows,
            fontFeatures: fontFeatures ?? this.fontFeatures,
            fontVariations: fontVariations ?? this.fontVariations,
            textDirection: textDirection ?? this.textDirection,
        });
    }
}

/**
 * Text decoration styles.
 */
export enum TextDecorationStyle {
    solid,
    double,
    dotted,
    dashed,
    wavy,
}

/**
 * Text decoration types.
 */
export enum TextDecoration {
    none,
    underline,
    overline,
    lineThrough,
}

/**
 * Text baseline types.
 */
export enum TextBaseline {
    alphabetic,
    ideographic,
}


/**
* The alignment of a placeholder relative to the surrounding text.
*/
export enum PlaceholderAlignment {
    /** Place the placeholder at the top of the line. */
    top,

    /** Place the placeholder in the middle of the line. */
    middle,

    /** Place the placeholder at the bottom of the line. */
    bottom,

    /** Place the placeholder at the baseline of the line. */
    baseline,

    /** Place the placeholder above the baseline of the line. */
    aboveBaseline,

    /** Place the placeholder below the baseline of the line. */
    belowBaseline,
}

/**
 * A hack we use to compute ideographic baseline; this number is the ratio
 * ideographic/alphabetic for font Ahem, which matches the Flutter number.
 */
const baselineRatioHack = 1.1662499904632568;

/**
 * Represents a placeholder object in a paragraph.
 */
