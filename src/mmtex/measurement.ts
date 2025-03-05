// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import { registerHotRestartListener } from '../../engine';
// import { DomElement, DomHTMLElement, DomNode, DomCanvasRenderingContext2D, createDomElement } from '../dom';
// import { EnginePlatformDispatcher } from '../platform_dispatcher';
// import { DomManager } from '../view_embedder/dom_manager';

// TODO(yjbanov): this is a hack we use to compute ideographic baseline; this
//                number is the ratio ideographic/alphabetic for font Ahem,
//                which matches the Flutter number. It may be completely wrong
//                for any other font. We'll need to eventually fix this. That
//                said Flutter doesn't seem to use ideographic baseline for
//                anything as of this writing.
export const baselineRatioHack = 1.1662499904632568;

/**
 * Hosts ruler DOM elements in a hidden container under DomManager.renderingHost.
 */
// export class RulerHost {
//     /** 
//      * Hosts a cache of rulers that measure text.
//      * 
//      * This element exists purely for organizational purposes. Otherwise the
//      * rulers would be attached to the `<body>` element polluting the element
//      * tree and making it hard to navigate. It does not serve any functional
//      * purpose.
//      */
//     private readonly _rulerHost: DomElement;

//     constructor() {
//         this._rulerHost = createDomElement('flt-ruler-host');
//         this._rulerHost.style.cssText =
//             'position: fixed;' +
//             'visibility: hidden;' +
//             'overflow: hidden;' +
//             'top: 0;' +
//             'left: 0;' +
//             'width: 0;' +
//             'height: 0;';

//         // TODO(mdebbar): There could be multiple views with multiple rendering hosts.
//         //                https://github.com/flutter/flutter/issues/137344
//         const renderingHost = EnginePlatformDispatcher.instance.implicitView!.dom.renderingHost;
//         renderingHost.appendChild(this._rulerHost);
//         registerHotRestartListener(() => this.dispose());
//     }

//     /**
//      * Releases the resources used by this RulerHost.
//      * 
//      * After this is called, this object is no longer usable.
//      */
//     dispose(): void {
//         this._rulerHost.remove();
//     }

//     /**
//      * Adds an element used for measuring text as a child of _rulerHost.
//      */
//     addElement(element: DomHTMLElement): void {
//         this._rulerHost.append(element);
//     }
// }

// These global variables are used to memoize calls to measureSubstring. They
// are used to remember the last arguments passed to it, and the last return
// value.
let _lastStart = -1;
let _lastEnd = -1;
let _lastText = '';
let _lastCssFont = '';
let _lastWidth = -1;

/**
 * Options for text measurement.
 */
export interface MeasureOptions {
    letterSpacing?: number;
    wordSpacing?: number;
}

/**
 * Measures a substring using the given canvas context.
 */
export function measureSubstring(
    context: CanvasRenderingContext2D,
    text: string,
    start: number,
    end: number,
    options: MeasureOptions = {},
): number {
    const substring = text.slice(start, end);

    if (substring.length === 0) {
        return 0;
    }

    // Apply letter spacing if specified
    if (options.letterSpacing) {
        return _measureWithLetterSpacing(context, substring, options.letterSpacing);
    }

    // Apply word spacing if specified
    if (options.wordSpacing) {
        return _measureWithWordSpacing(context, substring, options.wordSpacing);
    }

    // Default measurement
    return context.measureText(substring).width;
}

/**
 * Measures text with letter spacing applied.
 */
function _measureWithLetterSpacing(
    context: CanvasRenderingContext2D,
    text: string,
    letterSpacing: number,
): number {
    let width = context.measureText(text).width;

    // Add letter spacing between each character
    width += letterSpacing * (text.length - 1);

    return width;
}

/**
 * Measures text with word spacing applied.
 */
function _measureWithWordSpacing(
    context: CanvasRenderingContext2D,
    text: string,
    wordSpacing: number,
): number {
    let width = context.measureText(text).width;

    // Count spaces and add word spacing
    const spaceCount = text.split(' ').length - 1;
    width += wordSpacing * spaceCount;

    return width;
}

/**
 * Ruler metrics for text measurement.
 */
export interface RulerMetrics {
    /** The height of the text. */
    height: number;

    /** The baseline position from the top. */
    baseline: number;
}

/**
 * Measures text metrics using a ruler.
 */
export function measureMetrics(
    context: CanvasRenderingContext2D,
    text: string,
): RulerMetrics {
    const metrics = context.measureText(text);

    return {
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
        baseline: metrics.actualBoundingBoxAscent,
    };
}

/**
 * Cache for text measurements to improve performance.
 */
export class MeasurementCache {
    private readonly _cache = new Map<string, number>();

    /**
     * Gets or computes the width of the given text.
     */
    measureText(
        context: CanvasRenderingContext2D,
        text: string,
        options: MeasureOptions = {},
    ): number {
        const key = this._getCacheKey(text, context.font, options);

        let width = this._cache.get(key);
        if (width === undefined) {
            width = measureSubstring(context, text, 0, text.length, options);
            this._cache.set(key, width);
        }

        return width;
    }

    /**
     * Clears the measurement cache.
     */
    clear(): void {
        this._cache.clear();
    }

    private _getCacheKey(
        text: string,
        font: string,
        options: MeasureOptions,
    ): string {
        return `${text}|${font}|${options.letterSpacing ?? 0}|${options.wordSpacing ?? 0}`;
    }
}

// Global measurement cache instance
export const measurementCache = new MeasurementCache(); 
