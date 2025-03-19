import { ParagraphStyle, TextHeightBehavior, FontWeight, FontStyle, StrutStyle,
   TextAlign as TextAlignType, TextStyle, URange,
   TextDirection as TextDirectionType
  } from "../mtex/canvaskit";
import { _Paragraph, EngineLineMetrics, EngineStrutStyle } from "../mtex/newimpl";
import { EllipsisFragment, LayoutFragment } from "./layout_fragmenter";
import { TextAlign,TextDirection } from "../mtex/bass";

export class EngineParagraphStyle implements ParagraphStyle {
  constructor(
    public textAlign?: TextAlignType,
    public textDirection?: TextDirectionType,
    public maxLines?: number,
    public fontFamily?: string,
    public fontSize?: number,
    height?: number,
    public textHeightBehavior?: TextHeightBehavior,
    public fontWeight?: FontWeight,
    public fontStyle?: FontStyle,
    strutStyle?: StrutStyle,
    public ellipsis?: string,
    // public locale?:   Locale
  ) {
    this._textHeightBehavior = textHeightBehavior;
    this._strutStyle = strutStyle as EngineStrutStyle | undefined;
    this.height = height === kTextHeightNone ? null : height;
  }

  private _textHeightBehavior?: TextHeightBehavior;
  private _strutStyle?: EngineStrutStyle;
  public height?: number | null;

  get effectiveTextAlign(): TextAlignType {
    return this.textAlign ?? TextAlign.Start;
  }

  get effectiveTextDirection(): TextDirectionType {
    return this.textDirection ?? TextDirection.LTR;
  }

  get lineHeight(): number | undefined {
    const strutStyle = this._strutStyle;
    const strutHeight = strutStyle?._height;
    if (!strutStyle || strutHeight === null || strutHeight === 0) {
      return this.height;
    }
    if (strutStyle._forceStrutHeight ?? false) {
      return strutHeight;
    }
    return Math.max(strutHeight, this.height ?? 0);
  }
}
/**
 * A node in the style inheritance tree.
 */
export class StyleNode {
  constructor(
    readonly parent: StyleNode | null,
    readonly style: TextStyle
  ) { }

  /** Creates a new child node with the given style. */
  createChild(style: TextStyle): StyleNode {
    return new StyleNode(this, style);
  }

  /** Resolves the full style by combining this node's style with its ancestors'. */
  resolveStyle(): TextStyle {
    const styles: TextStyle[] = [];
    let node: StyleNode | null = this;
    while (node != null) {
      styles.unshift(node.style);
      node = node.parent;
    }
    return Object.assign({}, ...styles);
  }
}

/**
* The root node of a style inheritance tree.
*/
export class RootStyleNode extends StyleNode {
  constructor(paragraphStyle: ParagraphStyle) {
    super(null, paragraphStyle.textStyle!);
  }

  // constructor(paragraphStyle: ParagraphStyle) {
  //   super(null, {
  //     fontFamily: paragraphStyle.fontFamily,
  //     fontSize: paragraphStyle.fontSize,
  //     fontWeight: paragraphStyle.fontWeight,
  //     fontStyle: paragraphStyle.fontStyle,
  //     height: paragraphStyle.height,
  //     locale: paragraphStyle.locale,
  //   });
  // }
}

/**
* Applies the given text style to a DOM element.
*/
// export function applyTextStyleToElement(options: {
//   element: DomElement;
//   style: EngineTextStyle;
// }): void {
//   const { element, style } = options;
//   const cssStyle = element.style;

//   if (style.color != null) {
//       cssStyle.color = style.color.toString();
//   }

//   if (style.decoration != null) {
//       const decoration = style.decoration;
//       const decorationColor = style.decorationColor;
//       const decorationStyle = style.decorationStyle;
//       const decorationThickness = style.decorationThickness;

//       let textDecoration = '';
//       if ((decoration &   TextDecoration.underline) !== 0) {
//           textDecoration += ' underline';
//       }
//       if ((decoration &   TextDecoration.overline) !== 0) {
//           textDecoration += ' overline';
//       }
//       if ((decoration &   TextDecoration.lineThrough) !== 0) {
//           textDecoration += ' line-through';
//       }
//       cssStyle.textDecoration = textDecoration.trim();

//       if (decorationColor != null) {
//           cssStyle.textDecorationColor = decorationColor.toString();
//       }
//       if (decorationStyle != null) {
//           switch (decorationStyle) {
//               case   TextDecorationStyle.dashed:
//                   cssStyle.textDecorationStyle = 'dashed';
//                   break;
//               case   TextDecorationStyle.dotted:
//                   cssStyle.textDecorationStyle = 'dotted';
//                   break;
//               case   TextDecorationStyle.double:
//                   cssStyle.textDecorationStyle = 'double';
//                   break;
//               case   TextDecorationStyle.solid:
//                   cssStyle.textDecorationStyle = 'solid';
//                   break;
//               case   TextDecorationStyle.wavy:
//                   cssStyle.textDecorationStyle = 'wavy';
//                   break;
//           }
//       }
//       if (decorationThickness != null) {
//           cssStyle.textDecorationThickness = `${decorationThickness}px`;
//       }
//   }

//   if (style.fontSize != null) {
//       cssStyle.fontSize = `${style.fontSize}px`;
//   }

//   let fontFamily = style.fontFamily;
//   if (fontFamily != null) {
//       fontFamily = fontFamily.trim();
//       if (fontFamily.indexOf(' ') >= 0 && !fontFamily.startsWith('"') && !fontFamily.endsWith('"')) {
//           fontFamily = `"${fontFamily}"`;
//       }
//       cssStyle.fontFamily = fontFamily;
//   }

//   if (style.fontWeight != null) {
//       cssStyle.fontWeight = style.fontWeight.toString();
//   }

//   if (style.fontStyle != null) {
//       switch (style.fontStyle) {
//           case   FontStyle.normal:
//               cssStyle.fontStyle = 'normal';
//               break;
//           case   FontStyle.italic:
//               cssStyle.fontStyle = 'italic';
//               break;
//       }
//   }

//   if (style.height != null) {
//       cssStyle.lineHeight = style.height.toString();
//   }

//   if (style.letterSpacing != null) {
//       cssStyle.letterSpacing = `${style.letterSpacing}px`;
//   }

//   if (style.wordSpacing != null) {
//       cssStyle.wordSpacing = `${style.wordSpacing}px`;
//   }

//   if (style.shadows != null) {
//       cssStyle.textShadow = style.shadows
//           .map(shadow => {
//               return `${shadow.offset.dx}px ${shadow.offset.dy}px ${shadow.blurRadius}px ${shadow.color}`;
//           })
//           .join(',');
//   }

//   if (style.background != null) {
//       cssStyle.backgroundColor = style.background.toString();
//   }

//   if (style.foreground != null) {
//       cssStyle.color = style.foreground.toString();
//   }
// }

/**
* Converts a TextAlign value to its CSS equivalent.
*/
// export function textAlignToCssValue(textAlign: TextAlign, textDirection: TextDirection): string {
//   switch (textAlign) {
//       case TextAlign.left:
//           return 'left';
//       case TextAlign.right:
//           return 'right';
//       case TextAlign.center:
//           return 'center';
//       case TextAlign.justify:
//           return 'justify';
//       case TextAlign.start:
//           return textDirection === TextDirection.rtl ? 'right' : 'left';
//       case TextAlign.end:
//           return textDirection === TextDirection.rtl ? 'left' : 'right';
//       default:
//           return 'left';
//   }
// } 

export class ParagraphLine {
  constructor(
    hardBreak: boolean,
    ascent: number,
    descent: number,
    height: number,
    width: number,
    left: number,
    baseline: number,
    lineNumber: number,
    public readonly startIndex: number,
    public readonly endIndex: number,
    public readonly trailingNewlines: number,
    public readonly trailingSpaces: number,
    public readonly spaceCount: number,
    public readonly widthWithTrailingSpaces: number,
    public readonly fragments: LayoutFragment[],
    public readonly textDirection: TextDirectionType,
    public readonly paragraph: _Paragraph,
    public readonly displayText?: string
  ) {
    if (trailingNewlines > endIndex - startIndex) {
      throw new Error('trailingNewlines must be less than or equal to endIndex - startIndex');
    }
    this.lineMetrics = new EngineLineMetrics(
      hardBreak,
      ascent,
      descent,
      ascent,
      height,
      width,
      left,
      baseline,
      lineNumber
    );
    this.visibleEndIndex = this._computeVisibleEndIndex();
    this.graphemeStarts = this._computeGraphemeStarts();
  }

  public readonly lineMetrics: EngineLineMetrics;
  public readonly visibleEndIndex: number;
  public readonly graphemeStarts: number[];

  get nonTrailingSpaces(): number {
    return this.spaceCount - this.trailingSpaces;
  }

  get hardBreak(): boolean {
    return this.lineMetrics.hardBreak;
  }

  get ascent(): number {
    return this.lineMetrics.ascent;
  }

  get descent(): number {
    return this.lineMetrics.descent;
  }

  get unscaledAscent(): number {
    return this.lineMetrics.unscaledAscent;
  }

  get height(): number {
    return this.lineMetrics.height;
  }

  get width(): number {
    return this.lineMetrics.width;
  }

  get left(): number {
    return this.lineMetrics.left;
  }

  get baseline(): number {
    return this.lineMetrics.baseline;
  }

  get lineNumber(): number {
    return this.lineMetrics.lineNumber;
  }

  overlapsWith(startIndex: number, endIndex: number): boolean {
    return startIndex < this.endIndex && this.startIndex < endIndex;
  }

  getText(paragraph: _Paragraph): string {
    let buffer = '';
    for (const fragment of this.fragments) {
      buffer += fragment.getText(paragraph);
    }
    return buffer;
  }

  private _fallbackGraphemeStartIterable(lineText: string): number[] {
    const graphemeStarts: number[] = [];
    let precededByHighSurrogate = false;
    for (let i = 0; i < lineText.length; i++) {
      const maskedCodeUnit = lineText.charCodeAt(i) & 0xFC00;
      if (maskedCodeUnit !== 0xDC00 || !precededByHighSurrogate) {
        graphemeStarts.push(this.startIndex + i);
      }
      precededByHighSurrogate = maskedCodeUnit === 0xD800;
    }
    return graphemeStarts;
  }

  private _fromDomSegmenter(fragmentText: string): number[] {
    const domSegmenter = createIntlSegmenter({ granularity: 'grapheme' });
    const graphemeStarts: number[] = [];
    const segments = domSegmenter.segment(fragmentText);
    for (const segment of segments) {
      graphemeStarts.push(segment.index + this.startIndex);
    }
    if (graphemeStarts.length > 0) {
      console.assert(graphemeStarts[0] === this.startIndex);
    }
    return graphemeStarts;
  }

  private _breakTextIntoGraphemes(text: string): number[] {
    const graphemeStarts = typeof Intl.Segmenter === 'undefined'
      ? this._fallbackGraphemeStartIterable(text)
      : this._fromDomSegmenter(text);
    if (graphemeStarts.length > 0) {
      graphemeStarts.push(this.visibleEndIndex);
    }
    return graphemeStarts;
  }

  private _computeVisibleEndIndex(): number {
    if (this.fragments.length === 0) {
      return this.startIndex;
    }
    const lastFragment = this.fragments[this.fragments.length - 1];
    if (lastFragment instanceof EllipsisFragment) {
      return this.fragments[this.fragments.length - 2].end;
    }
    return lastFragment.end;
  }

  private _computeGraphemeStarts(): number[] {
    if (this.visibleEndIndex === this.startIndex) {
      return [];
    }
    const text = this.paragraph.plainText.substring(this.startIndex, this.visibleEndIndex);
    return this._breakTextIntoGraphemes(text);
  }

  graphemeStartIndexBefore(offset: number, start: number, end: number): number {
    let low = start;
    let high = end;
    console.assert(0 <= low);
    console.assert(low < high);

    const lineGraphemeBreaks = this.graphemeStarts;
    console.assert(offset >= lineGraphemeBreaks[start]);
    console.assert(offset < lineGraphemeBreaks[lineGraphemeBreaks.length - 1], `${offset}, ${lineGraphemeBreaks}`);
    console.assert(end === lineGraphemeBreaks.length || offset < lineGraphemeBreaks[end]);

    while (low + 2 <= high) {
      const mid = Math.floor((low + high) / 2);
      const diff = lineGraphemeBreaks[mid] - offset;
      if (diff > 0) {
        high = mid;
      } else if (diff < 0) {
        low = mid;
      } else {
        return mid;
      }
    }

    console.assert(lineGraphemeBreaks[low] <= offset);
    console.assert(high === lineGraphemeBreaks.length || offset < lineGraphemeBreaks[high]);
    return low;
  }

  getCharacterRangeAt(codeUnitOffset: number): URange/*TextRange*/ | null {
    console.assert(codeUnitOffset >= this.startIndex);
    if (codeUnitOffset >= this.visibleEndIndex || this.graphemeStarts.length === 0) {
      return null;
    }
    const startIndex = this.graphemeStartIndexBefore(codeUnitOffset, 0, this.graphemeStarts.length);
    console.assert(startIndex < this.graphemeStarts.length - 1);
    return {
      start: this.graphemeStarts[startIndex],
      end: this.graphemeStarts[startIndex + 1]
    };
  }

  closestFragmentTo(targetFragment: LayoutFragment, searchLeft: boolean): LayoutFragment | null {
    let closestFragment: { fragment: LayoutFragment; distance: number } | null = null;
    for (const fragment of this.fragments) {
      console.assert(!(fragment instanceof EllipsisFragment));
      if (fragment.start >= this.visibleEndIndex) {
        break;
      }
      if (fragment.graphemeStartIndexRange === null) {
        continue;
      }
      const distance = searchLeft
        ? targetFragment.left - fragment.right
        : fragment.left - targetFragment.right;
      if (distance > 0) {
        if (closestFragment === null || closestFragment.distance > distance) {
          closestFragment = { fragment, distance };
        }
      } else if (distance === 0) {
        return fragment;
      }
    }
    return closestFragment?.fragment || null;
  }

  closestFragmentAtOffset(dx: number): LayoutFragment | null {
    if (this.graphemeStarts.length === 0) {
      return null;
    }
    console.assert(this.graphemeStarts.length >= 2);
    let graphemeIndex = 0;
    let closestFragment: { fragment: LayoutFragment; distance: number } | null = null;
    for (const fragment of this.fragments) {
      console.assert(!(fragment instanceof EllipsisFragment));
      if (fragment.start >= this.visibleEndIndex) {
        break;
      }
      if (fragment.length === 0) {
        continue;
      }
      while (fragment.start > this.graphemeStarts[graphemeIndex]) {
        graphemeIndex++;
      }
      const firstGraphemeStartInFragment = this.graphemeStarts[graphemeIndex];
      if (firstGraphemeStartInFragment >= fragment.end) {
        continue;
      }
      let distance: number;
      if (dx < fragment.left) {
        distance = fragment.left - dx;
      } else if (dx > fragment.right) {
        distance = dx - fragment.right;
      } else {
        return fragment;
      }
      console.assert(distance > 0);
      if (closestFragment === null || closestFragment.distance > distance) {
        closestFragment = { fragment, distance };
      }
    }
    return closestFragment?.fragment || null;
  }

  // get hashCode(): number {
  //   return Object.hash(
  //     this.lineMetrics,
  //     this.startIndex,
  //     this.endIndex,
  //     this.trailingNewlines,
  //     this.trailingSpaces,
  //     this.spaceCount,
  //     this.widthWithTrailingSpaces,
  //     this.fragments,
  //     this.textDirection,
  //     this.displayText
  //   );
  // }

  // equals(other: any): boolean {
  //   if (this === other) {
  //     return true;
  //   }
  //   if (other.constructor.name !== this.constructor.name) {
  //     return false;
  //   }
  //   return (
  //     other instanceof ParagraphLine &&
  //     other.lineMetrics.equals(this.lineMetrics) &&
  //     other.startIndex === this.startIndex &&
  //     other.endIndex === this.endIndex &&
  //     other.trailingNewlines === this.trailingNewlines &&
  //     other.trailingSpaces === this.trailingSpaces &&
  //     other.spaceCount === this.spaceCount &&
  //     other.widthWithTrailingSpaces === this.widthWithTrailingSpaces &&
  //     other.fragments === this.fragments &&
  //     other.textDirection === this.textDirection &&
  //     other.displayText === this.displayText
  //   );
  // }

  toString(): string {
    return `${this.constructor.name}(${this.startIndex}, ${this.endIndex}, ${this.lineMetrics})`;
  }
}