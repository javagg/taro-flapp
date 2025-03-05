// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import { FontStyle, FontWeight } from '../ui';
// import { DomElement, DomHTMLElement, DomCSSStyleDeclaration, createDomHTMLDivElement } from '../dom';
// import { StyleManager } from '../view_embedder/style_manager';
// import { RulerHost } from './measurement';

/**
 * Builds a CSS font string based on the given font properties.
 */
export function buildCssFontString({
    fontStyle,
    fontWeight,
    fontSize,
    fontFamily,
}: {
    fontStyle?: FontStyle;
    fontWeight?: FontWeight;
    fontSize?: number;
    fontFamily: string;
}): string {
    const cssFontStyle = fontStyle?.toCssString() ?? StyleManager.defaultFontStyle;
    const cssFontWeight = fontWeight?.toCssString() ?? StyleManager.defaultFontWeight;
    const cssFontSize = Math.floor(fontSize ?? StyleManager.defaultFontSize);
    const cssFontFamily = canonicalizeFontFamily(fontFamily)!;

    return `${cssFontStyle} ${cssFontWeight} ${cssFontSize}px ${cssFontFamily}`;
}

/**
 * Contains all styles that have an effect on the height of text.
 * 
 * This is useful as a cache key for TextHeightRuler.
 */
export class TextHeightStyle {
    constructor(
        readonly fontFamily: string,
        readonly fontSize: number,
        readonly height: number | null,
        readonly fontFeatures: FontFeature[] | null,
        readonly fontVariations: FontVariation[] | null,
    ) { }

    equals(other: TextHeightStyle): boolean {
        return (
            other instanceof TextHeightStyle &&
            other.hashCode === this.hashCode
        );
    }

    get hashCode(): number {
        return hashValues(
            this.fontFamily,
            this.fontSize,
            this.height,
            this.fontFeatures ? hashAll(this.fontFeatures) : null,
            this.fontVariations ? hashAll(this.fontVariations) : null,
        );
    }
}

/**
 * Provides text dimensions found on _element. The idea behind this class is
 * to allow the ParagraphRuler to mutate multiple dom elements and allow
 * consumers to lazily read the measurements.
 * 
 * The ParagraphRuler would have multiple instances of TextDimensions with
 * different backing elements for different types of measurements. When a
 * measurement is needed, the ParagraphRuler would mutate all the backing
 * elements at once. The consumer of the ruler can later read those
 * measurements.
 * 
 * The rationale behind this is to minimize browser reflows by batching dom
 * writes first, then performing all the reads.
 */
export class TextDimensions {
    private _cachedBoundingClientRect: DOMRect | null = null;

    constructor(private readonly _element: DomElement) { }

    private _invalidateBoundsCache(): void {
        this._cachedBoundingClientRect = null;
    }

    /**
     * Sets text of contents to a single space character to measure empty text.
     */
    updateTextToSpace(): void {
        this._invalidateBoundsCache();
        this._element.text = ' ';
    }

    applyHeightStyle(textHeightStyle: TextHeightStyle): void {
        const style = this._element.style;
        style.fontSize = `${Math.floor(textHeightStyle.fontSize)}px`;
        style.fontFamily = canonicalizeFontFamily(textHeightStyle.fontFamily)!;

        if (textHeightStyle.height !== null) {
            style.lineHeight = textHeightStyle.height.toString();
        }
        this._invalidateBoundsCache();
    }

    /**
     * Appends element and probe to hostElement that is set up for a specific
     * TextStyle.
     */
    appendToHost(hostElement: DomHTMLElement): void {
        hostElement.append(this._element);
        this._invalidateBoundsCache();
    }

    private _readAndCacheMetrics(): DOMRect {
        return this._cachedBoundingClientRect ??= this._element.getBoundingClientRect();
    }

    /**
     * The height of the paragraph being measured.
     */
    get height(): number {
        let cachedHeight = this._readAndCacheMetrics().height;
        if (browser.isFirefox && !debugEmulateFlutterTesterEnvironment) {
            // See subpixel rounding bug:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=442139
            // This causes bottom of letters such as 'y' to be cutoff and
            // incorrect rendering of double underlines.
            cachedHeight += 1.0;
        }
        return cachedHeight;
    }
}

/**
 * Performs height measurement for the given textHeightStyle.
 * 
 * The two results of this ruler's measurement are:
 * 1. alphabeticBaseline
 * 2. height
 */
export class TextHeightRuler {
    private readonly _probe: DomHTMLElement;
    private readonly _host: DomHTMLElement;
    private readonly _dimensions: TextDimensions;

    constructor(
        readonly textHeightStyle: TextHeightStyle,
        readonly rulerHost: RulerHost
    ) {
        this._probe = this._createProbe();
        this._host = this._createHost();
        this._dimensions = new TextDimensions(document.createElement('flt-paragraph'));
    }

    /**
     * The alphabetic baseline for this ruler's textHeightStyle.
     */
    get alphabeticBaseline(): number {
        return this._probe.getBoundingClientRect().bottom;
    }

    /**
     * The height for this ruler's textHeightStyle.
     */
    get height(): number {
        return this._dimensions.height;
    }

    /**
     * Disposes of this ruler and detaches it from the DOM tree.
     */
    dispose(): void {
        this._host.remove();
    }

    private _createHost(): DomHTMLElement {
        const host = createDomHTMLDivElement();
        host.style.cssText =
            'visibility: hidden;' +
            'position: absolute;' +
            'top: 0;' +
            'left: 0;' +
            'display: flex;' +
            'flex-direction: row;' +
            'align-items: baseline;' +
            'margin: 0;' +
            'border: 0;' +
            'padding: 0;';

        if (process.env.NODE_ENV !== 'production') {
            host.setAttribute('data-ruler', 'line-height');
        }

        this._dimensions.applyHeightStyle(this.textHeightStyle);

        // Force single-line (even if wider than screen) and preserve whitespaces.
        this._dimensions._element.style.whiteSpace = 'pre';

        // To measure line-height, all we need is a whitespace.
        this._dimensions.updateTextToSpace();

        this._dimensions.appendToHost(host);

        this.rulerHost.addElement(host);
        return host;
    }

    private _createProbe(): DomHTMLElement {
        const probe = createDomHTMLDivElement();
        this._host.append(probe);
        return probe;
    }
} 
