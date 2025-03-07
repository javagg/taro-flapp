import { LineBreakFragmenter, LineBreakType, } from './line_breaker';
import { _Paragraph, ParagraphSpan, PlaceholderSpan } from './engine'
import { Spanometer } from './layout_service';
import { BidiFragmenter, FragmentFlow } from './text_direction';
import { clampInt, TextDirection } from './dom';
import { TextFragment } from './fragmenter';
import type { GlyphInfo, TextDirection as TextDirectionType, TextStyle } from '@/mtex/canvaskit';
import { ParagraphLine } from './paragraph';

class _CombinedFragment extends TextFragment {
    constructor(
        start: number,
        end: number,
        public readonly type: LineBreakType,
        public _textDirection: TextDirectionType,
        public readonly fragmentFlow: FragmentFlow,
        public readonly span: ParagraphSpan,
        public readonly trailingNewlines: number,
        public readonly trailingSpaces: number
    ) {
        super(start, end);

        if (trailingNewlines < 0) {
            throw new Error('trailingNewlines must be non-negative');
        }
        if (trailingSpaces < trailingNewlines) {
            throw new Error('trailingSpaces must be >= trailingNewlines');
        }
    }

    get textDirection() {
        return this._textDirection;
    }
}

/**
 * A fragment of text that can be measured and painted.
 */
export class LayoutFragment extends _CombinedFragment {

    line: ParagraphLine;

    constructor(
        readonly start: number,
        readonly end: number,
        readonly type: LineBreakType,
        textDirection: TextDirectionType,
        fragmentFlow: FragmentFlow,
        readonly span: ParagraphSpan,
        trailingNewlines: number,
        trailingSpaces: number,
    ) {
        super(start, end, type, textDirection, fragmentFlow, span, trailingNewlines, trailingSpaces);
    }

    get length(): number {
        return this.end - this.start;
    }

    get isSpaceOnly(): boolean {
        return this.length === this.trailingSpaces;
    }

    get isPlaceholder(): boolean {
        return this.span instanceof PlaceholderSpan;
    }

    get isBreak(): boolean {
        return this.type !== LineBreakType.prohibited;
    }

    get isHardBreak(): boolean {
        return this.type === LineBreakType.mandatory ||
            this.type === LineBreakType.endOfText;
    }

    get style(): TextStyle {
        return this.span.style;
    }
    // ... existing hashCode and equals methods ...
    getText(paragraph: _Paragraph): string {
        return paragraph.plainText.substring(this.start, this.end);
    }

    split(index: number): Array<LayoutFragment | null> {
        // In TypeScript we don't have assert, so we can use if statements for checks
        if (this.start > index || index > this.end) {
            throw new Error('Index out of bounds');
        }

        // If splitting at the start, return [null, this]
        if (this.start === index) {
            return [null, this];
        }

        // If splitting at the end, return [this, null]
        if (this.end === index) {
            return [this, null];
        }

        // The length of the second fragment after the split
        const secondLength: number = this.end - index;

        // Trailing spaces/new lines go to the second fragment. Any left over goes
        // to the first fragment
        const secondTrailingNewlines: number = Math.min(this.trailingNewlines, secondLength);
        const secondTrailingSpaces: number = Math.min(this.trailingSpaces, secondLength);

        // Return array of two new fragments
        return [
            new LayoutFragment(
                this.start,
                index,
                LineBreakType.prohibited,
                this.textDirection,
                this.fragmentFlow,
                this.span,
                this.trailingNewlines - secondTrailingNewlines,
                this.trailingSpaces - secondTrailingSpaces,
            ),
            new LayoutFragment(
                index,
                this.end,
                this.type,
                this.textDirection,
                this.fragmentFlow,
                this.span,
                secondTrailingNewlines,
                secondTrailingSpaces,
     
            ),
        ];
    }

    // _FragmentPosition
    get startOffset(): number {
        return this._startOffset;
    }
    private _startOffset!: number;

    // line!: ParagraphLine;

    get endOffset(): number {
        return this.startOffset + this.widthIncludingTrailingSpaces;
    }

    get left(): number {
        return this.line.textDirection === TextDirection.LTR
            ? this.startOffset
            : this.line.width - this.endOffset;
    }

    get right(): number {
        return this.line.textDirection === TextDirection.LTR
            ? this.endOffset
            : this.line.width - this.startOffset;
    }

    setPosition(config: { startOffset: number; textDirection: TextDirectionType }): void {
        this._startOffset = config.startOffset;
        this._textDirection ??= config.textDirection;
    }

    justifyTo(paragraphWidth: number): void {
        if (this.end > this.line.endIndex - this.line.trailingSpaces) return;
        if (this.trailingSpaces === 0) return;

        const justificationTotal = paragraphWidth - this.line.width;
        const justificationPerSpace = justificationTotal / this.line.nonTrailingSpaces;
        this._extraWidthForJustification = justificationPerSpace * this.trailingSpaces;
    }

    // _FragmentBox

    get top(): number {
        return this.line.baseline - this.ascent;
    }

    get bottom(): number {
        return this.line.baseline + this.descent;
    }

    private readonly _textBoxIncludingTrailingSpaces:  TextBox =  TextBox.fromLTRBD(
        this.line.left + this.left,
        this.top,
        this.line.left + this.right,
        this.bottom,
        this.textDirection!
    );

    get _isPartOfTrailingSpacesInLine(): boolean {
        return this.end > this.line.endIndex - this.line.trailingSpaces;
    }

    toPaintingTextBox():  TextBox {
        if (this._isPartOfTrailingSpacesInLine) {
            return this.textDirection ===  TextDirection.LTR
                ?  TextBox.fromLTRBD(
                    this.line.left + this.left,
                    this.top,
                    this.line.left + this.right - this.widthOfTrailingSpaces,
                    this.bottom,
                    this.textDirection!
                )
                :  TextBox.fromLTRBD(
                    this.line.left + this.left + this.widthOfTrailingSpaces,
                    this.top,
                    this.line.left + this.right,
                    this.bottom,
                    this.textDirection!
                );
        }
        return this._textBoxIncludingTrailingSpaces;
    }

    toTextBox(config: { start?: number; end?: number } = {}):  TextBox {
        const start = config.start ?? this.start;
        const end = config.end ?? this.end;

        if (start <= this.start && end >= this.end - this.trailingNewlines) {
            return this._textBoxIncludingTrailingSpaces;
        }
        return this._intersect(start, end);
    }

    private _intersect(start: number, end: number):  TextBox {
        console.assert(start > this.start || end < this.end, '_intersect should only be called when there\'s an actual intersection');

        let before = 0;
        if (start > this.start) {
            this._spanometer.currentSpan = this.span;
            before = this._spanometer.measureRange(this.start, start);
        }

        let after = 0;
        if (end < this.end - this.trailingNewlines) {
            this._spanometer.currentSpan = this.span;
            after = this._spanometer.measureRange(end, this.end - this.trailingNewlines);
        }

        let left: number, right: number;
        if (this.textDirection ===  TextDirection.LTR) {
            left = this.left + before;
            right = this.right - after;
        } else {
            left = this.left + after;
            right = this.right - before;
        }

        return  TextBox.fromLTRBD(
            this.line.left + left,
            this.top,
            this.line.left + right,
            this.bottom,
            this.textDirection!
        );
    }

    getPositionForX(x: number):  TextPosition {
        x = this._makeXDirectionAgnostic(x);

        const startIndex = this.start;
        const endIndex = this.end - this.trailingNewlines;
        const length = endIndex - startIndex;

        if (length === 0) {
            return new  TextPosition(startIndex);
        }
        if (length === 1) {
            const distanceFromStart = x;
            const distanceFromEnd = this.widthIncludingTrailingSpaces - x;
            return distanceFromStart < distanceFromEnd
                ? new  TextPosition(startIndex)
                : new  TextPosition(endIndex, TextAffinity.upstream);
        }

        this._spanometer.currentSpan = this.span;
        // ... remaining implementation ...
    }

    // ... existing code ...

    private _makeXDirectionAgnostic(x: number): number {
        return this.textDirection ===  TextDirection.LTR
            ? this.widthIncludingTrailingSpaces - x
            : x;
    }

    private readonly graphemeStartIndexRange: [number, number] | null = this._getBreaksRange();

    private _getBreaksRange(): [number, number] | null {
        if (this.end === this.start) {
            return null;
        }
        const lineGraphemeBreaks = this.line.graphemeStarts;
        console.assert(this.end > this.start);
        console.assert(lineGraphemeBreaks.length > 0);

        const startIndex = this.line.graphemeStartIndexBefore(this.start, 0, lineGraphemeBreaks.length);
        const endIndex = this.end === this.start + 1
            ? startIndex + 1
            : this.line.graphemeStartIndexBefore(this.end - 1, startIndex, lineGraphemeBreaks.length) + 1;

        const firstGraphemeStart = lineGraphemeBreaks[startIndex];
        return firstGraphemeStart > this.start
            ? (endIndex === startIndex + 1 ? null : [startIndex + 1, endIndex])
            : [startIndex, endIndex];
    }

    // ... existing code ...
    /// Whether the first codepoints of this fragment is not a valid grapheme start,
    /// and belongs in the the previous fragment.
    ///
    /// This is the result of a known bug: in rare circumstances, a grapheme is
    /// split into different fragments. To workaround this we ignore the trailing
    /// part of the grapheme during hit-testing, by adjusting the leading offset of
    /// a fragment to the leading edge of the first grapheme start in that fragment.
    //
    // TODO(LongCatIsLooong): Grapheme clusters should not be separately even
    // when they are in different runs. Also document the recommendation to use
    // U+25CC or U+00A0 for showing nonspacing marks in isolation.
    get hasLeadingBrokenGrapheme(): boolean {
        const graphemeStartIndexRangeStart = this.graphemeStartIndexRange?.[0];
        return graphemeStartIndexRangeStart === null ||
            this.line.graphemeStarts[graphemeStartIndexRangeStart] !== this.start;
    }

    private _getClosestCharacterInRange(x: number, startIndex: number, endIndex: number):  GlyphInfo {
        const graphemeStartIndices = this.line.graphemeStarts;
        const fullRange = new  TextRange(graphemeStartIndices[startIndex], graphemeStartIndices[endIndex]);
        const fullBox = this.toTextBox({ start: fullRange.start, end: fullRange.end });

        if (startIndex + 1 === endIndex) {
            return new  GlyphInfo(fullBox.toRect(), fullRange, fullBox.direction);
        }
        console.assert(startIndex + 1 < endIndex);

        const { left, right } = fullBox;

        if (left < x && x < right) {
            const midIndex = Math.floor((startIndex + endIndex) / 2);
            const firstHalf = this._getClosestCharacterInRange(x, startIndex, midIndex);
            if (firstHalf.graphemeClusterLayoutBounds.left < x && x < firstHalf.graphemeClusterLayoutBounds.right) {
                return firstHalf;
            }
            const secondHalf = this._getClosestCharacterInRange(x, midIndex, endIndex);
            if (secondHalf.graphemeClusterLayoutBounds.left < x && x < secondHalf.graphemeClusterLayoutBounds.right) {
                return secondHalf;
            }
            const distanceToFirst = Math.abs(x - Math.max(Math.min(x, firstHalf.graphemeClusterLayoutBounds.right), firstHalf.graphemeClusterLayoutBounds.left));
            const distanceToSecond = Math.abs(x - Math.max(Math.min(x, secondHalf.graphemeClusterLayoutBounds.right), secondHalf.graphemeClusterLayoutBounds.left));
            return distanceToFirst > distanceToSecond ? firstHalf : secondHalf;
        }

        const range = (fullBox.direction ===  TextDirection.LTR && x <= left) ||
            (fullBox.direction ===  TextDirection.LTR && x > left)
            ? new  TextRange(graphemeStartIndices[startIndex], graphemeStartIndices[startIndex + 1])
            : new  TextRange(graphemeStartIndices[endIndex - 1], graphemeStartIndices[endIndex]);

        console.assert(!range.isCollapsed);
        const box = this.toTextBox({ start: range.start, end: range.end });
        return new  GlyphInfo(box.toRect(), range, box.direction);
    }

    /// Returns the GlyphInfo of the character in the fragment that is closest to
    /// the given offset x.
    getClosestCharacterBox(x: number): GlyphInfo {
        console.assert(this.end > this.start);
        console.assert(this.graphemeStartIndexRange !== null);

        // The non-null assertion is safe here because this method is only called by
        // LayoutService.getClosestGlyphInfo which checks this fragment has at least
        // one grapheme start before calling this method.
        const [rangeStart, rangeEnd] = this.graphemeStartIndexRange!;
        return this._getClosestCharacterInRange(x, rangeStart, rangeEnd);
    }
    // 
    // ... existing code ...

    private _spanometer!: Spanometer;

    get ascent(): number {
        return this._ascent;
    }
    private _ascent!: number;

    get descent(): number {
        return this._descent;
    }
    private _descent!: number;

    get widthExcludingTrailingSpaces(): number {
        return this._widthExcludingTrailingSpaces;
    }
    private _widthExcludingTrailingSpaces!: number;

    get widthIncludingTrailingSpaces(): number {
        return this._widthIncludingTrailingSpaces + this._extraWidthForJustification;
    }
    private _widthIncludingTrailingSpaces!: number;

    private _extraWidthForJustification = 0;

    get height(): number {
        return this.ascent + this.descent;
    }

    get widthOfTrailingSpaces(): number {
        return this.widthIncludingTrailingSpaces - this.widthExcludingTrailingSpaces;
    }

    setMetrics(spanometer: Spanometer, config: {
        ascent: number;
        descent: number;
        widthExcludingTrailingSpaces: number;
        widthIncludingTrailingSpaces: number;
    }): void {
        this._spanometer = spanometer;
        this._ascent = config.ascent;
        this._descent = config.descent;
        this._widthExcludingTrailingSpaces = config.widthExcludingTrailingSpaces;
        this._widthIncludingTrailingSpaces = config.widthIncludingTrailingSpaces;
    }

    // ... existing code ...
    // ... existing code ...
    // ... existing code ...
}

/**
 * Splits text into measurable fragments.
 */
export class LayoutFragmenter {
    private readonly _text: string;
    private readonly _spans: ParagraphSpan[];

    constructor(text: string, spans: ParagraphSpan[]) {
        this._text = text;
        this._spans = spans;
    }

    /**
     * Creates fragments from the text and spans.
     */
    fragment(): LayoutFragment[] {
        const fragments: LayoutFragment[] = [];
        let fragmentStart = 0;

        // Initialize fragment iterators
        const lineBreakIterator = new LineBreakFragmenter(this._text).fragment()[Symbol.iterator]();
        let lineBreakNext = lineBreakIterator.next();
        const bidiIterator = new BidiFragmenter(this._text).fragment()[Symbol.iterator]();
        let bidiNext = bidiIterator.next();
        const spanIterator = this._spans[Symbol.iterator]();
        let spanNext = spanIterator.next();

        // Current fragments
        let currentLineBreak = lineBreakNext.value;
        let currentBidi = bidiNext.value;
        let currentSpan = spanNext.value;

        while (true) {
            // Calculate fragment end based on the smallest end position
            const fragmentEnd = Math.min(
                currentLineBreak.end,
                Math.min(currentBidi.end, currentSpan.end)
            );

            // Calculate line break properties
            const distanceFromLineBreak = currentLineBreak.end - fragmentEnd;
            const lineBreakType = distanceFromLineBreak === 0
                ? currentLineBreak.type
                : LineBreakType.prohibited;

            // Calculate trailing whitespace
            const trailingNewlines = currentLineBreak.trailingNewlines - distanceFromLineBreak;
            const trailingSpaces = currentLineBreak.trailingSpaces - distanceFromLineBreak;
            const fragmentLength = fragmentEnd - fragmentStart;

            // Add new fragment
            fragments.push(new LayoutFragment(
                fragmentStart,
                fragmentEnd,
                lineBreakType,
                currentBidi.textDirection,
                currentBidi.fragmentFlow,
                currentSpan,
                clampInt(trailingNewlines, 0, fragmentLength),
                clampInt(trailingSpaces, 0, fragmentLength)
            ));

            fragmentStart = fragmentEnd;

            // Move iterators if needed
            let moved = false;
            if (currentLineBreak.end === fragmentEnd && !(lineBreakNext = lineBreakIterator.next()).done) {
                currentLineBreak = lineBreakNext.value;
                moved = true;
            }
            if (currentBidi.end === fragmentEnd && !(bidiNext = bidiIterator.next()).done) {
                currentBidi = bidiNext.value;
                moved = true;
            }
            if (currentSpan.end === fragmentEnd && !(spanNext = spanIterator.next()).done) {
                currentSpan = spanNext.value;
                moved = true;
            }

            // Exit if no more fragments
            if (!moved) break;
        }

        return fragments;
    }
}


// interface FragmentMetrics {
//     ascent: number;
//     descent: number;
//     widthExcludingTrailingSpaces: number;
//     widthIncludingTrailingSpaces: number;
//     height: number;
//     widthOfTrailingSpaces: number;
//     setMetrics(spanometer: Spanometer, options: {
//         ascent: number;
//         descent: number;
//         widthExcludingTrailingSpaces: number;
//         widthIncludingTrailingSpaces: number;
//     }): void;
// }

// /**
//  * Abstract class implementing the metrics functionality
//  */
// abstract class FragmentMetricsImpl implements FragmentMetrics {
//     protected _spanometer!: Spanometer;
//     protected _ascent!: number;
//     protected _descent!: number;
//     protected _widthExcludingTrailingSpaces!: number;
//     protected _widthIncludingTrailingSpaces!: number;
//     protected _extraWidthForJustification: number = 0.0;

//     /** The rise from the baseline as calculated from the font and style for this text. */
//     get ascent(): number {
//         return this._ascent;
//     }

//     /** The drop from the baseline as calculated from the font and style for this text. */
//     get descent(): number {
//         return this._descent;
//     }

//     /** The width of the measured text, not including trailing spaces. */
//     get widthExcludingTrailingSpaces(): number {
//         return this._widthExcludingTrailingSpaces;
//     }

//     /** The width of the measured text, including any trailing spaces. */
//     get widthIncludingTrailingSpaces(): number {
//         return this._widthIncludingTrailingSpaces + this._extraWidthForJustification;
//     }

//     /** The total height as calculated from the font and style for this text. */
//     get height(): number {
//         return this.ascent + this.descent;
//     }

//     get widthOfTrailingSpaces(): number {
//         return this.widthIncludingTrailingSpaces - this.widthExcludingTrailingSpaces;
//     }

//     /** Set measurement values for the fragment. */
//     setMetrics(spanometer: Spanometer, options: {
//         ascent: number;
//         descent: number;
//         widthExcludingTrailingSpaces: number;
//         widthIncludingTrailingSpaces: number;
//     }): void {
//         this._spanometer = spanometer;
//         this._ascent = options.ascent;
//         this._descent = options.descent;
//         this._widthExcludingTrailingSpaces = options.widthExcludingTrailingSpaces;
//         this._widthIncludingTrailingSpaces = options.widthIncludingTrailingSpaces;
//     }
// }

export class EllipsisFragment extends LayoutFragment {
    constructor(
        index: number,
        span: ParagraphSpan
    ) {
        super(
            index,
            index,
            LineBreakType.endOfText,
            TextDirection.LTR, // null
            // The ellipsis is always at the end of the line, so it can't be
            // sandwiched. This means it'll always follow the paragraph direction.
            FragmentFlow.sandwich,
            span, 0, 0,
        );
    }

    get isSpaceOnly(): boolean {
        return false;
    }

    get isPlaceholder(): boolean {
        return false;
    }

    getText(paragraph: _Paragraph): string {
        if (!paragraph.paragraphStyle.ellipsis) {
            throw new Error('Paragraph style ellipsis is not defined');
        }
        return paragraph.paragraphStyle.ellipsis;
    }

    split(index: number): LayoutFragment[] {
        throw new Error('Cannot split an EllipsisFragment');
    }
}