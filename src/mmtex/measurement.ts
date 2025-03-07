// TODO(yjbanov): this is a hack we use to compute ideographic baseline; this
//                number is the ratio ideographic/alphabetic for font Ahem,
//                which matches the Flutter number. It may be completely wrong
//                for any other font. We'll need to eventually fix this. That
//                said Flutter doesn't seem to use ideographic baseline for
//                anything as of this writing.
export const baselineRatioHack = 1.1662499904632568;

let _lastStart = -1;
let _lastEnd = -1;
let _lastText = '';
let _lastCssFont = '';
let _lastWidth = -1;

/// Measures the width of the substring of [text] starting from the index
/// [start] (inclusive) to [end] (exclusive).
///
/// This method assumes that the correct font has already been set on
/// [canvasContext].
export function measureSubstring(
    canvasContext: CanvasRenderingContext2D,
    text: string,
    start: number,
    end: number,
   letterSpacing?: number,
): number {
    if (start < 0 || start > end || end > text.length) {
        throw new Error('Invalid start or end index');
    }

    if (start === end) {
        return 0;
    }

    const cssFont = canvasContext.font;
    let width: number;

    if (
        start === _lastStart &&
        end === _lastEnd &&
        text === _lastText &&
        cssFont === _lastCssFont
    ) {
        width = _lastWidth;
    } else {
        const sub = start === 0 && end === text.length ? text : text.substring(start, end);
        width = canvasContext.measureText(sub).width;
    }

    _lastStart = start;
    _lastEnd = end;
    _lastText = text;
    _lastCssFont = cssFont;
    _lastWidth = width;

    letterSpacing = letterSpacing || 0.0;
    if (letterSpacing !== 0.0) {
        width += letterSpacing * (end - start);
    }

    return _roundWidth(width);
}

function _roundWidth(width: number): number {
    return Math.round(width * 100) / 100;
}