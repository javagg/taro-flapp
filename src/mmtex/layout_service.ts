import { EllipsisFragment, LayoutFragment, LayoutFragmenter } from './layout_fragmenter';
import { LineBreakType } from './line_breaker';
import { GlyphInfo, PositionWithAffinity, Rect, RectWithDirection, TextDirection as TextDirectionType } from '@/mtex/canvaskit';
import { TextDirection, TextAlign, PlaceholderAlignment, Affinity } from './dom';
import { _Paragraph, ParagraphSpan, PlaceholderSpan } from './engine';
import { createDomCanvasElement } from './dom';
import { ParagraphLine } from './paragraph';
import { FragmentFlow } from './text_direction';
import { baselineRatioHack, measureSubstring } from './measurement';

/** A single canvas2d context to use for all text measurements. */
const textContext: CanvasRenderingContext2D = createDomCanvasElement(0, 0).getContext('2d')!;

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

  // private _fragments: LayoutFragment[] = [];
  // private _ruler: Ruler | null = null;
  _paintBounds: Rect = Float32Array.of(0, 0, 0, 0);
  private _longestLine: ParagraphLine | null = null;
  private _didExceedMaxLines = false;

  lines: ParagraphLine[] = [];

  spanometer: Spanometer;
  layoutFragmenter: LayoutFragmenter;

  constructor(private readonly paragraph: _Paragraph) {
    this.spanometer = new Spanometer(paragraph);
    this.layoutFragmenter = new LayoutFragmenter(paragraph.plainText, paragraph.spans);
  }

  get width(): number { return this._width; }
  get height(): number { return this._height; }
  get alphabeticBaseline(): number { return this._alphabeticBaseline; }
  get ideographicBaseline(): number { return this._ideographicBaseline; }
  get maxIntrinsicWidth(): number { return this._maxIntrinsicWidth; }
  get minIntrinsicWidth(): number { return this._minIntrinsicWidth; }
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

  get paintBounds(): Rect { return this._paintBounds; }

  /// Performs the layout on a paragraph given the [constraints].
  ///
  /// The function starts by resetting all layout-related properties. Then it
  /// starts looping through the paragraph to calculate all layout metrics.
  ///
  /// It uses a [Spanometer] to perform measurements within spans of the
  /// paragraph. It also uses [LineBuilders] to generate [ParagraphLine]s as
  /// it iterates through the paragraph.
  ///
  /// The main loop keeps going until:
  ///
  /// 1. The end of the paragraph is reached (i.e. LineBreakType.endOfText).
  /// 2. Enough lines have been computed to satisfy [maxLines].
  /// 3. An ellipsis is appended because of an overflow.
  performLayout(width: number): void {
    // Reset results from previous layout
    this._height = 0.0;
    this._longestLine = null;
    this._minIntrinsicWidth = 0.0;
    this._maxIntrinsicWidth = 0.0;
    this._didExceedMaxLines = false;
    this.lines = [];

    let currentLine = LineBuilder.first(this.paragraph, this.spanometer, width);

    const fragments = this.layoutFragmenter.fragment();
    fragments.forEach(fragment => this.spanometer.measureFragment(fragment));

    outerLoop:
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];

      currentLine.addFragment(fragment);

      while (currentLine.isOverflowing) {
        if (currentLine.canHaveEllipsis) {
          currentLine.insertEllipsis();
          this.lines.push(currentLine.build());
          this._didExceedMaxLines = true;
          break outerLoop;
        }

        if (currentLine.isBreakable) {
          currentLine.revertToLastBreakOpportunity();
        } else {
          // The line can't be legally broken, so the last fragment (that caused
          // the line to overflow) needs to be force-broken.
          currentLine.forceBreakLastFragment();
        }

        i += currentLine.appendZeroWidthFragments(fragments, i + 1);
        this.lines.push(currentLine.build());
        currentLine = currentLine.nextLine();
      }

      if (currentLine.isHardBreak) {
        this.lines.push(currentLine.build());
        currentLine = currentLine.nextLine();
      }
    }

    const maxLines = this.paragraph.paragraphStyle.maxLines;
    if (maxLines !== null && this.lines.length > maxLines!) {
      this._didExceedMaxLines = true;
      this.lines.splice(maxLines!);
    }

    // ***************************************************************** //
    // *** PARAGRAPH BASELINE & HEIGHT & LONGEST LINE & PAINT BOUNDS *** //
    // ***************************************************************** //
    let boundsLeft = Infinity;
    let boundsRight = -Infinity;
    for (const line of this.lines) {
      this._height += line.height;
      if (this._alphabeticBaseline === -1.0) {
        this._alphabeticBaseline = line.baseline;
        this._ideographicBaseline = this.alphabeticBaseline * baselineRatioHack;
      }
      const longestLineWidth = this.longestLine?.width ?? 0.0;
      if (longestLineWidth < line.width) {
        this._longestLine = line;
      }

      const left = line.left;
      if (left < boundsLeft) {
        boundsLeft = left;
      }
      const right = left + line.width;
      if (right > boundsRight) {
        boundsRight = right;
      }
    }
    this._paintBounds = Float32Array.of(boundsLeft, 0, boundsRight, this.height);

    // **************************** //
    // *** FRAGMENT POSITIONING *** //
    // **************************** //

    // We have to perform justification alignment first so that we can position
    // fragments correctly later. 
    if (this.lines.length > 0) {
      const shouldJustifyParagraph = Number.isFinite(this.width) &&
        this.paragraph.paragraphStyle.textAlign === TextAlign.Justify;

      if (shouldJustifyParagraph) {
        // Don't apply justification to the last line.
        for (let i = 0; i < this.lines.length - 1; i++) {
          for (const fragment of this.lines[i].fragments) {
            fragment.justifyTo(this.width);
          }
        }
      }
    }

    this.lines.forEach(line => this._positionLineFragments(line));

    // ******************************** //
    // *** MAX/MIN INTRINSIC WIDTHS *** //
    // ******************************** //

    // TODO(mdebbar): Handle maxLines https://github.com/flutter/flutter/issues/91254
    let runningMinIntrinsicWidth = 0;
    let runningMaxIntrinsicWidth = 0;

    for (const fragment of fragments) {
      runningMinIntrinsicWidth += fragment.widthExcludingTrailingSpaces;
      // Max intrinsic width includes the width of trailing spaces.

      runningMaxIntrinsicWidth += fragment.widthIncludingTrailingSpaces;

      switch (fragment.type) {
        case LineBreakType.prohibited:
          break;

        case LineBreakType.opportunity:
          this._minIntrinsicWidth = Math.max(this.minIntrinsicWidth, runningMinIntrinsicWidth);
          runningMinIntrinsicWidth = 0;
          break;

        case LineBreakType.mandatory:
        case LineBreakType.endOfText:
          this._minIntrinsicWidth = Math.max(this.minIntrinsicWidth, runningMinIntrinsicWidth);
          this._maxIntrinsicWidth = Math.max(this.maxIntrinsicWidth, runningMaxIntrinsicWidth);
          runningMinIntrinsicWidth = 0;
          runningMaxIntrinsicWidth = 0;
          break;
      }
    }
  }

  get _paragraphDirection() {
    return this.paragraph.paragraphStyle.effectiveTextDirection;
  }

  /// Positions the fragments taking into account their directions and the
  /// paragraph's direction.
  private _positionLineFragments(line: ParagraphLine): void {
    let previousDirection = this._paragraphDirection;
    let startOffset = 0.0;
    let sandwichStart: number | null = null;
    let sequenceStart = 0;

    for (let i = 0; i <= line.fragments.length; i++) {
      if (i < line.fragments.length) {
        const fragment = line.fragments[i];

        if (fragment.fragmentFlow === FragmentFlow.previous) {
          sandwichStart = null;
          continue;
        }
        if (fragment.fragmentFlow === FragmentFlow.sandwich) {
          sandwichStart = sandwichStart ?? i;
          continue;
        }

        if (fragment.fragmentFlow !== FragmentFlow.ltr &&
          fragment.fragmentFlow !== FragmentFlow.rtl) {
          throw new Error('Invalid fragment flow');
        }

        const currentDirection = fragment.fragmentFlow === FragmentFlow.ltr
          ? TextDirection.LTR
          : TextDirection.RTL;

        if (currentDirection === previousDirection) {
          sandwichStart = null;
          continue;
        }
      }

      // We've reached a fragment that'll flip the text direction. Let's
      // position the sequence that we've been traversing.
      if (sandwichStart === null) {
        // Position fragments in range [sequenceStart:i)
        startOffset += this._positionFragmentRange(
          line,
          sequenceStart,
          i,
          previousDirection,
          startOffset
        );
      } else {
        // Position fragments in range [sequenceStart:sandwichStart)
        startOffset += this._positionFragmentRange(
          line,
          sequenceStart,
          sandwichStart,
          previousDirection,
          startOffset
        );
        // Position fragments in range [sandwichStart:i)
        startOffset += this._positionFragmentRange(
          line,
          sandwichStart,
          i,
          this._paragraphDirection,
          startOffset
        );
      }

      sequenceStart = i;
      sandwichStart = null;

      if (i < line.fragments.length) {
        previousDirection = line.fragments[i].textDirection!;
      }
    }
  }


  private _positionFragmentRange(line: ParagraphLine,
    start: number,
    end: number,
    direction: TextDirectionType,
    startOffset: number,
  ): number {
    if (start > end) throw new Error("Start must be less than or equal to end");

    let cumulativeWidth = 0.0;

    // The bodies of the two for loops below must remain identical. The only
    if (direction === this._paragraphDirection) {
      for (let i = start; i < end; i++) {
        cumulativeWidth += this._positionOneFragment(
          line,
          i,
          startOffset + cumulativeWidth,
          direction
        );
      }
    } else {
      for (let i = end - 1; i >= start; i--) {
        cumulativeWidth += this._positionOneFragment(
          line,
          i,
          startOffset + cumulativeWidth,
          direction
        );
      }
    }

    return cumulativeWidth;
  }

  private _positionOneFragment(
    line: ParagraphLine,
    i: number,
    startOffset: number,
    direction: TextDirectionType
  ): number {
    const fragment = line.fragments[i];
    fragment.setPosition(startOffset, direction);
    return fragment.widthIncludingTrailingSpaces;
  }

  getBoxesForPlaceholders(): RectWithDirection[] /*TextBox[]*/ {
    const boxes: RectWithDirection[]  /*TextBox[]*/ = [];
    for (const line of this.lines) {
      for (const fragment of line.fragments) {
        if (fragment.isPlaceholder) {
          boxes.push(fragment.toTextBox());
        }
      }
    }
    return boxes;
  }

  
  getBoxesForRange(
    start: number,
    end: number,
    boxHeightStyle: BoxHeightStyle,
    boxWidthStyle: BoxWidthStyle  
  ): TextBox[] {
    // Zero-length ranges and invalid ranges return an empty list
    if (start >= end || start < 0 || end < 0) {
      return [];
    }

    const length = this.paragraph.plainText.length;
    // Ranges that are out of bounds should return an empty list
    if (start > length || end > length) {
      return [];
    }

    const boxes: TextBox[] = [];

    for (const line of this.lines) {
      if (line.overlapsWith(start, end)) {
        for (const fragment of line.fragments) {
          if (!fragment.isPlaceholder && fragment.overlapsWith(start, end)) {
            boxes.push(fragment.toTextBox(start, end));
          }
        }
      }
    }
    return boxes;
  }

  getPositionForOffset(offset: Offset): PositionWithAffinity /*TextPosition*/ {
    // After layout, each line has boxes that contain enough information to make
    // it possible to do hit testing. Once we find the box, we look inside that
    // box to find where exactly the `offset` is located.
    const line = this._findLineForY(offset.dy);
    if (!line) {
        return { pos: 0, affinity: Affinity.Upstream };  /*new TextPosition(0);*/
    }
    // [offset] is to the left of the line
    if (offset.dx <= line.left) {
      return { pos: line.startIndex, affinity: Affinity.Upstream };  /*new TextPosition(line.startIndex);*/
    }

    // [offset] is to the right of the line
    if (offset.dx >= line.left + line.widthWithTrailingSpaces) {
      return { pos: line.endIndex - line.trailingNewlines, affinity: Affinity.Upstream };  /*new TextPosition(
        line.endIndex - line.trailingNewlines,
        TextAffinity.upstream
      );*/
    }

    const dx = offset.dx - line.left;
    for (const fragment of line.fragments) {
      if (fragment.left <= dx && dx <= fragment.right) {
        return fragment.getPositionForX(dx - fragment.left);
      }
    }
    // Is this ever reachable?
    return { pos: line.startIndex, affinity: Affinity.Upstream };  /*new TextPosition(line.startIndex);*/ 
  }

  getClosestGlyphInfo(offset: Offset): GlyphInfo | null {
    const line = this._findLineForY(offset.dy);
    if (!line) {
      return null;
    }
    const fragment = line.closestFragmentAtOffset(offset.dx - line.left);
    if (!fragment) {
      return null;
    }
    const dx = offset.dx;
    const closestGraphemeStartInFragment = !fragment.hasLeadingBrokenGrapheme
      || dx <= fragment.line.left
      || fragment.line.left + fragment.line.width <= dx
      || (fragment.textDirection === TextDirection.LTR
        ? dx >= line.left + (fragment.left + fragment.right) / 2
        : dx <= line.left + (fragment.left + fragment.right) / 2);

    const candidate1 = fragment.getClosestCharacterBox(dx);
    if (closestGraphemeStartInFragment) {
      return candidate1;
    }

    const searchLeft = fragment.textDirection === TextDirection.LTR;
    const candidate2 = fragment.line.closestFragmentTo(fragment, searchLeft)?.getClosestCharacterBox(dx);
    if (!candidate2) {
      return candidate1;
    }

    const distance1 = Math.min(
      Math.abs(candidate1.graphemeClusterLayoutBounds.left - dx),
      Math.abs(candidate1.graphemeClusterLayoutBounds.right - dx)
    );
    const distance2 = Math.min(
      Math.abs(candidate2.graphemeClusterLayoutBounds.left - dx),
      Math.abs(candidate2.graphemeClusterLayoutBounds.right - dx)
    );
    return distance2 > distance1 ? candidate1 : candidate2;
  }

  private _findLineForY(y: number): ParagraphLine | null {
    if (this.lines.length === 0) {
      return null;
    }
    // We could do a binary search here but it's not worth it because the number
    // of line is typically low, and each iteration is a cheap comparison of
    // doubles.
    for (const line of this.lines) {
      if (y <= line.height) {
        return line;
      }
      y -= line.height;
    }
    return this.lines[this.lines.length - 1];
  }
}

/// Builds instances of [ParagraphLine] for the given [paragraph].
///
/// Usage of this class starts by calling [LineBuilder.first] to start building
/// the first line of the paragraph.
///
/// Then fragments can be added by calling [addFragment].
///
/// After adding a fragment, one can use [isOverflowing] to determine whether
/// the added fragment caused the line to overflow or not.
///
/// Once the line is complete, it can be built by calling [build] to generate
/// a [ParagraphLine] instance.
///
/// To start building the next line, simply call [nextLine] to get a new
/// [LineBuilder] for the next line.
export class LineBuilder {
  private _fragments: LayoutFragment[];
  private _fragmentsForNextLine: LayoutFragment[] | null = null;
  
  readonly maxWidth: number;
  readonly paragraph: _Paragraph;
  readonly spanometer: Spanometer;
  readonly lineNumber: number;
  /// The accumulated height of all preceding lines, excluding the current line.  
  readonly accumulatedHeight: number;
  /// The width of the line so far, excluding trailing white space.
  width: number = 0.0;
  
  /// The width of the line so far, including trailing white space.
  widthIncludingSpace: number = 0.0;

  /// The distance from the top of the line to the alphabetic baseline.
  ascent: number = 0.0;
  
  /// The distance from the bottom of the line to the alphabetic baseline.
  descent: number = 0.0;

  private _lastBreakableFragment: number = -1;
  private _breakCount: number = 0;
  private _spaceCount: number = 0;
  private _trailingSpaces: number = 0;

  private constructor(
    paragraph: _Paragraph,
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
    paragraph: _Paragraph,
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


  /// The height of the line so far.
  get height(): number {
    return this.ascent + this.descent;
  }

  /// Whether this line can be legally broken into more than one line.
  get isBreakable(): boolean {
    if (this._fragments.length === 0) {
      return false;
    }
    if (this._fragments[this._fragments.length - 1].isBreak) {
       // We need one more break other than the last one.
      return this._breakCount > 1;
    }
    return this._breakCount > 0;
  }

  /// Returns true if the line can't be legally broken any further.
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

    /// The horizontal offset necessary for the line to be correctly aligned.
  get alignOffset(): number {
    const emptySpace = this.maxWidth - this.width;
    const textAlign = this.paragraph.paragraphStyle.effectiveTextAlign;

    switch (textAlign) {
      case TextAlign.Center:
        return emptySpace / 2.0;
      case TextAlign.Right:
        return emptySpace;
      case TextAlign.Start:
        return this._paragraphDirection === TextDirection.LTR ? emptySpace : 0.0;
      case TextAlign.End:
        return this._paragraphDirection === TextDirection.RTL ? 0.0 : emptySpace;
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
      // Can't append more fragments to this line if it has a hard break.
      return false;
    }
    if (this._fragmentsForNextLine && this._fragmentsForNextLine.length > 0) {
      // If we already have fragments prepared for the next line, then we can't
      // append more fragments to this line.
      return false;
    }
    return true;
  }

  private get _paragraphDirection(): TextDirectionType {
    return this.paragraph.paragraphStyle.effectiveTextDirection;
  }

  addFragment(fragment: LayoutFragment): void {
    this._updateMetrics(fragment);
    if (fragment.isBreak) {
      this._lastBreakableFragment = this._fragments.length;
    }
    this._fragments.push(fragment);
  }

  /// Updates the [LineBuilder]'s metrics to take into account the new [fragment].
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
      case PlaceholderAlignment.Top:
        // The placeholder is aligned to the top of text, which means it has the
        // same `ascent` as the remaining text. We only need to extend the
        // `descent` enough to fit the placeholder.        
        ascent = this.ascent;
        descent = placeholder.height - this.ascent;
        break;
      case PlaceholderAlignment.Bottom:
        // The opposite of `top`. The `descent` is the same, but we extend the
        // `ascent`.
        ascent = placeholder.height - this.descent;
        descent = this.descent;
        break;
      case PlaceholderAlignment.Middle:
        const textMidPoint = this.height / 2;
        const placeholderMidPoint = placeholder.height / 2;
        const diff = placeholderMidPoint - textMidPoint;
        ascent = this.ascent + diff;
        descent = this.descent + diff;
        break;
      case PlaceholderAlignment.AboveBaseline:
        ascent = placeholder.height;
        descent = 0.0;
        break;
      case PlaceholderAlignment.BelowBaseline:
        ascent = 0.0;
        descent = placeholder.height;
        break;
      case PlaceholderAlignment.Baseline:
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

     // When the line has fragments other than the last one, we can always allow
    // the last fragment to be empty (i.e. completely removed from the line).
    const hasOtherFragments = this._fragments.length > 1;
    const allowLastFragmentToBeEmpty = hasOtherFragments || allowEmptyLine;
    const lastFragment = this._fragments[this._fragments.length - 1];
    
    if (lastFragment.isPlaceholder) {
      // Placeholder can't be force-broken. Either keep all of it in the line or
      // move it to the next line.    
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
      // The entire fragment remained intact. Let's keep everything as is.
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
    const ellipsisFragment = new EllipsisFragment( this.endIndex, lastFragment.span)
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


    // The last fragment in the line may or may not be breakable. Regardless,
    // it needs to be removed.
    //
    // We need to find the latest breakable fragment in the line (other than the
    // last fragment). Such breakable fragment is guaranteed to be found because
    // the line `isBreakable`.

    // Start from the end and skip the last fragment.    
    let i = this._fragments.length - 2;
    while (!this._fragments[i].isBreak) {
      i--;
    }
    this._fragmentsForNextLine = this._fragments.slice(i + 1);
    this._fragments = this._fragments.slice(0, i + 1);
    this._recalculateMetrics();
  }

  /// Appends as many zero-width fragments as this line allows.
  ///
  /// Returns the number of fragments that were appended.
  appendZeroWidthFragments(fragments: LayoutFragment[], startFrom: number): number {
    let i = startFrom;
    while (this._canAppendEmptyFragments && i < fragments.length && fragments[i].widthExcludingTrailingSpaces === 0) {
      this.addFragment(fragments[i]);
      i++;
    }
    return i - startFrom;
  }

  /// Builds the [ParagraphLine] instance that represents this line.
  build(): ParagraphLine {
    if (!this._fragmentsForNextLine) {
      this._fragmentsForNextLine = this._fragments.slice(this._lastBreakableFragment + 1);
      this._fragments = this._fragments.slice(0, this._lastBreakableFragment + 1);
    }
    const trailingNewlines = this._fragments.length === 0 ? 0 : this._fragments[this._fragments.length - 1].trailingNewlines;
    const line: ParagraphLine = new ParagraphLine(
      this.isHardBreak,
      this.ascent,
      this.descent,
      this.height,
      this.width,
      this.alignOffset,
      this.accumulatedHeight + this.ascent,
      this.lineNumber,
      this.startIndex,
      this.endIndex,
      trailingNewlines,
      this._trailingSpaces,
      this._spaceCount,
      this.widthIncludingSpace,
      this._fragments,
      this._paragraphDirection,
      this.paragraph,
      // lineNumber: this.lineNumber,
      // startIndex: this.startIndex,
      // endIndex: this.endIndex,
      // trailingNewlines,
      // trailingSpaces: this._trailingSpaces,
      // spaceCount: this._spaceCount,
      // hardBreak: this.isHardBreak,
      // width: this.width,
      // widthWithTrailingSpaces: this.widthIncludingSpace,
      // left: this.alignOffset,
      // height: this.height,
      // baseline: this.accumulatedHeight + this.ascent,
      // ascent: this.ascent,
      // descent: this.descent,
      // fragments: this._fragments,
      // textDirection: this._paragraphDirection,
      // paragraph: this.paragraph,
    );
    for (const fragment of this._fragments) {
      fragment.line = line;
    }
    return line;
  }

  /// Creates a new [LineBuilder] to build the next line in the paragraph.
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

/// Responsible for taking measurements within spans of a paragraph.
///
/// Can't perform measurements across spans. To measure across spans, multiple
/// measurements have to be taken.
///
/// Before performing any measurement, the [currentSpan] has to be set. Once
/// it's set, the [Spanometer] updates the underlying [context] so that
/// subsequent measurements use the correct styles.
export class Spanometer {
  // private static _rulerHost: RulerHost = new (class RulerHost { })();
  private static _rulers: Map<TextHeightStyle, TextHeightRuler> = new Map();

  constructor(public readonly paragraph: _Paragraph) { }

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
      if (_lastContextFont !== newCssFontString) {
        _lastContextFont = newCssFontString;
        textContext.font = newCssFontString;
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
    return measureSubstring(textContext, text, 0, text.length);
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
    return measureSubstring(textContext, this.paragraph.plainText, start, end, this.letterSpacing);
  }
}
