// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// import { TextDirection, Offset, Rect } from '../ui';
// import { DomCanvasRenderingContext2D, createDomCanvasElement } from '../dom';
import { LayoutFragment, LayoutFragmenter } from './layout_fragmenter';
import { LineBreakType } from './line_breaker';
// import { measureSubstring } from './measurement';
import { ParagraphSpan, PlaceholderSpan } from './paragraph_span';
// import { TextPosition, GlyphInfo, } from './paragraph';
import { Rect } from '@/mtex/canvaskit';
import { _Paragraph } from './engine';
import { measureSubstring } from './measurement';
// import { Ruler } from './ruler';



/** A single canvas2d context to use for all text measurements. */
export const textContext: CanvasRenderingContext2D = createDomCanvasElement(0, 0).getContext('2d')!;

/** The last font used in the textContext. */
let _lastContextFont: string | null = null;

/**
 * Performs layout on a CanvasParagraph.
 * 
 * It uses a DomCanvasElement to measure text.
 */
export class TextLayoutService {
  private _currentSpan: ParagraphSpan | null = null;
  private _width = 0.0;
  private _height = 0.0;
  private _alphabeticBaseline = 0.0;
  private _ideographicBaseline = 0.0;
  private _maxIntrinsicWidth = 0.0;
  private _minIntrinsicWidth = 0.0;
  private _lines: ParagraphLine[] = [];
  private _fragments: LayoutFragment[] = [];
  // private _ruler: Ruler | null = null;
  private _longestLine: ParagraphLine | null = null;
  private _didExceedMaxLines = false;

  constructor(private readonly paragraph: _Paragraph) { }

  get width(): number { return this._width; }
  get height(): number { return this._height; }
  get alphabeticBaseline(): number { return this._alphabeticBaseline; }
  get ideographicBaseline(): number { return this._ideographicBaseline; }
  get maxIntrinsicWidth(): number { return this._maxIntrinsicWidth; }
  get minIntrinsicWidth(): number { return this._minIntrinsicWidth; }
  get lines(): ParagraphLine[] { return this._lines; }
  get longestLine(): ParagraphLine | null { return this._longestLine; }
  get didExceedMaxLines(): boolean { return this._didExceedMaxLines; }

  get currentSpan(): ParagraphSpan {
    if (!this._currentSpan) {
      throw new Error('currentSpan is null');
    }
    return this._currentSpan;
  }

  get letterSpacing(): number | undefined {
    return this.currentSpan.style.letterSpacing;
  }

  get paintBounds(): Rect {
    return Rect.fromLTWH(0, 0, this._width, this._height);
  }

  /**
   * Performs the layout on the paragraph given the constraints.
   */
  performLayout(width: number /*   constraints: ParagraphConstraints*/): void {
    // Reset layout state
    this._width = 0.0;
    this._height = 0.0;
    this._alphabeticBaseline = 0.0;
    this._ideographicBaseline = 0.0;
    this._maxIntrinsicWidth = 0.0;
    this._minIntrinsicWidth = 0.0;
    this._lines = [];
    this._longestLine = null;
    this._didExceedMaxLines = false;

    // Find fragments in the paragraph
    this._fragments = new LayoutFragmenter(
      this.paragraph.plainText,
      this.paragraph.spans
    ).fragment();

    // Measure text
    this._measureText();

    // Layout the fragments
    this._layoutFragments(width);
  }

  /**
   * Measures text in the paragraph and sets up the initial state.
   */
  private _measureText(): void {
    if (this.paragraph.spans.length === 0) {
      return;
    }

    // Initialize the first span
    this._currentSpan = this.paragraph.spans[0];
    this._updateTextContext();

    // Create a ruler for the paragraph
    this._ruler = new Ruler(this.paragraph.paragraphStyle);

    // Measure each fragment
    for (const fragment of this._fragments) {
      fragment.measure(this);
      this._maxIntrinsicWidth = Math.max(
        this._maxIntrinsicWidth,
        fragment.width
      );
    }
  }

  /**
   * Updates the text context with the current span's style.
   */
  private _updateTextContext(): void {
    const font = this.currentSpan.style.cssFontString;
    if (font !== _lastContextFont) {
      textContext.font = font;
      _lastContextFont = font;
    }
  }

  /**
   * Lays out the fragments according to the constraints.
   */
  private _layoutFragments(width: number /*constraints: ParagraphConstraints*/): void {
    const maxLines = this.paragraph.paragraphStyle.maxLines;
    let lineCount = 0;
    let y = 0.0;
    let currentLineFragments: LayoutFragment[] = [];
    let currentLineWidth = 0.0;
    let currentLineHeight = 0.0;
    let currentLineBaseline = 0.0;

    for (let i = 0; i < this._fragments.length; i++) {
      const fragment = this._fragments[i];

      // Check if we need to start a new line
      if (currentLineWidth + fragment.width > width /*constraints.width*/ ||
        fragment.type === LineBreakType.mandatory) {
        // Create a new line with current fragments
        if (currentLineFragments.length > 0) {
          this._addLine(
            currentLineFragments,
            currentLineWidth,
            currentLineHeight,
            currentLineBaseline,
            y
          );
          lineCount++;
          y += currentLineHeight;

          // Check if we've exceeded max lines
          if (maxLines !== null && lineCount >= maxLines) {
            this._didExceedMaxLines = i < this._fragments.length - 1;
            break;
          }

          // Reset line state
          currentLineFragments = [];
          currentLineWidth = 0.0;
          currentLineHeight = 0.0;
          currentLineBaseline = 0.0;
        }
      }

      // Add fragment to current line
      currentLineFragments.push(fragment);
      currentLineWidth += fragment.width;
      currentLineHeight = Math.max(currentLineHeight, fragment.height);
      currentLineBaseline = Math.max(currentLineBaseline, fragment.baseline);
    }

    // Add the last line if there are remaining fragments
    if (currentLineFragments.length > 0) {
      this._addLine(
        currentLineFragments,
        currentLineWidth,
        currentLineHeight,
        currentLineBaseline,
        y
      );
      y += currentLineHeight;
    }

    // Update paragraph metrics
    this._width = width //constraints.width;
    this._height = y;
  }

  /**
   * Adds a new line to the paragraph.
   */
  private _addLine(
    fragments: LayoutFragment[],
    width: number,
    height: number,
    baseline: number,
    y: number
  ): void {
    const startIndex = fragments[0].start;
    const endIndex = fragments[fragments.length - 1].end;

    // Determine line's text direction
    const textDirection = this._computeLineDirection(fragments);

    // Compute left offset based on text alignment
    const left = this._computeLineLeft(width, textDirection);

    const line = new ParagraphLine(
      fragments,
      startIndex,
      endIndex,
      width,
      height,
      baseline,
      left,
      textDirection
    );

    this._lines.push(line);

    // Update longest line
    if (!this._longestLine || line.width > this._longestLine.width) {
      this._longestLine = line;
    }
  }

  /**
   * Computes the dominant text direction for a line.
   */
  private _computeLineDirection(fragments: LayoutFragment[]): TextDirection {
    // Implementation of text direction computation
    // This would involve analyzing the fragments' text direction
    // and determining the dominant direction for the line
    return TextDirection.ltr; // Default to LTR for now
  }

  /**
   * Computes the left offset for a line based on text alignment.
   */
  private _computeLineLeft(lineWidth: number, textDirection: TextDirection): number {
    const align = this.paragraph.paragraphStyle.textAlign;
    const maxWidth = this._width;

    switch (align) {
      case 'right':
        return maxWidth - lineWidth;
      case 'center':
        return (maxWidth - lineWidth) / 2;
      case 'justify':
      case 'left':
      default:
        return 0;
    }
  }

  getBoxesForPlaceholders(): ui.TextBox[] {
    const boxes: ui.TextBox[] = [];
    for (const line of this.lines) {
      for (const fragment of line.fragments) {
        if (fragment.isPlaceholder) {
          boxes.push(fragment.toTextBox());
        }
      }
    }
    return boxes;
  }
  
  /**
   * Gets the position in the text for the given pixel offset.
   */
  getPositionForOffset(offset: Offset): TextPosition {
    // Handle empty paragraph
    if (this._lines.length === 0) {
      return new TextPosition(offset: 0);
    }

    // Find the line that contains the offset
    const y = offset.y;
    let lineIndex = 0;
    let lineTop = 0;

    for (let i = 0; i < this._lines.length; i++) {
      const line = this._lines[i];
      if (lineTop + line.height > y || i === this._lines.length - 1) {
        lineIndex = i;
        break;
      }
      lineTop += line.height;
    }

    const line = this._lines[lineIndex];
    const lineOffset = offset.x - line.left;

    // Find the fragment that contains the offset
    let currentX = 0;
    for (const fragment of line.fragments) {
      if (currentX + fragment.width >= lineOffset ||
        fragment === line.fragments[line.fragments.length - 1]) {
        // Found the fragment, now find the exact character position
        const localOffset = lineOffset - currentX;
        const position = this._getPositionInFragment(fragment, localOffset);
        return new TextPosition(offset: position);
      }
      currentX += fragment.width;
    }

    // Fallback to end of line
    return new TextPosition(offset: line.endIndex);
  }

  /**
   * Gets the closest glyph information for the given offset.
   */
  getClosestGlyphInfo(offset: Offset): GlyphInfo | null {
    const position = this.getPositionForOffset(offset);
    if (position.offset >= this.paragraph.plainText.length) {
      return null;
    }

    // Find the line containing this position
    const line = this._findLineForOffset(position.offset);
    if (!line) return null;

    // Find the fragment containing this position
    const fragment = this._findFragmentForOffset(line, position.offset);
    if (!fragment) return null;

    return {
      graphemeClusterLength: 1, // Simplified for now
      directionality: fragment.textDirection ?? TextDirection.ltr,
    };
  }

  /**
   * Gets text boxes for the given range.
   */
  getBoxesForRange(
    start: number,
    end: number,
    boxHeightStyle: BoxHeightStyle = BoxHeightStyle.tight,
    boxWidthStyle: BoxWidthStyle = BoxWidthStyle.tight,
  ): TextBox[] {
    const boxes: TextBox[] = [];
    if (this._lines.length === 0) return boxes;

    // Clamp range to text length
    start = Math.max(0, Math.min(start, this.paragraph.plainText.length));
    end = Math.max(0, Math.min(end, this.paragraph.plainText.length));
    if (start >= end) return boxes;

    let y = 0;
    for (const line of this._lines) {
      // Skip lines before the range
      if (line.endIndex <= start) {
        y += line.height;
        continue;
      }

      // Stop if we're past the range
      if (line.startIndex >= end) break;

      // Calculate intersection of line range and selection range
      const lineStart = Math.max(start, line.startIndex);
      const lineEnd = Math.min(end, line.endIndex);

      if (lineStart < lineEnd) {
        // Find fragments that contain the range
        let x = line.left;
        for (const fragment of line.fragments) {
          if (fragment.end <= lineStart) {
            x += fragment.width;
            continue;
          }
          if (fragment.start >= lineEnd) break;

          const fragStart = Math.max(lineStart, fragment.start);
          const fragEnd = Math.min(lineEnd, fragment.end);

          if (fragStart < fragEnd) {
            const box = this._getBoxForFragment(
              fragment,
              fragStart,
              fragEnd,
              x,
              y,
              line.height,
              boxHeightStyle,
              boxWidthStyle
            );
            if (box) boxes.push(box);
          }
          x += fragment.width;
        }
      }
      y += line.height;
    }

    return boxes;
  }

  private _getPositionInFragment(fragment: LayoutFragment, localOffset: number): number {
    // Binary search to find the closest character boundary
    let start = fragment.start;
    let end = fragment.end;
    let bestOffset = start;
    let bestDistance = Number.POSITIVE_INFINITY;

    while (start < end) {
      const mid = (start + end) >> 1;
      const width = measureSubstring(
        textContext,
        this.paragraph.plainText,
        fragment.start,
        mid,
        { letterSpacing: this.letterSpacing }
      );

      const distance = Math.abs(width - localOffset);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestOffset = mid;
      }

      if (width < localOffset) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    return bestOffset;
  }

  private _findLineForOffset(offset: number): ParagraphLine | null {
    return this._lines.find(line =>
      offset >= line.startIndex && offset <= line.endIndex
    ) ?? null;
  }

  private _findFragmentForOffset(line: ParagraphLine, offset: number): LayoutFragment | null {
    return line.fragments.find(fragment =>
      offset >= fragment.start && offset <= fragment.end
    ) ?? null;
  }

  private _getBoxForFragment(
    fragment: LayoutFragment,
    start: number,
    end: number,
    x: number,
    y: number,
    lineHeight: number,
    heightStyle: BoxHeightStyle,
    widthStyle: BoxWidthStyle
  ): TextBox | null {
    const width = measureSubstring(
      textContext,
      this.paragraph.plainText,
      start,
      end,
      { letterSpacing: this.letterSpacing }
    );

    if (width <= 0) return null;

    return new TextBox(
      Rect.fromLTWH(x, y, width, lineHeight),
      fragment.textDirection ?? TextDirection.ltr
    );
  }
}


/**
 * Represents a line of text in a paragraph.
 */
class ParagraphLine {
  constructor(
    readonly fragments: LayoutFragment[],
    readonly startIndex: number,
    readonly endIndex: number,
    readonly width: number,
    readonly height: number,
    readonly baseline: number,
    readonly left: number,
    readonly textDirection: TextDirection,
  ) { }

  /**
   * Whether this line contains the given text position.
   */
  containsTextPosition(position: number): boolean {
    return position >= this.startIndex && position <= this.endIndex;
  }

  /**
   * Whether this line contains any part of the given text range.
   */
  intersectsTextRange(start: number, end: number): boolean {
    return start < this.endIndex && this.startIndex < end;
  }

  /**
   * Gets the x coordinate for the given text position within this line.
   */
  getXForOffset(textContext: DomCanvasRenderingContext2D, position: number): number {
    let x = this.left;
    for (const fragment of this.fragments) {
      if (position <= fragment.end) {
        if (position >= fragment.start) {
          // Position is within this fragment
          const width = measureSubstring(
            textContext,
            fragment.text,
            fragment.start,
            position,
            { letterSpacing: fragment.letterSpacing }
          );
          return x + width;
        }
        break;
      }
      x += fragment.width;
    }
    return x;
  }
}

enum TextAlign {
  center,
  right,
  start,
  end,
  justify,
}

enum TextDirection {
  ltr,
  rtl,
}

enum PlaceholderAlignment {
  top,
  bottom,
  middle,
  aboveBaseline,
  belowBaseline,
  baseline,
}

enum TextHeightStyle {
  // 可以根据实际情况补充
}

export class LineBuilder {
  private _fragments: LayoutFragment[];
  private _fragmentsForNextLine: LayoutFragment[] | null = null;
  readonly maxWidth: number;
  readonly paragraph: CanvasParagraph;
  readonly spanometer: Spanometer;
  readonly lineNumber: number;
  readonly accumulatedHeight: number;
  width: number = 0.0;
  widthIncludingSpace: number = 0.0;
  ascent: number = 0.0;
  descent: number = 0.0;
  private _lastBreakableFragment: number = -1;
  private _breakCount: number = 0;
  private _spaceCount: number = 0;
  private _trailingSpaces: number = 0;

  private constructor(
    paragraph: CanvasParagraph,
    spanometer: Spanometer,
    maxWidth: number,
    lineNumber: number,
    accumulatedHeight: number,
    fragments: LayoutFragment[]
  ) {
    this.paragraph = paragraph;
    this.spanometer = spanometer;
    this.maxWidth = maxWidth;
    this.lineNumber = lineNumber;
    this.accumulatedHeight = accumulatedHeight;
    this._fragments = fragments;
    this._recalculateMetrics();
  }

  static first(
    paragraph: CanvasParagraph,
    spanometer: Spanometer,
    maxWidth: number
  ): LineBuilder {
    return new LineBuilder(
      paragraph,
      spanometer,
      maxWidth,
      0,
      0.0,
      []
    );
  }

  get startIndex(): number {
    if (this._fragments.length > 0 || this._fragmentsForNextLine!.length > 0) {
      return this._fragments.length > 0
        ? this._fragments[0].start
        : this._fragmentsForNextLine![0].start;
    }
    throw new Error('No fragments available');
  }

  get endIndex(): number {
    if (this._fragments.length > 0 || this._fragmentsForNextLine!.length > 0) {
      return this._fragments.length > 0
        ? this._fragments[this._fragments.length - 1].end
        : this._fragmentsForNextLine![0].start;
    }
    throw new Error('No fragments available');
  }

  get _widthExcludingLastFragment(): number {
    return this._fragments.length > 1
      ? this.widthIncludingSpace - this._fragments[this._fragments.length - 1].widthIncludingTrailingSpaces
      : 0;
  }

  get height(): number {
    return this.ascent + this.descent;
  }

  get isBreakable(): boolean {
    if (this._fragments.length === 0) {
      return false;
    }
    if (this._fragments[this._fragments.length - 1].isBreak) {
      return this._breakCount > 1;
    }
    return this._breakCount > 0;
  }

  get isNotBreakable(): boolean {
    return !this.isBreakable;
  }

  get isEmpty(): boolean {
    return this._fragments.length === 0;
  }

  get isNotEmpty(): boolean {
    return this._fragments.length > 0;
  }

  get isHardBreak(): boolean {
    return this._fragments.length > 0 && this._fragments[this._fragments.length - 1].isHardBreak;
  }

  get alignOffset(): number {
    const emptySpace = this.maxWidth - this.width;
    const textAlign = this.paragraph.paragraphStyle.effectiveTextAlign;

    switch (textAlign) {
      case TextAlign.center:
        return emptySpace / 2.0;
      case TextAlign.right:
        return emptySpace;
      case TextAlign.start:
        return this._paragraphDirection === TextDirection.rtl ? emptySpace : 0.0;
      case TextAlign.end:
        return this._paragraphDirection === TextDirection.rtl ? 0.0 : emptySpace;
      default:
        return 0.0;
    }
  }

  get isOverflowing(): boolean {
    return this.width > this.maxWidth;
  }

  get canHaveEllipsis(): boolean {
    if (this.paragraph.paragraphStyle.ellipsis === null) {
      return false;
    }
    const maxLines = this.paragraph.paragraphStyle.maxLines;
    return maxLines === null || maxLines === this.lineNumber + 1;
  }

  get _canAppendEmptyFragments(): boolean {
    if (this.isHardBreak) {
      return false;
    }
    if (this._fragmentsForNextLine && this._fragmentsForNextLine.length > 0) {
      return false;
    }
    return true;
  }

  private get _paragraphDirection(): TextDirection {
    return this.paragraph.paragraphStyle.effectiveTextDirection;
  }

  addFragment(fragment: LayoutFragment): void {
    this._updateMetrics(fragment);
    if (fragment.isBreak) {
      this._lastBreakableFragment = this._fragments.length;
    }
    this._fragments.push(fragment);
  }

  private _updateMetrics(fragment: LayoutFragment): void {
    this._spaceCount += fragment.trailingSpaces;
    if (fragment.isSpaceOnly) {
      this._trailingSpaces += fragment.trailingSpaces;
    } else {
      this._trailingSpaces = fragment.trailingSpaces;
      this.width = this.widthIncludingSpace + fragment.widthExcludingTrailingSpaces;
    }
    this.widthIncludingSpace += fragment.widthIncludingTrailingSpaces;
    if (fragment.isPlaceholder) {
      this._adjustPlaceholderAscentDescent(fragment);
    }
    if (fragment.isBreak) {
      this._breakCount++;
    }
    this.ascent = Math.max(this.ascent, fragment.ascent);
    this.descent = Math.max(this.descent, fragment.descent);
  }

  private _adjustPlaceholderAscentDescent(fragment: LayoutFragment): void {
    const placeholder = fragment.span as PlaceholderSpan;
    let ascent: number, descent: number;
    switch (placeholder.alignment) {
      case PlaceholderAlignment.top:
        ascent = this.ascent;
        descent = placeholder.height - this.ascent;
        break;
      case PlaceholderAlignment.bottom:
        ascent = placeholder.height - this.descent;
        descent = this.descent;
        break;
      case PlaceholderAlignment.middle:
        const textMidPoint = this.height / 2;
        const placeholderMidPoint = placeholder.height / 2;
        const diff = placeholderMidPoint - textMidPoint;
        ascent = this.ascent + diff;
        descent = this.descent + diff;
        break;
      case PlaceholderAlignment.aboveBaseline:
        ascent = placeholder.height;
        descent = 0.0;
        break;
      case PlaceholderAlignment.belowBaseline:
        ascent = 0.0;
        descent = placeholder.height;
        break;
      case PlaceholderAlignment.baseline:
        ascent = placeholder.baselineOffset;
        descent = placeholder.height - ascent;
        break;
    }
    fragment.setMetrics(this.spanometer, {
      ascent,
      descent,
      widthExcludingTrailingSpaces: fragment.widthExcludingTrailingSpaces,
      widthIncludingTrailingSpaces: fragment.widthIncludingTrailingSpaces,
    });
  }

  private _recalculateMetrics(): void {
    this.width = 0;
    this.widthIncludingSpace = 0;
    this.ascent = 0;
    this.descent = 0;
    this._spaceCount = 0;
    this._trailingSpaces = 0;
    this._breakCount = 0;
    this._lastBreakableFragment = -1;
    for (let i = 0; i < this._fragments.length; i++) {
      this._updateMetrics(this._fragments[i]);
      if (this._fragments[i].isBreak) {
        this._lastBreakableFragment = i;
      }
    }
  }

  forceBreakLastFragment(availableWidth?: number, allowEmptyLine = false): void {
    if (this._fragments.length === 0) {
      throw new Error('No fragments to break');
    }
    availableWidth = availableWidth || this.maxWidth;
    if (this.widthIncludingSpace <= availableWidth) {
      throw new Error('Line does not exceed available width');
    }
    this._fragmentsForNextLine = this._fragmentsForNextLine || [];
    const hasOtherFragments = this._fragments.length > 1;
    const allowLastFragmentToBeEmpty = hasOtherFragments || allowEmptyLine;
    const lastFragment = this._fragments[this._fragments.length - 1];
    if (lastFragment.isPlaceholder) {
      if (allowLastFragmentToBeEmpty) {
        this._fragmentsForNextLine.unshift(this._fragments.pop()!);
        this._recalculateMetrics();
      }
      return;
    }
    this.spanometer.currentSpan = lastFragment.span;
    const lineWidthWithoutLastFragment = this.widthIncludingSpace - lastFragment.widthIncludingTrailingSpaces;
    const availableWidthForFragment = availableWidth - lineWidthWithoutLastFragment;
    const forceBreakEnd = lastFragment.end - lastFragment.trailingNewlines;
    const breakingPoint = this.spanometer.forceBreak(
      lastFragment.start,
      forceBreakEnd,
      {
        availableWidth: availableWidthForFragment,
        allowEmpty: allowLastFragmentToBeEmpty,
      }
    );
    if (breakingPoint === forceBreakEnd) {
      return;
    }
    this._fragments.pop();
    this._recalculateMetrics();
    const split = lastFragment.split(breakingPoint);
    const first = split[0];
    if (first) {
      this.spanometer.measureFragment(first);
      this.addFragment(first);
    }
    const second = split[1];
    if (second) {
      this.spanometer.measureFragment(second);
      this._fragmentsForNextLine.unshift(second);
    }
  }

  insertEllipsis(): void {
    if (!this.canHaveEllipsis || !this.isOverflowing) {
      throw new Error('Cannot insert ellipsis');
    }
    const ellipsisText = this.paragraph.paragraphStyle.ellipsis!;
    this._fragmentsForNextLine = [];
    this.spanometer.currentSpan = this._fragments[this._fragments.length - 1].span;
    let ellipsisWidth = this.spanometer.measureText(ellipsisText);
    let availableWidth = Math.max(0, this.maxWidth - ellipsisWidth);
    while (this._widthExcludingLastFragment > availableWidth) {
      this._fragmentsForNextLine.unshift(this._fragments.pop()!);
      this._recalculateMetrics();
      this.spanometer.currentSpan = this._fragments[this._fragments.length - 1].span;
      ellipsisWidth = this.spanometer.measureText(ellipsisText);
      availableWidth = this.maxWidth - ellipsisWidth;
    }
    const lastFragment = this._fragments[this._fragments.length - 1];
    this.forceBreakLastFragment(availableWidth, true);
    const ellipsisFragment = {
      endIndex: this.endIndex,
      span: lastFragment.span,
      setMetrics: (spanometer: Spanometer, options: { ascent: number; descent: number; widthExcludingTrailingSpaces: number; widthIncludingTrailingSpaces: number }) => {
        // 这里可以根据实际情况实现 setMetrics 方法
      },
    } as LayoutFragment;
    ellipsisFragment.setMetrics(this.spanometer, {
      ascent: lastFragment.ascent,
      descent: lastFragment.descent,
      widthExcludingTrailingSpaces: ellipsisWidth,
      widthIncludingTrailingSpaces: ellipsisWidth,
    });
    this.addFragment(ellipsisFragment);
  }

  revertToLastBreakOpportunity(): void {
    if (!this.isBreakable) {
      throw new Error('Line is not breakable');
    }
    let i = this._fragments.length - 2;
    while (!this._fragments[i].isBreak) {
      i--;
    }
    this._fragmentsForNextLine = this._fragments.slice(i + 1);
    this._fragments = this._fragments.slice(0, i + 1);
    this._recalculateMetrics();
  }

  appendZeroWidthFragments(fragments: LayoutFragment[], startFrom: number): number {
    let i = startFrom;
    while (this._canAppendEmptyFragments && i < fragments.length && fragments[i].widthExcludingTrailingSpaces === 0) {
      this.addFragment(fragments[i]);
      i++;
    }
    return i - startFrom;
  }

  build(): ParagraphLine {
    if (!this._fragmentsForNextLine) {
      this._fragmentsForNextLine = this._fragments.slice(this._lastBreakableFragment + 1);
      this._fragments = this._fragments.slice(0, this._lastBreakableFragment + 1);
    }
    const trailingNewlines = this._fragments.length === 0 ? 0 : this._fragments[this._fragments.length - 1].trailingNewlines;
    const line: ParagraphLine = {
      lineNumber: this.lineNumber,
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      trailingNewlines,
      trailingSpaces: this._trailingSpaces,
      spaceCount: this._spaceCount,
      hardBreak: this.isHardBreak,
      width: this.width,
      widthWithTrailingSpaces: this.widthIncludingSpace,
      left: this.alignOffset,
      height: this.height,
      baseline: this.accumulatedHeight + this.ascent,
      ascent: this.ascent,
      descent: this.descent,
      fragments: this._fragments,
      textDirection: this._paragraphDirection,
      paragraph: this.paragraph,
    };
    for (const fragment of this._fragments) {
      fragment.line = line;
    }
    return line;
  }

  nextLine(): LineBuilder {
    return new LineBuilder(
      this.paragraph,
      this.spanometer,
      this.maxWidth,
      this.lineNumber + 1,
      this.accumulatedHeight + this.height,
      this._fragmentsForNextLine || []
    );
  }
}




interface TextHeightStyle {
  // 这里可以根据实际情况补充属性
}

interface TextHeightRuler {
  alphabeticBaseline: number;
  height: number;
  dispose(): void;
}



enum TextAlign {
  center,
  right,
  start,
  end,
  justify,
}

enum TextDirection {
  ltr,
  rtl,
}

enum PlaceholderAlignment {
  top,
  bottom,
  middle,
  aboveBaseline,
  belowBaseline,
  baseline,
}

export class Spanometer {
  private static _rulerHost: RulerHost = new (class RulerHost { })();
  private static _rulers: Map<TextHeightStyle, TextHeightRuler> = new Map();

  constructor(public readonly paragraph: CanvasParagraph) { }

  static get rulers(): Map<TextHeightStyle, TextHeightRuler> {
    return this._rulers;
  }

  static clearRulersCache(): void {
    this._rulers.forEach((ruler) => ruler.dispose());
    this._rulers.clear();
  }

  get letterSpacing(): number | undefined {
    return this.currentSpan?.style.letterSpacing;
  }

  private _currentRuler: TextHeightRuler | null = null;
  private _currentSpan: ParagraphSpan | null = null;

  get currentSpan(): ParagraphSpan {
    if (!this._currentSpan) {
      throw new Error('Current span is not set');
    }
    return this._currentSpan;
  }

  set currentSpan(span: ParagraphSpan | null) {
    if (span) {
      const newCssFontString = span.style.cssFontString;
      if (window._lastContextFont !== newCssFontString) {
        window._lastContextFont = newCssFontString;
        window.textContext.font = newCssFontString;
      }
    }

    if (span === this._currentSpan) {
      return;
    }
    this._currentSpan = span;

    if (!span) {
      this._currentRuler = null;
      return;
    }

    const heightStyle = span.style.heightStyle;
    let ruler = Spanometer._rulers.get(heightStyle);
    if (!ruler) {
      ruler = new (class implements TextHeightRuler {
        alphabeticBaseline = 0;
        height = 0;
        dispose() { }
      })(heightStyle, Spanometer._rulerHost);
      Spanometer._rulers.set(heightStyle, ruler);
    }
    this._currentRuler = ruler;
  }

  get isReady(): boolean {
    return this._currentSpan !== null;
  }

  get ascent(): number {
    if (!this._currentRuler) {
      throw new Error('Current ruler is not set');
    }
    return this._currentRuler.alphabeticBaseline;
  }

  get descent(): number {
    return this.height - this.ascent;
  }

  get height(): number {
    if (!this._currentRuler) {
      throw new Error('Current ruler is not set');
    }
    return this._currentRuler.height;
  }

  measureText(text: string): number {
    return this._measureSubstring(window.textContext, text, 0, text.length);
  }

  measureRange(start: number, end: number): number {
    if (!this._currentSpan) {
      throw new Error('Current span is not set');
    }
    if (start < this.currentSpan.start || start > this.currentSpan.end || end < this.currentSpan.start || end > this.currentSpan.end) {
      throw new Error('Range is out of current span');
    }
    return this._measure(start, end);
  }

  measureFragment(fragment: LayoutFragment): void {
    if (fragment.isPlaceholder) {
      const placeholder = fragment.span as PlaceholderSpan;
      fragment.setMetrics(this, {
        ascent: placeholder.height,
        descent: 0,
        widthExcludingTrailingSpaces: placeholder.width,
        widthIncludingTrailingSpaces: placeholder.width,
      });
    } else {
      this.currentSpan = fragment.span as ParagraphSpan;
      const widthExcludingTrailingSpaces = this._measure(fragment.start, fragment.end - fragment.trailingSpaces);
      const widthIncludingTrailingSpaces = this._measure(fragment.start, fragment.end - fragment.trailingNewlines);
      fragment.setMetrics(this, {
        ascent: this.ascent,
        descent: this.descent,
        widthExcludingTrailingSpaces,
        widthIncludingTrailingSpaces,
      });
    }
  }

  forceBreak(start: number, end: number, { availableWidth, allowEmpty }: { availableWidth: number; allowEmpty: boolean }): number {
    if (!this._currentSpan) {
      throw new Error('Current span is not set');
    }
    if (start < this.currentSpan.start || start > this.currentSpan.end || end < this.currentSpan.start || end > this.currentSpan.end) {
      throw new Error('Range is out of current span');
    }

    if (availableWidth <= 0) {
      return allowEmpty ? start : start + 1;
    }

    let low = start;
    let high = end;
    while (high - low > 1) {
      const mid = Math.floor((low + high) / 2);
      const width = this._measure(start, mid);
      if (width < availableWidth) {
        low = mid;
      } else if (width > availableWidth) {
        high = mid;
      } else {
        low = high = mid;
      }
    }

    if (low === start && !allowEmpty) {
      low++;
    }
    return low;
  }

  private _measure(start: number, end: number): number {
    if (!this._currentSpan) {
      throw new Error('Current span is not set');
    }
    if (start < this.currentSpan.start || start > this.currentSpan.end || end < this.currentSpan.start || end > this.currentSpan.end) {
      throw new Error('Range is out of current span');
    }
    return this._measureSubstring(window.textContext, this.paragraph.plainText, start, end, this.letterSpacing);
  }

  private _measureSubstring(context: any, text: string, start: number, end: number, letterSpacing?: number): number {
    // 这里需要根据实际情况实现测量子字符串宽度的逻辑
    return 0;
  }
}
