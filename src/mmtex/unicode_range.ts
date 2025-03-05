// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

export const kChar_0 = 48;
export const kChar_9 = kChar_0 + 9;
export const kChar_A = 65;
export const kChar_Z = 90;
export const kChar_a = 97;
export const kChar_z = 122;
export const kCharBang = 33;
export const kMashriqi_0 = 0x660;
export const kMashriqi_9 = kMashriqi_0 + 9;

enum ComparisonResult {
    inside,
    higher,
    lower,
}

/**
 * Each instance of UnicodeRange represents a range of unicode characters
 * that are assigned a CharProperty. For example, the following snippet:
 * 
 * ```typescript
 * UnicodeRange(0x0041, 0x005A, CharProperty.ALetter);
 * ```
 * 
 * is saying that all characters between 0x0041 ("A") and 0x005A ("Z") are
 * assigned the property CharProperty.ALetter.
 * 
 * Note that the Unicode spec uses inclusive ranges and we are doing the
 * same here.
 */
export class UnicodeRange<P> {
    constructor(
        readonly start: number,
        readonly end: number,
        readonly property: P
    ) { }

    /**
     * Compare a value to this range.
     * 
     * The return value is either:
     * - lower: The value is lower than the range.
     * - higher: The value is higher than the range
     * - inside: The value is within the range.
     */
    compare(value: number): ComparisonResult {
        if (value < this.start) {
            return ComparisonResult.lower;
        }
        if (value > this.end) {
            return ComparisonResult.higher;
        }
        return ComparisonResult.inside;
    }
}

/**
 * Gets the code point at the given index in the string.
 * 
 * Returns null if the index is out of bounds or if the character at that
 * index is a surrogate.
 */
export function getCodePoint(text: string | null, index: number): number | null {
    if (!text || index < 0 || index >= text.length) {
        return null;
    }

    const charCode = text.charCodeAt(index);
    if (isUtf16Surrogate(charCode)) {
        // If this is a high surrogate and there is a next character
        if (index + 1 < text.length && isHighSurrogate(charCode)) {
            const nextCharCode = text.charCodeAt(index + 1);
            if (isLowSurrogate(nextCharCode)) {
                return 0x10000 + ((charCode & 0x3FF) << 10) + (nextCharCode & 0x3FF);
            }
        }
        return null;
    }
    return charCode;
}

/**
 * Returns whether the given character code is a UTF-16 surrogate.
 */
function isUtf16Surrogate(charCode: number): boolean {
    return (charCode & 0xF800) === 0xD800;
}

/**
 * Returns whether the given character code is a UTF-16 high surrogate.
 */
function isHighSurrogate(charCode: number): boolean {
    return (charCode & 0xFC00) === 0xD800;
}

/**
 * Returns whether the given character code is a UTF-16 low surrogate.
 */
function isLowSurrogate(charCode: number): boolean {
    return (charCode & 0xFC00) === 0xDC00;
}

/**
 * Given a list of UnicodeRanges, this class performs efficient lookup
 * to find which range a value falls into.
 * 
 * The lookup algorithm expects the ranges to have the following constraints:
 * - Be sorted.
 * - No overlap between the ranges.
 * - Gaps between ranges are ok.
 * 
 * This is used in the context of unicode to find out what property a letter
 * has. The properties are then used to decide word boundaries, line break
 * opportunities, etc.
 */
export class UnicodePropertyLookup<P> {
    private readonly _cache = new Map<number, P>();

    constructor(
        readonly ranges: UnicodeRange<P>[],
        readonly defaultProperty: P
    ) { }

    /**
     * Creates a UnicodePropertyLookup from packed data.
     */
    static fromPackedData<P>(
        packedData: string,
        singleRangesCount: number,
        propertyEnumValues: P[],
        defaultProperty: P
    ): UnicodePropertyLookup<P> {
        const ranges = unpackProperties(
            packedData,
            singleRangesCount,
            propertyEnumValues
        );
        return new UnicodePropertyLookup(ranges, defaultProperty);
    }

    /**
     * Finds the property for the given character in the text.
     */
    find(text: string, index: number): P {
        const codePoint = getCodePoint(text, index);
        return codePoint === null ? this.defaultProperty : this.findForChar(codePoint);
    }

    /**
     * Takes one character as an integer code unit and returns its property.
     * 
     * If a property can't be found for the given character, then the default
     * property will be returned.
     */
    findForChar(char: number): P {
        const cacheHit = this._cache.get(char);
        if (cacheHit !== undefined) {
            return cacheHit;
        }

        const rangeIndex = this._binarySearch(char);
        const result = rangeIndex === -1 ? this.defaultProperty : this.ranges[rangeIndex].property;

        // Cache the result
        this._cache.set(char, result);
        return result;
    }

    private _binarySearch(value: number): number {
        let min = 0;
        let max = this.ranges.length;
        while (min < max) {
            const mid = min + ((max - min) >> 1);
            const range = this.ranges[mid];
            switch (range.compare(value)) {
                case ComparisonResult.higher:
                    min = mid + 1;
                    break;
                case ComparisonResult.lower:
                    max = mid;
                    break;
                case ComparisonResult.inside:
                    return mid;
            }
        }
        return -1;
    }
}

/**
 * Unpacks properties from a packed string format.
 */
function unpackProperties<P>(
    packedData: string,
    singleRangesCount: number,
    propertyEnumValues: P[]
): UnicodeRange<P>[] {
    // Implementation depends on the specific packing format used
    // This would need to be implemented based on your data format
    return [];
}

function getIntFromCharCode(charCode: number): number {
    if (charCode <= kChar_9) {
        return charCode - kChar_0;
    }
    // "a" starts from 10 and remaining letters go up from there.
    return charCode - kChar_a + 10;
} 
