// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { LineBreakType, LineBreaker } from './line_breaker';
import { _Paragraph, ParagraphSpan } from './engine'
import { TextDirection } from '@/mtex/canvaskit';

/**
 * A fragment of text that can be measured and painted.
 */
export class LayoutFragment {
    private _width = 0;
    private _height = 0;
    private _baseline = 0;
    private _textDirection: TextDirection | null = null;

    constructor(
        readonly text: string,
        readonly start: number,
        readonly end: number,
        readonly type: LineBreakType,
        readonly span: ParagraphSpan,
        readonly letterSpacing?: number,
    ) { }

    get width(): number { return this._width; }
    get height(): number { return this._height; }
    get baseline(): number { return this._baseline; }
    get textDirection(): TextDirection | null { return this._textDirection; }

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
                {
                    trailingNewlines: this.trailingNewlines - secondTrailingNewlines,
                    trailingSpaces: this.trailingSpaces - secondTrailingSpaces,
                }
            ),
            new LayoutFragment(
                index,
                this.end,
                this.type,
                this.textDirection,
                this.fragmentFlow,
                this.span,
                {
                    trailingNewlines: secondTrailingNewlines,
                    trailingSpaces: secondTrailingSpaces,
                }
            ),
        ];
    }
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
        const lineBreaker = new LineBreaker(this._text);
        let spanIndex = 0;
        let fragmentStart = 0;

        while (fragmentStart < this._text.length) {
            // Find the next line break
            const breakpoint = lineBreaker.nextBreak();
            if (!breakpoint) break;

            // Find the span that contains this fragment
            while (spanIndex < this._spans.length &&
                this._spans[spanIndex].end <= fragmentStart) {
                spanIndex++;
            }

            if (spanIndex >= this._spans.length) break;

            const span = this._spans[spanIndex];
            const fragmentEnd = Math.min(breakpoint.position, span.end);

            fragments.push(new LayoutFragment(
                this._text,
                fragmentStart,
                fragmentEnd,
                breakpoint.type,
                span,
                span.style.letterSpacing,
            ));

            fragmentStart = fragmentEnd;
        }

        return fragments;
    }
}

interface FragmentMetrics {
    ascent: number;
    descent: number;
    widthExcludingTrailingSpaces: number;
    widthIncludingTrailingSpaces: number;
    height: number;
    widthOfTrailingSpaces: number;
    setMetrics(spanometer: Spanometer, options: {
        ascent: number;
        descent: number;
        widthExcludingTrailingSpaces: number;
        widthIncludingTrailingSpaces: number;
    }): void;
}

/**
 * Abstract class implementing the metrics functionality
 */
abstract class FragmentMetricsImpl implements FragmentMetrics {
    protected _spanometer!: Spanometer;
    protected _ascent!: number;
    protected _descent!: number;
    protected _widthExcludingTrailingSpaces!: number;
    protected _widthIncludingTrailingSpaces!: number;
    protected _extraWidthForJustification: number = 0.0;

    /** The rise from the baseline as calculated from the font and style for this text. */
    get ascent(): number {
        return this._ascent;
    }

    /** The drop from the baseline as calculated from the font and style for this text. */
    get descent(): number {
        return this._descent;
    }

    /** The width of the measured text, not including trailing spaces. */
    get widthExcludingTrailingSpaces(): number {
        return this._widthExcludingTrailingSpaces;
    }

    /** The width of the measured text, including any trailing spaces. */
    get widthIncludingTrailingSpaces(): number {
        return this._widthIncludingTrailingSpaces + this._extraWidthForJustification;
    }

    /** The total height as calculated from the font and style for this text. */
    get height(): number {
        return this.ascent + this.descent;
    }

    get widthOfTrailingSpaces(): number {
        return this.widthIncludingTrailingSpaces - this.widthExcludingTrailingSpaces;
    }

    /** Set measurement values for the fragment. */
    setMetrics(spanometer: Spanometer, options: {
        ascent: number;
        descent: number;
        widthExcludingTrailingSpaces: number;
        widthIncludingTrailingSpaces: number;
    }): void {
        this._spanometer = spanometer;
        this._ascent = options.ascent;
        this._descent = options.descent;
        this._widthExcludingTrailingSpaces = options.widthExcludingTrailingSpaces;
        this._widthIncludingTrailingSpaces = options.widthIncludingTrailingSpaces;
    }
}

export class EllipsisFragment extends LayoutFragment {
    constructor(
      index: number,
      span: ParagraphSpan
    ) {
      super(
        index,
        index,
        LineBreakType.endOfText,
        null,
        // The ellipsis is always at the end of the line, so it can't be
        // sandwiched. This means it'll always follow the paragraph direction.
        FragmentFlow.sandwich,
        span,
        { trailingNewlines: 0, trailingSpaces: 0 }
      );
    }
  
    get isSpaceOnly(): boolean {
      return false;
    }
  
    get isPlaceholder(): boolean {
      return false;
    }
  
    getText(paragraph: CanvasParagraph): string {
      if (!paragraph.paragraphStyle.ellipsis) {
        throw new Error('Paragraph style ellipsis is not defined');
      }
      return paragraph.paragraphStyle.ellipsis;
    }
  
    split(index: number): LayoutFragment[] {
      throw new Error('Cannot split an EllipsisFragment');
    }
  }