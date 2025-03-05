// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import { clampInt } from '../util';
import { WordCharProperty, wordLookup } from './word_break_properties';

enum FindBreakDirection {
    forward = 1,
    backward = -1,
}

/**
 * WordBreaker exposes static methods to identify word boundaries.
 */
export abstract class WordBreaker {
    /**
     * It starts from index and tries to find the next word boundary in text.
     */
    static nextBreakIndex(text: string, index: number): number {
        return findBreakIndex(FindBreakDirection.forward, text, index);
    }

    /**
     * It starts from index and tries to find the previous word boundary in text.
     */
    static prevBreakIndex(text: string, index: number): number {
        return findBreakIndex(FindBreakDirection.backward, text, index);
    }
}

/**
 * Find out if there's a word break between index - 1 and index.
 * http://unicode.org/reports/tr29/#Word_Boundary_Rules
 */
function isBreak(text: string | null, index: number): boolean {
    // Break at the start and end of text.
    // WB1: sot ÷ Any
    // WB2: Any ÷ eot
    if (text === null || index <= 0 || index >= text.length) {
        return true;
    }

    // Do not break inside surrogate pair
    if (isUtf16Surrogate(text.charCodeAt(index - 1))) {
        return false;
    }

    const immediateRight = wordLookup.find(text, index);
    const immediateLeft = wordLookup.find(text, index - 1);

    // Do not break within CRLF.
    // WB3: CR × LF
    if (immediateLeft === WordCharProperty.CR && immediateRight === WordCharProperty.LF) {
        return false;
    }

    // Otherwise break before and after Newlines (including CR and LF)
    // WB3a: (Newline | CR | LF) ÷
    if (oneOf(
        immediateLeft,
        WordCharProperty.Newline,
        WordCharProperty.CR,
        WordCharProperty.LF
    )) {
        return true;
    }

    // WB3b: ÷ (Newline | CR | LF)
    if (oneOf(
        immediateRight,
        WordCharProperty.Newline,
        WordCharProperty.CR,
        WordCharProperty.LF
    )) {
        return true;
    }

    // Do not break within emoji zwj sequences.
    // WB3c: ZWJ × \u{E0000}+
    // Skip this rule since we don't expect any extended pictographic characters.

    // Keep horizontal whitespace together.
    // WB3d: WSegSpace × WSegSpace
    if (immediateLeft === WordCharProperty.WSegSpace &&
        immediateRight === WordCharProperty.WSegSpace) {
        return false;
    }

    // Ignore Format and Extend characters, except after sot, CR, LF, and Newline.
    // This also implies that Format and Extend characters cannot break from what
    // precedes them.
    // WB4: X (Extend | Format | ZWJ)* → X
    // TODO: implement this

    // Do not break between most letters.
    // WB5: (ALetter | Hebrew_Letter) × (ALetter | Hebrew_Letter)
    if (isAHLetter(immediateLeft) && isAHLetter(immediateRight)) {
        return false;
    }

    // Some more rules...
    // WB6-WB13
    // (Implementation continues with more word break rules)

    // Otherwise, break everywhere (including around ideographs).
    // WB999: Any ÷ Any
    return true;
}
function findBreakIndex(
    direction: FindBreakDirection,
    text: string,
    index: number
): number {
    let i = index;
    while (i >= 0 && i <= text.length) {
        i += direction;
        if (isBreak(text, i)) {
            break;
        }
    }
    return Math.max(0, Math.min(i, text.length));
}

function isUtf16Surrogate(value: number): boolean {
    return (value & 0xF800) === 0xD800;
}

function oneOf(
    value: WordCharProperty,
    choice1: WordCharProperty,
    choice2: WordCharProperty,
    choice3?: WordCharProperty,
    choice4?: WordCharProperty,
    choice5?: WordCharProperty,
): boolean {
    if (value === choice1) return true;
    if (value === choice2) return true;
    if (choice3 !== undefined && value === choice3) return true;
    if (choice4 !== undefined && value === choice4) return true;
    if (choice5 !== undefined && value === choice5) return true;
    return false;
}

function isAHLetter(property: WordCharProperty): boolean {
    return oneOf(
        property,
        WordCharProperty.ALetter,
        WordCharProperty.HebrewLetter
    );
} 
