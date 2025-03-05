// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import { TextDirection } from '../ui';
import { LineBreakType, LineBreaker } from './line_breaker';
import { ParagraphSpan } from './paragraph_span';
import { TextLayoutService } from './layout_service';

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

    /**
     * Measures this fragment using the given layout service.
     */
    measure(layoutService: TextLayoutService): void {
        // Update the text context with the current span's style
        layoutService.updateTextContext(this.span);

        // Measure the fragment's width
        this._width = layoutService.measureText(
            this.text,
            this.start,
            this.end,
            { letterSpacing: this.letterSpacing }
        );

        // Get height and baseline from the ruler
        const metrics = layoutService.getRulerMetrics(this.span);
        this._height = metrics.height;
        this._baseline = metrics.baseline;

        // Determine text direction
        this._textDirection = this.span.style.textDirection ?? TextDirection.ltr;
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
