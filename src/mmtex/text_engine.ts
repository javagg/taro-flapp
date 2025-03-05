// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// Common types and interfaces
export interface DomCanvasRenderingContext2D extends CanvasRenderingContext2D {
  direction: string;
  letterSpacing: string;
  wordSpacing: string;
  setLineDash(segments: number[]): void;
}

export interface DomElement extends HTMLElement {
  style: CSSStyleDeclaration;
}

export interface DomHTMLElement extends HTMLElement {
  style: CSSStyleDeclaration;
}

export namespace DomIntl {
  export interface SegmentIterator {
    next(): IteratorResult<{
      index: number;
      breakType: LineBreakType;
    }>;
  }

  export interface Segmenter {
    segment(text: string): SegmentIterator;
  }

  export class Segmenter {
    constructor(locales: string[], options: { granularity: string });
  }
}

// UI Types
export interface Offset {
  dx: number;
  dy: number;
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export class Color {
  static fromARGB(a: number, r: number, g: number, b: number): Color {
    return new Color((a << 24) | (r << 16) | (g << 8) | b);
  }

  constructor(readonly value: number) {}

  toCssString(): string {
    const a = ((this.value >> 24) & 0xFF) / 255;
    const r = (this.value >> 16) & 0xFF;
    const g = (this.value >> 8) & 0xFF;
    const b = this.value & 0xFF;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
}

export enum TextDirection {
  rtl = 'rtl',
  ltr = 'ltr',
}

export enum FontWeight {
  w100 = 100,
  w200 = 200,
  w300 = 300,
  w400 = 400,
  w500 = 500,
  w600 = 600,
  w700 = 700,
  w800 = 800,
  w900 = 900,
  normal = w400,
  bold = w700,
}

export enum FontStyle {
  normal = 'normal',
  italic = 'italic',
}

// Font extensions
declare global {
  interface FontWeight {
    toCssString(): string;
  }

  interface FontStyle {
    toCssString(): string;
  }
}

FontWeight.prototype.toCssString = function(this: FontWeight): string {
  return this.toString();
};

FontStyle.prototype.toCssString = function(this: FontStyle): string {
  return this.toString();
};

// DOM types
declare global {
  interface Document {
    fonts: FontFaceSet;
  }

  interface FontFaceSet {
    add(font: FontFace): void;
  }
}

// Platform types
export interface EnginePlatformDispatcher {
  readonly instance: {
    implicitView: {
      dom: {
        renderingHost: HTMLElement;
      };
    } | null;
  };
}

export function registerHotRestartListener(listener: () => void): void {
  // Implementation depends on the platform
}

// Font Collection
export interface FontAsset {
  family: string;
  urls: string[];
}

export class FontCollection {
  private readonly _loadedFonts = new Map<string, Promise<void>>();
  private readonly _fallbackFonts = new Map<string, string[]>();

  registerFontAsset(asset: FontAsset): Promise<void> {
    const family = asset.family;
    
    if (this._loadedFonts.has(family)) {
      return this._loadedFonts.get(family)!;
    }

    const fontFaces = asset.urls.map(url => new FontFace(family, `url(${url})`));
    const loadPromise = Promise.all(fontFaces.map(face => face.load()))
      .then(loadedFaces => {
        loadedFaces.forEach(face => document.fonts.add(face));
      })
      .catch(error => {
        console.error(`Failed to load font family "${family}":`, error);
      });

    this._loadedFonts.set(family, loadPromise);
    return loadPromise;
  }

  registerFallbackFonts(family: string, fallbacks: string[]): void {
    this._fallbackFonts.set(family, fallbacks);
  }

  getEffectiveFontString(family: string): string {
    const fallbacks = this._fallbackFonts.get(family) ?? [];
    const allFamilies = [family, ...fallbacks];
    return allFamilies.map(f => f.includes(' ') ? `"${f}"` : f).join(', ');
  }

  async ensureFontLoaded(family: string): Promise<void> {
    const loadPromise = this._loadedFonts.get(family);
    if (loadPromise) {
      await loadPromise;
    }
  }

  isFontFamilyAvailable(family: string, context: DomCanvasRenderingContext2D): boolean {
    const oldFont = context.font;
    context.font = `10px "${family}"`;
    const newFont = context.font;
    context.font = oldFont;
    return newFont.includes(family);
  }

  clear(): void {
    this._loadedFonts.clear();
    this._fallbackFonts.clear();
  }
}

export const fontCollection = new FontCollection();

// Text Measurement
export interface MeasureOptions {
  letterSpacing?: number;
  wordSpacing?: number;
}

export interface RulerMetrics {
  height: number;
  baseline: number;
}

export class RulerHost {
  private readonly _rulerHost: DomElement;

  constructor() {
    this._rulerHost = createDomElement('flt-ruler-host');
    this._rulerHost.style.cssText = 
      'position: fixed;' +
      'visibility: hidden;' +
      'overflow: hidden;' +
      'top: 0;' +
      'left: 0;' +
      'width: 0;' +
      'height: 0;';

    const renderingHost = EnginePlatformDispatcher.instance.implicitView!.dom.renderingHost;
    renderingHost.appendChild(this._rulerHost);
    registerHotRestartListener(() => this.dispose());
  }

  dispose(): void {
    this._rulerHost.remove();
  }

  addElement(element: DomHTMLElement): void {
    this._rulerHost.append(element);
  }
}

export function measureSubstring(
  context: DomCanvasRenderingContext2D,
  text: string,
  start: number,
  end: number,
  options: MeasureOptions = {},
): number {
  const substring = text.slice(start, end);
  
  if (substring.length === 0) {
    return 0;
  }

  if (options.letterSpacing) {
    return _measureWithLetterSpacing(context, substring, options.letterSpacing);
  }

  if (options.wordSpacing) {
    return _measureWithWordSpacing(context, substring, options.wordSpacing);
  }

  return context.measureText(substring).width;
}

function _measureWithLetterSpacing(
  context: DomCanvasRenderingContext2D,
  text: string,
  letterSpacing: number,
): number {
  let width = context.measureText(text).width;
  width += letterSpacing * (text.length - 1);
  return width;
}

function _measureWithWordSpacing(
  context: DomCanvasRenderingContext2D,
  text: string,
  wordSpacing: number,
): number {
  let width = context.measureText(text).width;
  const spaceCount = text.split(' ').length - 1;
  width += wordSpacing * spaceCount;
  return width;
}

export function measureMetrics(
  context: DomCanvasRenderingContext2D,
  text: string,
): RulerMetrics {
  const metrics = context.measureText(text);
  return {
    height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
    baseline: metrics.actualBoundingBoxAscent,
  };
}

// Text Fragmenting
export interface TextFragment {
  text: string;
  start: number;
  end: number;
  type: LineBreakType;
}

export enum LineBreakType {
  opportunity,
  prohibited,
  mandatory,
  endOfText,
}

export class TextFragmenter {
  private readonly _text: string;
  private readonly _iterator: DomIntl.SegmentIterator;
  private _currentPosition = 0;

  constructor(text: string) {
    this._text = text;
    this._iterator = new DomIntl.Segmenter([], { granularity: 'line' })
      .segment(text);
  }

  nextFragment(): TextFragment | null {
    const segment = this._iterator.next();
    if (segment.done) {
      if (this._currentPosition < this._text.length) {
        const fragment = {
          text: this._text.substring(this._currentPosition),
          start: this._currentPosition,
          end: this._text.length,
          type: LineBreakType.endOfText,
        };
        this._currentPosition = this._text.length;
        return fragment;
      }
      return null;
    }

    const { index, breakType } = segment.value;
    const fragment = {
      text: this._text.substring(this._currentPosition, index),
      start: this._currentPosition,
      end: index,
      type: breakType,
    };
    this._currentPosition = index;
    return fragment;
  }
}

export function fragmentText(text: string): TextFragment[] {
  const fragments: TextFragment[] = [];
  const fragmenter = new TextFragmenter(text);

  while (true) {
    const fragment = fragmenter.nextFragment();
    if (!fragment) break;
    fragments.push(fragment);
  }

  return fragments;
}

// Measurement Cache
export class MeasurementCache {
  private readonly _cache = new Map<string, number>();

  measureText(
    context: DomCanvasRenderingContext2D,
    text: string,
    options: MeasureOptions = {},
  ): number {
    const key = this._getCacheKey(text, context.font, options);
    
    let width = this._cache.get(key);
    if (width === undefined) {
      width = measureSubstring(context, text, 0, text.length, options);
      this._cache.set(key, width);
    }
    
    return width;
  }

  clear(): void {
    this._cache.clear();
  }

  private _getCacheKey(
    text: string,
    font: string,
    options: MeasureOptions,
  ): string {
    return `${text}|${font}|${options.letterSpacing ?? 0}|${options.wordSpacing ?? 0}`;
  }
}

export const measurementCache = new MeasurementCache();

// Paragraph Styles and Spans
export interface ParagraphStyle {
  textAlign?: TextAlign;
  textDirection?: TextDirection;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  maxLines?: number | null;
  letterSpacing?: number;
  wordSpacing?: number;
  height?: number | null;
  leadingDistribution?: TextLeadingDistribution;
  fontFeatures?: FontFeature[] | null;
  fontVariations?: FontVariation[] | null;
  background?: Paint | null;
  foreground?: Paint | null;
}

export interface SpanStyle {
  color?: number;
  decoration?: TextDecoration;
  decorationColor?: number;
  decorationStyle?: TextDecorationStyle;
  decorationThickness?: number;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  textBaseline?: TextBaseline;
  fontFamily?: string;
  fontSize?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  height?: number;
  locale?: string;
  background?: Paint;
  foreground?: Paint;
  shadows?: Shadow[];
  fontFeatures?: FontFeature[];
  fontVariations?: FontVariation[];
}

export enum TextLeadingDistribution {
  even,
  proportional,
}

export enum TextDecoration {
  none = 0,
  underline = 1,
  overline = 2,
  lineThrough = 4,
}

export enum TextDecorationStyle {
  solid,
  double,
  dotted,
  dashed,
  wavy,
}

export enum TextBaseline {
  alphabetic,
  ideographic,
}

export interface FontFeature {
  feature: string;
  value: number;
}

export interface FontVariation {
  axis: string;
  value: number;
}

export interface Shadow {
  color: Color;
  offset: Offset;
  blurRadius: number;
}

// Layout Service
export interface ParagraphConstraints {
  width: number;
}

export class LayoutService {
  private readonly _paragraph: CanvasParagraph;
  private readonly _lines: ParagraphLine[] = [];
  private _width = 0;
  private _height = 0;
  private _minIntrinsicWidth = 0;
  private _maxIntrinsicWidth = 0;
  private _alphabeticBaseline = 0;
  private _ideographicBaseline = 0;
  private _didExceedMaxLines = false;

  constructor(paragraph: CanvasParagraph) {
    this._paragraph = paragraph;
  }

  get lines(): ParagraphLine[] {
    return this._lines;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get minIntrinsicWidth(): number {
    return this._minIntrinsicWidth;
  }

  get maxIntrinsicWidth(): number {
    return this._maxIntrinsicWidth;
  }

  get alphabeticBaseline(): number {
    return this._alphabeticBaseline;
  }

  get ideographicBaseline(): number {
    return this._ideographicBaseline;
  }

  get didExceedMaxLines(): boolean {
    return this._didExceedMaxLines;
  }

  performLayout(constraints: ParagraphConstraints): void {
    this._lines.length = 0;
    this._width = constraints.width;

    // Break text into lines
    const lineBreaker = new LineBreaker(this._paragraph.plainText);
    let currentLine = new ParagraphLine();
    let y = 0;

    while (true) {
      const breakpoint = lineBreaker.nextBreak();
      if (!breakpoint) break;

      // Add fragments to line until break
      while (currentLine.width < constraints.width) {
        const fragment = this._getNextFragment();
        if (!fragment) break;
        currentLine.addFragment(fragment);
      }

      // Position line
      currentLine.layout(y);
      this._lines.push(currentLine);
      y += currentLine.height;

      // Create new line
      currentLine = new ParagraphLine();
    }

    this._height = y;
    this._computeMetrics();
  }

  private _computeMetrics(): void {
    // Compute min/max intrinsic widths
    this._minIntrinsicWidth = Math.min(...this._lines.map(l => l.minIntrinsicWidth));
    this._maxIntrinsicWidth = Math.max(...this._lines.map(l => l.width));

    // Compute baselines
    if (this._lines.length > 0) {
      const firstLine = this._lines[0];
      this._alphabeticBaseline = firstLine.baseline;
      this._ideographicBaseline = firstLine.baseline + (firstLine.height * 0.2);
    }
  }

  private _getNextFragment(): TextFragment | null {
    // Implementation depends on fragmenter
    return null;
  }
}

// Paragraph Line Implementation
export class ParagraphLine {
  private readonly _fragments: LayoutFragment[] = [];
  private _width = 0;
  private _height = 0;
  private _baseline = 0;
  private _left = 0;
  private _y = 0;
  private _minIntrinsicWidth = 0;

  get fragments(): LayoutFragment[] {
    return this._fragments;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get baseline(): number {
    return this._baseline;
  }

  get left(): number {
    return this._left;
  }

  get minIntrinsicWidth(): number {
    return this._minIntrinsicWidth;
  }

  addFragment(fragment: LayoutFragment): void {
    this._fragments.push(fragment);
    this._width += fragment.width;
    this._height = Math.max(this._height, fragment.height);
    this._baseline = Math.max(this._baseline, fragment.baseline);
    this._minIntrinsicWidth = Math.max(this._minIntrinsicWidth, fragment.width);
  }

  layout(y: number): void {
    this._y = y;
    let x = this._left;

    for (const fragment of this._fragments) {
      fragment.position(x, y + this._baseline - fragment.baseline);
      x += fragment.width;
    }
  }
}

// Paint Service Implementation
export class PaintService {
  constructor(private readonly paragraph: CanvasParagraph) {}

  paint(canvas: BitmapCanvas, offset: Offset): void {
    if (this.paragraph.plainText.length === 0) {
      return;
    }

    for (const line of this.paragraph.lines) {
      this._paintLine(canvas, line, offset);
    }
  }

  private _paintLine(canvas: BitmapCanvas, line: ParagraphLine, offset: Offset): void {
    for (const fragment of line.fragments) {
      const span = fragment.span;
      const style = span.style;
      const x = offset.dx + fragment.x;
      const y = offset.dy + fragment.y;

      canvas.setUpPaint(() => {
        // Apply text style
        canvas.font = style.cssFontString;
        canvas.direction = line.textDirection;

        // Apply color
        if (style.foreground) {
          canvas.fillStyle = style.foreground;
        } else if (style.color !== undefined) {
          canvas.fillStyle = Color.fromARGB(
            (style.color >> 24) & 0xFF,
            (style.color >> 16) & 0xFF,
            (style.color >> 8) & 0xFF,
            style.color & 0xFF,
          ).toCssString();
        }

        // Draw text
        canvas.fillText(
          this.paragraph.plainText.slice(fragment.start, fragment.end),
          x,
          y,
        );

        // Draw decorations
        if (style.decoration) {
          this._paintDecoration(
            canvas,
            x,
            y,
            fragment.width,
            style.decoration,
            style.decorationColor ?? style.color,
            style.decorationStyle,
            style.decorationThickness,
          );
        }

        // Draw shadows
        if (style.shadows?.length) {
          this._paintShadows(canvas, x, y, fragment.width, style.shadows);
        }
      });
    }
  }

  private _paintDecoration(
    canvas: BitmapCanvas,
    x: number,
    y: number,
    width: number,
    decoration: TextDecoration,
    color: number | undefined,
    style: TextDecorationStyle | undefined,
    thickness: number | undefined,
  ): void {
    if (!color) return;

    canvas.setUpPaint(() => {
      canvas.strokeStyle = Color.fromARGB(
        (color >> 24) & 0xFF,
        (color >> 16) & 0xFF,
        (color >> 8) & 0xFF,
        color & 0xFF,
      ).toCssString();

      canvas.lineWidth = thickness ?? 1;

      switch (style) {
        case TextDecorationStyle.dashed:
          canvas.setLineDash([3, 3]);
          break;
        case TextDecorationStyle.dotted:
          canvas.setLineDash([1, 2]);
          break;
        case TextDecorationStyle.double:
          this._paintDoubleLine(canvas, x, y, width);
          return;
        case TextDecorationStyle.wavy:
          this._paintWavyLine(canvas, x, y, width);
          return;
      }

      canvas.beginPath();
      canvas.moveTo(x, y);
      canvas.lineTo(x + width, y);
      canvas.stroke();
    });
  }

  private _paintDoubleLine(
    canvas: BitmapCanvas,
    x: number,
    y: number,
    width: number,
  ): void {
    const gap = Math.max(canvas.lineWidth, 2);
    
    canvas.beginPath();
    canvas.moveTo(x, y - gap);
    canvas.lineTo(x + width, y - gap);
    canvas.moveTo(x, y + gap);
    canvas.lineTo(x + width, y + gap);
    canvas.stroke();
  }

  private _paintWavyLine(
    canvas: BitmapCanvas,
    x: number,
    y: number,
    width: number,
  ): void {
    const waveHeight = 2;
    const waveLength = 6;
    let dx = 0;

    canvas.beginPath();
    canvas.moveTo(x, y);

    while (dx < width) {
      canvas.quadraticCurveTo(
        x + dx + waveLength / 2, y + waveHeight,
        x + dx + waveLength, y,
      );
      dx += waveLength;
    }

    canvas.stroke();
  }

  private _paintShadows(
    canvas: BitmapCanvas,
    x: number,
    y: number,
    width: number,
    shadows: Shadow[],
  ): void {
    for (const shadow of shadows) {
      canvas.setUpPaint(() => {
        canvas.shadowColor = shadow.color.toCssString();
        canvas.shadowBlur = shadow.blurRadius;
        canvas.shadowOffsetX = shadow.offset.dx;
        canvas.shadowOffsetY = shadow.offset.dy;
        
        canvas.fillText(
          this.paragraph.plainText,
          x,
          y,
        );
      });
    }
  }
}

// Layout Fragment Implementation
export class LayoutFragment {
  private _x = 0;
  private _y = 0;
  private _width = 0;
  private _height = 0;
  private _baseline = 0;

  constructor(
    readonly span: ParagraphSpan,
    readonly start: number,
    readonly end: number,
  ) {}

  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get width(): number { return this._width; }
  get height(): number { return this._height; }
  get baseline(): number { return this._baseline; }

  position(x: number, y: number): void {
    this._x = x;
    this._y = y;
  }

  measure(layoutService: TextLayoutService): void {
    // Update the text context with the current span's style
    layoutService.updateTextContext(this.span);

    // Measure the fragment's width
    this._width = layoutService.measureText(
      this.text,
      this.start,
      this.end,
    );

    // Get height and baseline from the ruler
    const metrics = layoutService.getRulerMetrics(this.span);
    this._height = metrics.height;
    this._baseline = metrics.baseline;
  }
}

// Canvas Paragraph Implementation
export class CanvasParagraph {
  private readonly _layoutService: TextLayoutService;
  private readonly _paintService: PaintService;

  constructor(
    readonly plainText: string,
    readonly paragraphStyle: ParagraphStyle,
    readonly spans: ParagraphSpan[],
  ) {
    this._layoutService = new TextLayoutService(this);
    this._paintService = new PaintService(this);
  }

  get width(): number {
    return this._layoutService.width;
  }

  get height(): number {
    return this._layoutService.height;
  }

  get minIntrinsicWidth(): number {
    return this._layoutService.minIntrinsicWidth;
  }

  get maxIntrinsicWidth(): number {
    return this._layoutService.maxIntrinsicWidth;
  }

  get alphabeticBaseline(): number {
    return this._layoutService.alphabeticBaseline;
  }

  get ideographicBaseline(): number {
    return this._layoutService.ideographicBaseline;
  }

  get didExceedMaxLines(): boolean {
    return this._layoutService.didExceedMaxLines;
  }

  get lines(): ParagraphLine[] {
    return this._layoutService.lines;
  }

  layout(constraints: ParagraphConstraints): void {
    this._layoutService.performLayout(constraints);
  }

  paint(canvas: BitmapCanvas, offset: Offset): void {
    this._paintService.paint(canvas, offset);
  }

  getPositionForOffset(offset: Offset): TextPosition {
    return this._layoutService.getPositionForOffset(offset);
  }

  getBoxesForRange(
    start: number,
    end: number,
    boxHeightStyle: BoxHeightStyle = BoxHeightStyle.tight,
    boxWidthStyle: BoxWidthStyle = BoxWidthStyle.tight,
  ): TextBox[] {
    return this._layoutService.getBoxesForRange(start, end, boxHeightStyle, boxWidthStyle);
  }

  getClosestGlyphInfo(offset: Offset): GlyphInfo | null {
    return this._layoutService.getClosestGlyphInfo(offset);
  }
}

// Unicode Range Processing
export interface UnicodeRange {
  start: number;
  end: number;
}

export class UnicodeRangeProcessor {
  private readonly _ranges: UnicodeRange[] = [];

  addRange(start: number, end: number): void {
    this._ranges.push({ start, end });
  }

  containsCharacter(char: string): boolean {
    const code = char.codePointAt(0);
    if (code === undefined) return false;

    return this._ranges.some(range => 
      code >= range.start && code <= range.end
    );
  }

  clear(): void {
    this._ranges.length = 0;
  }
}

// Text Layout Service
export class TextLayoutService {
  private readonly _context: DomCanvasRenderingContext2D;
  private readonly _ruler: RulerHost;

  constructor() {
    this._context = createDomCanvasElement().getContext('2d') as DomCanvasRenderingContext2D;
    this._ruler = new RulerHost();
  }

  updateTextContext(span: ParagraphSpan): void {
    const style = span.style;
    this._context.font = style.cssFontString;
    this._context.direction = style.textDirection ?? TextDirection.ltr;
    if (style.letterSpacing) {
      this._context.letterSpacing = `${style.letterSpacing}px`;
    }
    if (style.wordSpacing) {
      this._context.wordSpacing = `${style.wordSpacing}px`;
    }
  }

  measureText(text: string, start: number, end: number): number {
    return measureSubstring(this._context, text, start, end);
  }

  getRulerMetrics(span: ParagraphSpan): RulerMetrics {
    return measureMetrics(this._context, 'x');
  }

  dispose(): void {
    this._ruler.dispose();
  }
}

// Helper function to create DOM elements
function createDomElement(tagName: string): DomElement {
  return document.createElement(tagName);
}

function createDomCanvasElement(): HTMLCanvasElement {
  return document.createElement('canvas');
}

// ... continue with paragraph and layout code ... 