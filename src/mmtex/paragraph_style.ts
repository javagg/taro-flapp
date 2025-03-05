// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import { TextAlign, TextDirection, FontWeight, FontStyle } from '../ui';
// import { FontFeature, FontVariation } from './font_feature';

/**
 * Defines the style for a paragraph of text.
 */

import { TextDirection, TextAlign, TextDirectionEnumValues, FontWeight, FontStyle } from "../mtex/canvaskit"

export class ParagraphStyle {
    constructor({
        textAlign = TextAlign.start,
        textDirection = TextDirection.ltr,
        fontWeight = FontWeight.normal,
        fontStyle = FontStyle.normal,
        fontFamily = 'sans-serif',
        fontSize = 14,
        lineHeight,
        maxLines,
        letterSpacing,
        wordSpacing,
        height,
        leadingDistribution,
        fontFeatures = null,
        fontVariations = null,
        background = null,
        foreground = null,
    }: {
        textAlign?: TextAlign;
        textDirection?: TextDirection;
        fontWeight?: FontWeight;
        fontStyle?: FontStyle;
        fontFamily?: string;
        fontSize?: number;
        lineHeight?: number;
        maxLines?: number | null;
        letterSpacing?: number;
        wordSpacing?: number;
        height?: number | null;
        leadingDistribution?: TextLeadingDistribution;
        fontFeatures?: FontFeature[] | null;
        fontVariations?: FontVariation[] | null;
        background?: Paint | null;
        foreground?: Paint | null;
    } = {}) {
        this.textAlign = textAlign;
        this.textDirection = textDirection;
        this.fontWeight = fontWeight;
        this.fontStyle = fontStyle;
        this.fontFamily = fontFamily;
        this.fontSize = fontSize;
        this.lineHeight = lineHeight;
        this.maxLines = maxLines;
        this.letterSpacing = letterSpacing;
        this.wordSpacing = wordSpacing;
        this.height = height;
        this.leadingDistribution = leadingDistribution;
        this.fontFeatures = fontFeatures;
        this.fontVariations = fontVariations;
        this.background = background;
        this.foreground = foreground;
    }

    readonly textAlign: TextAlign;
    readonly textDirection: TextDirection;
    readonly fontWeight: FontWeight;
    readonly fontStyle: FontStyle;
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly lineHeight?: number;
    readonly maxLines: number | null;
    readonly letterSpacing?: number;
    readonly wordSpacing?: number;
    readonly height: number | null;
    readonly leadingDistribution?: TextLeadingDistribution;
    readonly fontFeatures: FontFeature[] | null;
    readonly fontVariations: FontVariation[] | null;
    readonly background: Paint | null;
    readonly foreground: Paint | null;

    /**
     * Returns the CSS font string for this style.
     */
    get cssFontString(): string {
        const fontStyle = this.fontStyle?.toCssString() ?? 'normal';
        const fontWeight = this.fontWeight?.toCssString() ?? 'normal';
        return `${fontStyle} ${fontWeight} ${this.fontSize}px ${this.fontFamily}`;
    }

    /**
     * Returns true if this paragraph style has no font variations.
     */
    get hasDefaultFontFeatures(): boolean {
        return !this.fontFeatures && !this.fontVariations;
    }

    /**
     * Creates a copy of this style with the given fields replaced.
     */
    copyWith({
        textAlign,
        textDirection,
        fontWeight,
        fontStyle,
        fontFamily,
        fontSize,
        lineHeight,
        maxLines,
        letterSpacing,
        wordSpacing,
        height,
        leadingDistribution,
        fontFeatures,
        fontVariations,
        background,
        foreground,
    }: {
        textAlign?: TextAlign;
        textDirection?: TextDirection;
        fontWeight?: FontWeight;
        fontStyle?: FontStyle;
        fontFamily?: string;
        fontSize?: number;
        lineHeight?: number;
        maxLines?: number | null;
        letterSpacing?: number;
        wordSpacing?: number;
        height?: number | null;
        leadingDistribution?: TextLeadingDistribution;
        fontFeatures?: FontFeature[] | null;
        fontVariations?: FontVariation[] | null;
        background?: Paint | null;
        foreground?: Paint | null;
    } = {}): ParagraphStyle {
        return new ParagraphStyle({
            textAlign: textAlign ?? this.textAlign,
            textDirection: textDirection ?? this.textDirection,
            fontWeight: fontWeight ?? this.fontWeight,
            fontStyle: fontStyle ?? this.fontStyle,
            fontFamily: fontFamily ?? this.fontFamily,
            fontSize: fontSize ?? this.fontSize,
            lineHeight: lineHeight ?? this.lineHeight,
            maxLines: maxLines ?? this.maxLines,
            letterSpacing: letterSpacing ?? this.letterSpacing,
            wordSpacing: wordSpacing ?? this.wordSpacing,
            height: height ?? this.height,
            leadingDistribution: leadingDistribution ?? this.leadingDistribution,
            fontFeatures: fontFeatures ?? this.fontFeatures,
            fontVariations: fontVariations ?? this.fontVariations,
            background: background ?? this.background,
            foreground: foreground ?? this.foreground,
        });
    }
}

/**
 * How to distribute the extra space when the line height is larger than
 * the font height.
 */
export enum TextLeadingDistribution {
    /** Distribute the extra space evenly before and after the text. */
    even,

    /** Distribute the extra space proportionally based on the ascent and descent. */
    proportional,
}

/**
 * Paint class stub - this would need to be properly implemented.
 */
interface Paint {
    // Paint implementation
} 
