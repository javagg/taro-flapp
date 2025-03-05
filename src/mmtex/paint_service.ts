// Copyright 2013 The Flutter Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

import { CanvasParagraph } from './canvas_paragraph';
import { ParagraphLine } from './layout_service';
import { LayoutFragment } from './layout_fragmenter';


 export class TextPaintService {
  constructor(public readonly paragraph: CanvasParagraph) {}

  paint(canvas: BitmapCanvas, offset: ui.Offset): void {
    // Loop through all the lines, for each line, loop through all fragments and
    // paint them. The fragment objects have enough information to be painted
    // individually.
    const lines: ParagraphLine[] = this.paragraph.lines;

    for (const line of lines) {
      for (const fragment of line.fragments) {
        this._paintBackground(canvas, offset, fragment);
        this._paintText(canvas, offset, line, fragment);
      }
    }
  }

  private _paintBackground(
    canvas: BitmapCanvas,
    offset: ui.Offset,
    fragment: LayoutFragment
  ): void {
    if (fragment.isPlaceholder) {
      return;
    }

    // Paint the background of the box, if the span has a background.
    const background: SurfacePaint | null = fragment.style.background as SurfacePaint | null;
    if (background) {
      const rect: ui.Rect = fragment.toPaintingTextBox().toRect();
      if (!rect.isEmpty) {
        canvas.drawRect(rect.shift(offset), background.paintData);
      }
    }
  }

  private _paintText(
    canvas: BitmapCanvas,
    offset: ui.Offset,
    line: ParagraphLine,
    fragment: LayoutFragment
  ): void {
    // There's no text to paint in placeholder spans.
    if (fragment.isPlaceholder) {
      return;
    }

    // Don't paint the text for space-only boxes. This is just an
    // optimization, it doesn't have any effect on the output.
    if (fragment.isSpaceOnly) {
      return;
    }

    this._prepareCanvasForFragment(canvas, fragment);
    const fragmentX: number = fragment.textDirection === ui.TextDirection.ltr
      ? fragment.left
      : fragment.right;

    const x: number = offset.dx + line.left + fragmentX;
    const y: number = offset.dy + line.baseline;

    const style: EngineTextStyle = fragment.style;

    const text: string = fragment.getText(this.paragraph);
    canvas.drawText(text, x, y, { style: style.foreground?.style, shadows: style.shadows });

    canvas.tearDownPaint();
  }

  private _prepareCanvasForFragment(
    canvas: BitmapCanvas,
    fragment: LayoutFragment
  ): void {
    const style: EngineTextStyle = fragment.style;

    let paint: SurfacePaint;
    const foreground: ui.Paint | null = style.foreground;
    if (foreground) {
      paint = foreground as SurfacePaint;
    } else {
      paint = new ui.Paint() as SurfacePaint;
      if (style.color) {
        paint.color = style.color;
      }
    }

    canvas.setCssFont(style.cssFontString, fragment.textDirection);
    canvas.setUpPaint(paint.paintData, null);
  }
}