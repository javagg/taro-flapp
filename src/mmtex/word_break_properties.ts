// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { UnicodePropertyLookup } from './unicode_range';

/**
 * Word break properties as defined in UAX #29.
 * See: https://unicode.org/reports/tr29/#Word_Break_Property_Values
 */
export enum WordCharProperty {
    ALetter,      // Alphabetic letters
    CR,           // Carriage return
    Double_Quote, // Double quote
    Extend,       // Extend characters
    ExtendNumLet, // Extend characters for numbers and letters
    Format,       // Format control characters
    HebrewLetter, // Hebrew letters
    Katakana,     // Katakana characters
    LF,           // Line feed
    MidLetter,    // Middle of letters
    MidNum,       // Middle of numbers
    MidNumLet,    // Middle of numbers and letters
    Newline,      // Newline characters
    Numeric,      // Numeric characters
    Regional_Indicator, // Regional indicator
    Single_Quote, // Single quote
    WSegSpace,    // Whitespace
    ZWJ,          // Zero width joiner
    Other,        // Other characters
}

// The default property for characters that don't match any of the defined ranges
export const defaultWordCharProperty = WordCharProperty.Other;

// This data is generated using the script in tool/unicode_sync_script.dart
export const packedWordBreakProperties = `
  // ... packed data here ...
`;

// The number of ranges that contain a single code point
export const singleWordBreakRangesCount = 123;

/**
 * A lookup table for word break properties.
 */
export const wordLookup = UnicodePropertyLookup.fromPackedData(
    packedWordBreakProperties,
    singleWordBreakRangesCount,
    Object.values(WordCharProperty),
    defaultWordCharProperty
); 
