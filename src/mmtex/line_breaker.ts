import { TextFragmenter, TextFragment } from './fragmenter';
// import { DomIntl } from '../dom';
// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { UnicodePropertyLookup } from './unicode_range';

/**
 * Line break properties as defined in UAX #14.
 * See: https://www.unicode.org/reports/tr14/#Properties
 */
export enum LineCharProperty {
    // Explicit line break controls
    BK,   // Mandatory break
    CR,   // Carriage return
    LF,   // Line feed
    NL,   // Next line

    // Non-tailorable line breaking classes
    SP,   // Space
    ZW,   // Zero width space
    GL,   // Non-breaking glue
    WJ,   // Word joiner
    ZWJ, // Zero width joiner
    B2,   // Break opportunity before and after
    BA,   // Break after
    BB,   // Break before
    HY,   // Hyphen
    CB,   // Contingent break opportunity

    // Common characters
    CL,   // Close punctuation
    CP,   // Close parenthesis
    EX,   // Exclamation/Interrogation
    IN,   // Inseparable
    NS,   // Non-starter
    OP,   // Open punctuation
    QU,   // Quotation

    // Numeric context
    IS,   // Infix numeric separator
    NU,   // Numeric
    PO,   // Postfix numeric
    PR,   // Prefix numeric
    SY,   // Symbols allowing break after

    // East Asian context
    AI,   // Ambiguous (alphabetic or ideographic)
    AL,   // Alphabetic
    CJ,   // Conditional Japanese starter
    EB,   // Emoji base
    EM,   // Emoji modifier
    H2,   // Hangul LV syllable
    H3,   // Hangul LVT syllable
    HL,   // Hebrew letter
    ID,   // Ideographic
    JL,   // Hangul L Jamo
    JV,   // Hangul V Jamo
    JT,   // Hangul T Jamo
    RI,   // Regional indicator
    SA,   // Complex context dependent (South East Asian)
    XX,   // Unknown
}

// The default property for characters that don't match any of the defined ranges
export const defaultLineCharProperty = LineCharProperty.XX;

// This data is generated using the script in tool/unicode_sync_script.dart
export const packedLineBreakProperties = `
   // ... packed data here ...
`;

// The number of ranges that contain a single code point
export const singleLineBreakRangesCount = 213;

/**
 * A lookup table for line break properties.
 */
export const lineLookup = UnicodePropertyLookup.fromPackedData(
    packedLineBreakProperties,
    singleLineBreakRangesCount,
    Object.values(LineCharProperty),
    defaultLineCharProperty
);

/**
 * Initializes lineLookup, if it's not already initialized.
 * 
 * Use this function to trigger the initialization before lineLookup is
 * actually used. For example, triggering it before the first application
 * frame is rendered will reduce jank by moving the initialization out of
 * the frame.
 */
export function ensureLineLookupInitialized(): UnicodePropertyLookup<LineCharProperty> {
    return lineLookup;
}

const _kNewlines = new Set([
    0x000A, // LF
    0x000B, // BK
    0x000C, // BK
    0x000D, // CR
    0x0085, // NL
    0x2028, // BK
    0x2029, // BK
]);

const _kSpaces = new Set([
    0x0020, // SP
    0x200B, // ZW
]);

/**
 * The type of line break.
 */
export enum LineBreakType {
    /** Indicates that a line break is possible but not mandatory. */
    opportunity,

    /** Indicates that a line break isn't possible. */
    prohibited,

    /** Indicates that this is a hard line break that can't be skipped. */
    mandatory,

    /**
     * Indicates the end of the text (which is also considered a line break in
     * the Unicode spec). This is the same as mandatory but it's needed in our
     * implementation to distinguish between the universal endOfText and the
     * line break caused by "\n" at the end of the text.
     */
    endOfText,
}

/**
 * Represents a line break opportunity in text.
 */
export interface LineBreak {
    position: number;
    type: LineBreakType;
}

/**
 * Implements the line breaking algorithm as defined in UAX #14.
 * 
 * See: https://www.unicode.org/reports/tr14
 */
export class LineBreaker {
    private _position = 0;

    constructor(private readonly text: string) { }

    /**
     * Returns the next line break in the text.
     * 
     * Returns null if there are no more line breaks.
     */
    nextBreak(): LineBreak | null {
        if (this._position >= this.text.length) {
            return null;
        }

        // Look for the next break opportunity
        while (this._position < this.text.length) {
            const breakType = this._getBreakType(this._position);
            if (breakType !== LineBreakType.prohibited) {
                const breakPosition = this._position;
                this._position++;
                return { position: breakPosition, type: breakType };
            }
            this._position++;
        }

        // Always break at the end of text
        return {
            position: this.text.length,
            type: LineBreakType.endOfText,
        };
    }

    /**
     * Determines the type of break at the given position.
     */
    private _getBreakType(position: number): LineBreakType {
        // Break at the start of text
        if (position <= 0) {
            return LineBreakType.opportunity;
        }

        // Break at the end of text
        if (position >= this.text.length) {
            return LineBreakType.endOfText;
        }

        const propertyBefore = lineLookup.find(this.text, position - 1);
        const propertyAfter = lineLookup.find(this.text, position);

        // Mandatory break after newline
        if (propertyBefore === LineCharProperty.BK ||
            propertyBefore === LineCharProperty.CR ||
            propertyBefore === LineCharProperty.LF ||
            propertyBefore === LineCharProperty.NL) {
            return LineBreakType.mandatory;
        }

        // Don't break between CR and LF
        if (propertyBefore === LineCharProperty.CR &&
            propertyAfter === LineCharProperty.LF) {
            return LineBreakType.prohibited;
        }

        // Don't break before most characters
        if (propertyAfter === LineCharProperty.GL ||
            propertyAfter === LineCharProperty.WJ ||
            propertyAfter === LineCharProperty.CL ||
            propertyAfter === LineCharProperty.CP ||
            propertyAfter === LineCharProperty.EX ||
            propertyAfter === LineCharProperty.IS ||
            propertyAfter === LineCharProperty.SY) {
            return LineBreakType.prohibited;
        }

        // Don't break after spaces
        if (propertyBefore === LineCharProperty.SP ||
            propertyBefore === LineCharProperty.ZW) {
            return LineBreakType.prohibited;
        }

        // Break opportunity by default
        return LineBreakType.opportunity;
    }
}

/**
 * Splits text into fragments based on line breaks.
 */
export class LineBreakFragmenter extends TextFragmenter {
    static create(text: string): LineBreakFragmenter {
        // if (Intl.v8BreakIterator != null) {
        //     return new V8LineBreakFragmenter(text);
        // }
        return new FWLineBreakFragmenter(text);
    }

    fragment(): LineBreakFragment[] {
        throw new Error('Method not implemented.');
    }
}

/**
 * Flutter web's custom implementation of LineBreakFragmenter.
 */
export class FWLineBreakFragmenter extends LineBreakFragmenter {
    constructor(text: string) {
        super(text);
    }

    fragment(): LineBreakFragment[] {
        return computeLineBreakFragments(this.text);
    }
}

/**
 * An implementation of LineBreakFragmenter that uses V8's
 * v8BreakIterator API to find line breaks in the given text.
 */
// export class V8LineBreakFragmenter extends LineBreakFragmenter {
//     private readonly _v8BreakIterator: DomV8BreakIterator;

//     constructor(text: string) {
//         super(text);
//         this._v8BreakIterator = createV8BreakIterator();
//     }

//     fragment(): LineBreakFragment[] {
//         return breakLinesUsingV8BreakIterator(
//             this.text,
//             this.text as any, // toJS
//             this._v8BreakIterator
//         );
//     }
// }

export class LineBreakFragment extends TextFragment {
    constructor(
        start: number,
        end: number,
        readonly type: LineBreakType,
        readonly trailingNewlines: number,
        readonly trailingSpaces: number,
    ) {
        super(start, end);
    }

    override toString(): string {
        return `LineBreakFragment(${this.start}, ${this.end}, ${this.type})`;
    }
}

/// Finds the next line break in the given [text] starting from [index].
///
/// We think about indices as pointing between characters, and they go all the
/// way from 0 to the string length. For example, here are the indices for the
/// string "foo bar":
///
/// ```none
///   f   o   o       b   a   r
/// ^   ^   ^   ^   ^   ^   ^   ^
/// 0   1   2   3   4   5   6   7
/// ```
///
/// This way the indices work well with [String.substring].
///
/// Useful resources:
///
/// * https://www.unicode.org/reports/tr14/tr14-45.html#Algorithm
/// * https://www.unicode.org/Public/11.0.0/ucd/LineBreak.txt
/**
 * Computes line break fragments for the given text using Flutter Web's
 * implementation of the line breaking algorithm.
 */
function computeLineBreakFragments(text: string): LineBreakFragment[] {
    const fragments: LineBreakFragment[] = [];
    const breaker = new LineBreaker(text);
    let start = 0;
    let lastType = LineBreakType.prohibited;

    while (true) {
        const breakpoint = breaker.nextBreak();
        if (!breakpoint) break;

        const end = breakpoint.position;
        if (end > start) {
            // Count trailing newlines and spaces
            let trailingNewlines = 0;
            let trailingSpaces = 0;

            for (let i = end - 1; i >= start; i--) {
                const charCode = text.charCodeAt(i);
                if (_kNewlines.has(charCode)) {
                    trailingNewlines++;
                } else if (_kSpaces.has(charCode)) {
                    trailingSpaces++;
                } else {
                    break;
                }
            }

            fragments.push(new LineBreakFragment(
                start,
                end,
                lastType,
                trailingNewlines,
                trailingSpaces
            ));
        }

        start = end;
        lastType = breakpoint.type;

        if (breakpoint.type === LineBreakType.endOfText) {
            break;
        }
    }

    return fragments;
}

/**
 * Creates a V8 break iterator for line breaks.
 */
// function createV8BreakIterator(): DomV8BreakIterator {
//     // @ts-ignore: V8BreakIterator is not in standard lib
//     return new Intl.v8BreakIterator(['en'], { type: 'line' });
// }

/**
 * Uses V8's break iterator to find line breaks in text.
 */
// function breakLinesUsingV8BreakIterator(
//     text: string,
//     jsText: string,
//     iterator: DomV8BreakIterator
// ): LineBreakFragment[] {
//     const fragments: LineBreakFragment[] = [];
//     iterator.adoptText(jsText);

//     let start = 0;
//     let pos = iterator.first();
//     let lastType = LineBreakType.prohibited;

//     while (pos !== -1) {
//         const next = iterator.next();
//         if (next === -1) {
//             // End of text
//             if (pos > start) {
//                 fragments.push(createFragment(text, start, pos, lastType));
//             }
//             break;
//         }

//         // Create fragment if we have accumulated any text
//         if (pos > start) {
//             fragments.push(createFragment(text, start, pos, lastType));
//         }

//         start = pos;
//         pos = next;
//         lastType = determineBreakType(text, pos);
//     }

//     return fragments;
// }

// /**
//  * Creates a line break fragment with computed trailing spaces and newlines.
//  */
// function createFragment(
//     text: string,
//     start: number,
//     end: number,
//     type: LineBreakType
// ): LineBreakFragment {
//     let trailingNewlines = 0;
//     let trailingSpaces = 0;

//     for (let i = end - 1; i >= start; i--) {
//         const charCode = text.charCodeAt(i);
//         if (_kNewlines.has(charCode)) {
//             trailingNewlines++;
//         } else if (_kSpaces.has(charCode)) {
//             trailingSpaces++;
//         } else {
//             break;
//         }
//     }

//     return new LineBreakFragment(
//         start,
//         end,
//         type,
//         trailingNewlines,
//         trailingSpaces
//     );
// }



// ... rest of implementation including helper functions 
