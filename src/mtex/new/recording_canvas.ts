import { BlendMode, ClipOp, Color, Paint, Path, PointMode, Rect, RRect, Vertices } from "../canvaskit";

// Enable this to print every command applied by a canvas.
const _debugDumpPaintCommands = false;

// Returns the squared length of the x, y (of a border radius).
function _measureBorderRadius(x: number, y: number): number {
  return x * x + y * y;
}

class EngineCanvas {
  endOfPaint() {
    throw new Error("Method not implemented.");
  }
  scale(sx: number, sy: number) {
    throw new Error("Method not implemented.");
  }
  rotate(radians: number) {
    throw new Error("Method not implemented.");
  }
  transform(matrix4: Float32Array<ArrayBufferLike>) {
    throw new Error("Method not implemented.");
  }
  skew(sx: number, sy: number) {
    throw new Error("Method not implemented.");
  }
  clipRect(rect: Rect, clipOp: ClipOp) {
    throw new Error("Method not implemented.");
  }
  drawColor(color: Color, blendMode: BlendMode) {
    throw new Error("Method not implemented.");
  }
  drawLine(p1: Offset, p2: Offset, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawRect(rect: Rect, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawRRect(rrect: RRect, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawOval(rect: Rect, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawCircle(center: Offset, radius: number, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawPath(path: SurfacePath, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawImage(image: Image, offset: Offset, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawImageRect(image: Image, src: Rect, dst: Rect, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawParagraph(paragraph: CanvasParagraph, offset: Offset) {
    throw new Error("Method not implemented.");
  }
  clipRRect(rrect: RRect) {
    throw new Error("Method not implemented.");
  }
  clipPath(path: SurfacePath) {
    throw new Error("Method not implemented.");
  }
  drawShadow(path: SurfacePath, color: Color, elevation: number, transparentOccluder: boolean) {
    throw new Error("Method not implemented.");
  }
  drawVertices(vertices: SurfaceVertices, blendMode: BlendMode, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  drawPoints(pointMode: PointMode, points: Float32Array<ArrayBufferLike>, paintData: SurfacePaintData) {
    throw new Error("Method not implemented.");
  }
  translate(dx: number, dy: number) {
    throw new Error("Method not implemented.");
  }
  restore() {
    throw new Error("Method not implemented.");
  }
  save() {
    throw new Error("Method not implemented.");
  }
}

// 记录画布命令的类型定义
interface PaintCommand {
  apply(canvas: EngineCanvas): void;
}

interface DrawCommand extends PaintCommand {
  isClippedOut: boolean;
  leftBound: number;
  topBound: number;
  rightBound: number;
  bottomBound: number;
  isInvisible(clipRect: Rect): boolean;
}

// 渲染策略类
class RenderStrategy {
  hasImageElements: boolean = false;
  hasParagraphs: boolean = false; 
  hasArbitraryPaint: boolean = false;
  isInsideSvgFilterTree: boolean = false;

  merge(childStrategy: RenderStrategy): void {
    this.hasImageElements ||= childStrategy.hasImageElements;
    this.hasParagraphs ||= childStrategy.hasParagraphs;
    this.hasArbitraryPaint ||= childStrategy.hasArbitraryPaint;
  }
}

// 画布边界计算类
class _PaintBounds {
  private _left: number = Number.MAX_VALUE;
  private _top: number = Number.MAX_VALUE;
  private _right: number = -Number.MAX_VALUE;
  private _bottom: number = -Number.MAX_VALUE;
  private _didPaintInsideClipArea: boolean = false;
  
  private _transforms: Matrix4[] = [];
  private _clipStack: (Rect | null)[] = [];
  private _currentMatrixIsIdentity: boolean = true;
  private _currentMatrix: Matrix4 = Matrix4.identity();
  private _clipRectInitialized: boolean = false;
  private _currentClipLeft: number = 0;
  private _currentClipTop: number = 0;
  private _currentClipRight: number = 0;
  private _currentClipBottom: number = 0;
  _pictureBounds: any;
  _paintBounds: any;
  _recordingEnded: boolean;
  _commands: any;
  _saveCount: any;
  renderStrategy: any;

  constructor(public readonly maxPaintBounds: Rect) {}

  // RecordingCanvas 类的方法继续实现:
  
  /**
   * 停止记录绘制命令并计算绘制边界
   */
  endRecording(): void {
    this._pictureBounds = this._paintBounds.computeBounds();
    this._recordingEnded = true;
  }

  /**
   * 将记录的命令应用到画布上
   */
  apply(engineCanvas: EngineCanvas, clipRect: Rect): void {
    this.applyCommands(engineCanvas, clipRect);
    engineCanvas.endOfPaint();
  }

  /**
   * 应用记录的命令到画布
   */
  applyCommands(engineCanvas: EngineCanvas, clipRect: Rect): void {
    if (!this._recordingEnded) {
      throw new Error('Recording must be ended before applying commands');
    }

    if (_debugDumpPaintCommands) {
      this._debugDumpCommands(engineCanvas, clipRect);
      return;
    }

    try {
      if (rectContainsOther(clipRect, this._pictureBounds!)) {
        // 如果整个图片都在裁剪区域内,直接应用所有命令
        for (const command of this._commands) {
          command.apply(engineCanvas);
        }
      } else {
        // 需要检查每个绘制命令是否在裁剪区域内
        for (const command of this._commands) {
          if (command instanceof DrawCommand) {
            if (command.isInvisible(clipRect)) {
              continue;
            }
          }
          command.apply(engineCanvas);
        }
      }
    } catch (e) {
      // 命令不应该失败,但是...
      // https://bugzilla.mozilla.org/show_bug.cgi?id=941146
      if (!isNsErrorFailureException(e)) {
        throw e;
      }
    }
  }
  _debugDumpCommands(engineCanvas: EngineCanvas, clipRect: Rect) {
    throw new Error("Method not implemented.");
  }

  /**
   * 保存当前的变换和裁剪状态
   */
  save(): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this._paintBounds.saveTransformsAndClip();
    this._commands.push(new PaintSave());
    this._saveCount++;
  }

  /**
   * 保存图层状态(带画笔)
   */
  saveLayerWithoutBounds(paint: Paint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this.renderStrategy.hasArbitraryPaint = true;
    // TODO: 使用另一个画布正确实现这个功能
    this._commands.push(new PaintSave());
    this._paintBounds.saveTransformsAndClip();
    this._saveCount++;
  }

  /**
   * 保存图层状态(带边界和画笔)
   */
  saveLayer(bounds: Rect, paint: Paint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this.renderStrategy.hasArbitraryPaint = true;
    // TODO: 使用另一个画布正确实现这个功能
    this._commands.push(new PaintSave());
    this._paintBounds.saveTransformsAndClip();
    this._saveCount++;
  }

  /**
   * 保存当前的变换和裁剪状态
   */
  saveTransformsAndClip(): void {
    this._transforms.push(this._currentMatrix.clone());
    this._clipStack.push(
      this._clipRectInitialized
        ? new Rect(
            this._currentClipLeft,
            this._currentClipTop,
            this._currentClipRight,
            this._currentClipBottom
          )
        : null
    );
  }

  /**
   * 恢复之前保存的变换和裁剪状态
   */
  restoreTransformsAndClip(): void {
    this._currentMatrix = this._transforms.pop()!;
    const clipRect = this._clipStack.pop();
    if (clipRect) {
      this._currentClipLeft = clipRect.left;
      this._currentClipTop = clipRect.top;
      this._currentClipRight = clipRect.right;
      this._currentClipBottom = clipRect.bottom;
      this._clipRectInitialized = true;
    } else if (this._clipRectInitialized) {
      this._clipRectInitialized = false;
    }
  }

  /**
   * 平移变换
   */
  translate(dx: number, dy: number): void {
    if (dx !== 0 || dy !== 0) {
      this._currentMatrixIsIdentity = false;
    }
    this._currentMatrix.translate(dx, dy);
  }

  /**
   * 缩放变换
   */
  scale(sx: number, sy: number): void {
    if (sx !== 1.0 || sy !== 1.0) {
      this._currentMatrixIsIdentity = false;
    }
    this._currentMatrix.scale(sx, sy, 1.0);
  }

  /**
   * Z轴旋转变换
   */
  rotateZ(radians: number): void {
    if (radians !== 0.0) {
      this._currentMatrixIsIdentity = false;
    }
    this._currentMatrix.rotateZ(radians);
  }

  /**
   * 矩阵变换
   */
  transform(matrix4: Float32Array): void {
    const m4 = Matrix4.fromFloat32List(matrix4);
    this._currentMatrix.multiply(m4);
    this._currentMatrixIsIdentity = this._currentMatrix.isIdentity();
  }

  /**
   * 倾斜变换
   */
  skew(sx: number, sy: number): void {
    this._currentMatrixIsIdentity = false;
    const skewMatrix = Matrix4.identity();
    const storage = skewMatrix.storage;
    storage[1] = sy;
    storage[4] = sx;
    this._currentMatrix.multiply(skewMatrix);
  }

  /**
   * 矩形裁剪
   */
  clipRect(rect: Rect, command: DrawCommand): void {
    let left = rect.left;
    let top = rect.top;
    let right = rect.right;
    let bottom = rect.bottom;

    // 如果有活动的变换,计算屏幕相对的裁剪矩形并与当前裁剪矩形求交
    if (!this._currentMatrixIsIdentity) {
      const points = new Float32Array([left, top, right, bottom]);
      this.transformLTRB(this._currentMatrix, points);
      left = points[0];
      top = points[1];
      right = points[2];
      bottom = points[3];
    }

    if (!this._clipRectInitialized) {
      this._currentClipLeft = left;
      this._currentClipTop = top;
      this._currentClipRight = right;
      this._currentClipBottom = bottom;
      this._clipRectInitialized = true;
    } else {
      this._currentClipLeft = Math.max(this._currentClipLeft, left);
      this._currentClipTop = Math.max(this._currentClipTop, top);
      this._currentClipRight = Math.min(this._currentClipRight, right);
      this._currentClipBottom = Math.min(this._currentClipBottom, bottom);
    }

    if (this._currentClipLeft >= this._currentClipRight ||
        this._currentClipTop >= this._currentClipBottom) {
      command.isClippedOut = true;
    } else {
      command.leftBound = this._currentClipLeft;
      command.topBound = this._currentClipTop;
      command.rightBound = this._currentClipRight;
      command.bottomBound = this._currentClipBottom;
    }
  }

  /**
   * 获取目标裁剪边界
   */
  getDestinationClipBounds(): Rect | null {
    if (!this._clipRectInitialized) {
      return null;
    }
    return new Rect(
      this._currentClipLeft,
      this._currentClipTop,
      this._currentClipRight,
      this._currentClipBottom
    );
  }

  /**
   * 扩展绘制边界以包含给定矩形
   */
  grow(rect: Rect, command: DrawCommand): void {
    this.growLTRB(
      rect.left,
      rect.top,
      rect.right,
      rect.bottom,
      command
    );
  }

  /**
   * 扩展绘制边界以包含给定的左上右下坐标
   */
  growLTRB(
    left: number,
    top: number,
    right: number,
    bottom: number,
    command: DrawCommand
  ): void {
    if (left === right || top === bottom) {
      command.isClippedOut = true;
      return;
    }

    let transformedLeft = left;
    let transformedTop = top;
    let transformedRight = right;
    let transformedBottom = bottom;

    if (!this._currentMatrixIsIdentity) {
      const points = new Float32Array([left, top, right, bottom]);
      this.transformLTRB(this._currentMatrix, points);
      transformedLeft = points[0];
      transformedTop = points[1];
      transformedRight = points[2];
      transformedBottom = points[3];
    }

    if (this._clipRectInitialized) {
      if (transformedLeft >= this._currentClipRight ||
          transformedRight <= this._currentClipLeft ||
          transformedTop >= this._currentClipBottom ||
          transformedBottom <= this._currentClipTop) {
        command.isClippedOut = true;
        return;
      }

      transformedLeft = Math.max(transformedLeft, this._currentClipLeft);
      transformedRight = Math.min(transformedRight, this._currentClipRight);
      transformedTop = Math.max(transformedTop, this._currentClipTop);
      transformedBottom = Math.min(transformedBottom, this._currentClipBottom);
    }

    command.leftBound = transformedLeft;
    command.topBound = transformedTop;
    command.rightBound = transformedRight;
    command.bottomBound = transformedBottom;

    if (this._didPaintInsideClipArea) {
      this._left = Math.min(
        Math.min(this._left, transformedLeft),
        transformedRight
      );
      this._right = Math.max(
        Math.max(this._right, transformedLeft),
        transformedRight
      );
      this._top = Math.min(
        Math.min(this._top, transformedTop),
        transformedBottom
      );
      this._bottom = Math.max(
        Math.max(this._bottom, transformedTop),
        transformedBottom
      );
    } else {
      this._left = Math.min(transformedLeft, transformedRight);
      this._right = Math.max(transformedLeft, transformedRight);
      this._top = Math.min(transformedTop, transformedBottom);
      this._bottom = Math.max(transformedTop, transformedBottom);
    }
    this._didPaintInsideClipArea = true;
  }

  /**
   * 计算绘制边界
   */
  computeBounds(): Rect {
    if (!this._didPaintInsideClipArea) {
      return Rect.zero;
    }

    // 框架可能在尝试反转无限大小的矩形时发送我们 NaN
    const maxLeft = isNaN(this.maxPaintBounds.left)
      ? Number.NEGATIVE_INFINITY
      : this.maxPaintBounds.left;
    const maxRight = isNaN(this.maxPaintBounds.right)
      ? Number.POSITIVE_INFINITY
      : this.maxPaintBounds.right;
    const maxTop = isNaN(this.maxPaintBounds.top)
      ? Number.NEGATIVE_INFINITY
      : this.maxPaintBounds.top;
    const maxBottom = isNaN(this.maxPaintBounds.bottom)
      ? Number.POSITIVE_INFINITY
      : this.maxPaintBounds.bottom;

    const left = Math.min(this._left, this._right);
    const right = Math.max(this._left, this._right);
    const top = Math.min(this._top, this._bottom);
    const bottom = Math.max(this._top, this._bottom);

    if (right < maxLeft || bottom < maxTop) {
      // 计算的边界和最大边界不相交
      return Rect.zero;
    }

    return new Rect(
      Math.max(left, maxLeft),
      Math.max(top, maxTop),
      Math.min(right, maxRight),
      Math.min(bottom, maxBottom)
    );
  }

  /**
   * 变换左上右下坐标
   */
  private transformLTRB(matrix: Matrix4, points: Float32Array): void {
    const m0 = matrix.storage[0];
    const m1 = matrix.storage[1];
    const m4 = matrix.storage[4];
    const m5 = matrix.storage[5];
    const m12 = matrix.storage[12];
    const m13 = matrix.storage[13];

    const x1 = points[0];
    const y1 = points[1];
    const x2 = points[2];
    const y2 = points[3];

    points[0] = m0 * x1 + m4 * y1 + m12;
    points[1] = m1 * x1 + m5 * y1 + m13;
    points[2] = m0 * x2 + m4 * y2 + m12;
    points[3] = m1 * x2 + m5 * y2 + m13;
  }
}

// 首先定义一些具体的 PaintCommand 实现类
class PaintSave implements PaintCommand {
  apply(canvas: EngineCanvas): void {
    canvas.save();
  }
}

class PaintRestore implements PaintCommand {
  apply(canvas: EngineCanvas): void {
    canvas.restore();
  }
}

class PaintTranslate implements PaintCommand {
  constructor(private dx: number, private dy: number) {}

  apply(canvas: EngineCanvas): void {
    canvas.translate(this.dx, this.dy);
  }
}

// 变换相关的命令类
class PaintScale implements PaintCommand {
  constructor(private sx: number, private sy: number) {}

  apply(canvas: EngineCanvas): void {
    canvas.scale(this.sx, this.sy);
  }
}

class PaintRotate implements PaintCommand {
  constructor(private radians: number) {}

  apply(canvas: EngineCanvas): void {
    canvas.rotate(this.radians);
  }
}

class PaintTransform implements PaintCommand {
  constructor(private matrix4: Float32Array) {}

  apply(canvas: EngineCanvas): void {
    canvas.transform(this.matrix4);
  }
}

class PaintSkew implements PaintCommand {
  constructor(private sx: number, private sy: number) {}

  apply(canvas: EngineCanvas): void {
    canvas.skew(this.sx, this.sy);
  }
}

// 裁剪相关的命令类
class PaintClipRect implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private rect: Rect, private clipOp: ClipOp) {}

  apply(canvas: EngineCanvas): void {
    canvas.clipRect(this.rect, this.clipOp);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

// 绘制相关的命令类
class PaintDrawColor implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private color: Color, private blendMode: BlendMode) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawColor(this.color, this.blendMode);
  }

  isInvisible(clipRect: Rect): boolean {
    return this.isClippedOut;
  }
}

class PaintDrawLine implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(
    private p1: Offset,
    private p2: Offset,
    private paintData: SurfacePaintData
  ) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawLine(this.p1, this.p2, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintDrawRect implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private rect: Rect, private paintData: SurfacePaintData) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawRect(this.rect, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintDrawRRect implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private rrect: RRect, private paintData: SurfacePaintData) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawRRect(this.rrect, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

// 补充缺失的绘制命令类
class PaintDrawOval implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private rect: Rect, private paintData: SurfacePaintData) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawOval(this.rect, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintDrawCircle implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(
    private center: Offset,
    private radius: number,
    private paintData: SurfacePaintData
  ) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawCircle(this.center, this.radius, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintDrawPath implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private path: Path, private paintData: SurfacePaintData) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawPath(this.path, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintDrawImage implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(
    private image: Image,
    private offset: Offset,
    private paintData: SurfacePaintData
  ) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawImage(this.image, this.offset, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintDrawImageRect implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(
    private image: Image,
    private src: Rect,
    private dst: Rect,
    private paintData: SurfacePaintData
  ) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawImageRect(this.image, this.src, this.dst, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintDrawParagraph implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private paragraph: CanvasParagraph, private offset: Offset) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawParagraph(this.paragraph, this.offset);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

// 补充工具函数
function _getPaintSpread(paint: Paint): number {
  let spread = 0.0;
  const maskFilter = paint.maskFilter;
  if (maskFilter) {
    // 乘以2是因为sigma是标准差而不是模糊的长度
    // 参见: https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur
    spread += maskFilter.webOnlySigma * 2.0;
  }
  if (paint.strokeWidth !== 0) {
    // 乘以sqrt(2)是为了考虑90度角相交的线段接头
    // 除以2是因为只有一半的笔画从原始形状中突出
    // 另一半在形状内部
    const sqrtOfTwoDivByTwo = 0.70710678118;
    spread += paint.strokeWidth * sqrtOfTwoDivByTwo;
  }
  return spread;
}

// 补充裁剪命令类
class PaintClipRRect implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private rrect: RRect) {}

  apply(canvas: EngineCanvas): void {
    canvas.clipRRect(this.rrect);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

class PaintClipPath implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(private path: Path) {}

  apply(canvas: EngineCanvas): void {
    canvas.clipPath(this.path);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

// 阴影绘制命令类
class PaintDrawShadow implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(
    private path: Path,
    private color: Color,
    private elevation: number,
    private transparentOccluder: boolean
  ) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawShadow(this.path, this.color, this.elevation, this.transparentOccluder);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

// 顶点绘制命令类
class PaintDrawVertices implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(
    private vertices: SurfaceVertices,
    private blendMode: BlendMode,
    private paintData: SurfacePaintData
  ) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawVertices(this.vertices, this.blendMode, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

// 点集合绘制命令类
class PaintDrawPoints implements DrawCommand {
  isClippedOut: boolean = false;
  leftBound: number = 0;
  topBound: number = 0;
  rightBound: number = 0;
  bottomBound: number = 0;

  constructor(
    private pointMode: PointMode,
    private points: Float32Array,
    private paintData: SurfacePaintData
  ) {}

  apply(canvas: EngineCanvas): void {
    canvas.drawPoints(this.pointMode, this.points, this.paintData);
  }

  isInvisible(clipRect: Rect): boolean {
    if (this.isClippedOut) return true;
    return this.rightBound < clipRect.left ||
           this.leftBound > clipRect.right ||
           this.bottomBound < clipRect.top ||
           this.topBound > clipRect.bottom;
  }
}

// 添加一些辅助函数

/**
 * 检查一个矩形是否完全包含另一个矩形
 */
function rectContainsOther(rect: Rect, other: Rect | null): boolean {
  if (!other) return false;
  return rect.left <= other.left &&
         rect.top <= other.top &&
         rect.right >= other.right &&
         rect.bottom >= other.bottom;
}

/**
 * 检查是否是 Mozilla 的 NS_ERROR_FAILURE 异常
 */
function isNsErrorFailureException(e: any): boolean {
  return e.name === 'NS_ERROR_FAILURE';
}

/**
 * 计算阴影边界
 */
function computePenumbraBounds(rect: Rect, elevation: number): Rect {
  // 阴影的模糊半径和偏移量与高度成正比
  const ambientRadius = elevation * 0.039;
  const spotRadius = elevation * 0.25;
  const spotOffset = elevation * 0.5;

  return new Rect(
    rect.left - spotRadius,
    rect.top - spotRadius - spotOffset,
    rect.right + spotRadius,
    rect.bottom + spotRadius + ambientRadius
  );
}

// 继续 RecordingCanvas 类的实现:

export class RecordingCanvas {
  private _paintBounds: _PaintBounds;
  private _pictureBounds: Rect | null = null;
  private _commands: PaintCommand[] = [];
  private _didDraw: boolean = false;
  private _recordingEnded: boolean = false;
  private _saveCount: number = 1;
  
  readonly renderStrategy: RenderStrategy = new RenderStrategy();

  constructor(bounds: Rect | null) {
    this._paintBounds = new _PaintBounds(bounds || Rect.largest);
  }

  // 获取画布边界
  get pictureBounds(): Rect | null {
    if (!this._recordingEnded) {
      throw new Error('Picture bounds not available yet. Call [endRecording] before accessing picture bounds.');
    }
    return this._pictureBounds;
  }

  // Debug 用的命令列表
  get debugPaintCommands(): PaintCommand[] {
    if (process.env.NODE_ENV !== 'production') {
      return this._commands;
    }
    throw new Error('For debugging only.');
  }

  /**
   * 恢复之前保存的状态
   */
  restore(): void {
    if (!this._recordingEnded && this._saveCount > 1) {
      this._paintBounds.restoreTransformsAndClip();
    }
    if (this._commands.length > 0 && this._commands[this._commands.length - 1] instanceof PaintSave) {
      // 如果最后一个命令是save,说明save和restore之间没有任何绘制操作
      // 可以直接移除save命令来优化
      this._commands.pop();
    } else {
      this._commands.push(new PaintRestore());
    }
    this._saveCount--;
  }

  /**
   * 恢复到指定的保存计数
   */
  restoreToCount(count: number): void {
    while (count < this._saveCount && this._saveCount > 1) {
      this.restore();
    }
  }

  /**
   * 平移变换
   */
  translate(dx: number, dy: number): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this._paintBounds.translate(dx, dy);
    this._commands.push(new PaintTranslate(dx, dy));
  }

  /**
   * 缩放变换
   */
  scale(sx: number, sy: number): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this._paintBounds.scale(sx, sy);
    this._commands.push(new PaintScale(sx, sy));
  }

  /**
   * 旋转变换
   */
  rotate(radians: number): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this._paintBounds.rotateZ(radians);
    this._commands.push(new PaintRotate(radians));
  }

  /**
   * 矩阵变换
   */
  transform(matrix4: Float32Array): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this._paintBounds.transform(matrix4);
    this._commands.push(new PaintTransform(matrix4));
  }

  /**
   * 获取当前变换矩阵
   */
  getCurrentMatrixUnsafe(): Float32Array {
    return this._paintBounds._currentMatrix.storage;
  }

  /**
   * 倾斜变换
   */
  skew(sx: number, sy: number): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this.renderStrategy.hasArbitraryPaint = true;
    this._paintBounds.skew(sx, sy);
    this._commands.push(new PaintSkew(sx, sy));
  }

  /**
   * 矩形裁剪
   */
  clipRect(rect: Rect, clipOp: ClipOp): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    const command = new PaintClipRect(rect, clipOp);
    switch (clipOp) {
      case ClipOp.intersect:
        this._paintBounds.clipRect(rect, command);
        break;
      case ClipOp.difference:
        // 由于这是反向裁剪,无法缩小绘制边界
        break;
    }
    this.renderStrategy.hasArbitraryPaint = true;
    this._commands.push(command);
  }

  /**
   * 圆角矩形裁剪
   */
  clipRRect(roundedRect: RRect): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    const command = new PaintClipRRect(roundedRect);
    this._paintBounds.clipRect(roundedRect.outerRect, command);
    this.renderStrategy.hasArbitraryPaint = true;
    this._commands.push(command);
  }

  /**
   * 路径裁剪
   */
  clipPath(path: Path, doAntiAlias: boolean = true): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    const command = new PaintClipPath(path as SurfacePath);
    this._paintBounds.clipRect(path.getBounds(), command);
    this.renderStrategy.hasArbitraryPaint = true;
    this._commands.push(command);
  }

  /**
   * 获取目标裁剪边界
   */
  getDestinationClipBounds(): Rect | null {
    return this._paintBounds.getDestinationClipBounds();
  }

  /**
   * 绘制颜色
   */
  drawColor(color: Color, blendMode: BlendMode): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    const command = new PaintDrawColor(color, blendMode);
    this._commands.push(command);
    this._paintBounds.grow(this._paintBounds.maxPaintBounds, command);
  }

  /**
   * 绘制线段
   */
  drawLine(p1: Offset, p2: Offset, paint: SurfacePaint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    if (paint.shader && paint.shader instanceof EngineImageShader) {
      throw new Error('ImageShader not supported yet');
    }

    const paintSpread = Math.max(_getPaintSpread(paint), 1.0);
    const command = new PaintDrawLine(p1, p2, paint.paintData);

    this._paintBounds.growLTRB(
      Math.min(p1.dx, p2.dx) - paintSpread,
      Math.min(p1.dy, p2.dy) - paintSpread,
      Math.max(p1.dx, p2.dx) + paintSpread,
      Math.max(p1.dy, p2.dy) + paintSpread,
      command
    );

    this.renderStrategy.hasArbitraryPaint = true;
    this._didDraw = true;
    this._commands.push(command);
  }

  /**
   * 绘制矩形
   */
  drawRect(rect: Rect, paint: SurfacePaint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    if (paint.shader) {
      this.renderStrategy.hasArbitraryPaint = true;
    }
    this._didDraw = true;
    const paintSpread = _getPaintSpread(paint);
    const command = new PaintDrawRect(rect, paint.paintData);
    
    if (paintSpread !== 0) {
      this._paintBounds.grow(rect.inflate(paintSpread), command);
    } else {
      this._paintBounds.grow(rect, command);
    }
    this._commands.push(command);
  }

  /**
   * 绘制圆角矩形
   */
  drawRRect(rrect: RRect, paint: SurfacePaint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    if (paint.shader || !rrect.webOnlyUniformRadii) {
      this.renderStrategy.hasArbitraryPaint = true;
    }
    this._didDraw = true;
    const paintSpread = _getPaintSpread(paint);
    const command = new PaintDrawRRect(rrect, paint.paintData);
    
    const left = Math.min(rrect.left, rrect.right) - paintSpread;
    const top = Math.min(rrect.top, rrect.bottom) - paintSpread;
    const right = Math.max(rrect.left, rrect.right) + paintSpread;
    const bottom = Math.max(rrect.top, rrect.bottom) + paintSpread;
    
    this._paintBounds.growLTRB(left, top, right, bottom, command);
    this._commands.push(command);
  }

  /**
   * 绘制椭圆
   */
  drawOval(rect: Rect, paint: Paint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this.renderStrategy.hasArbitraryPaint = true;
    this._didDraw = true;
    const paintSpread = _getPaintSpread(paint);
    const command = new PaintDrawOval(rect, paint.paintData);
    
    if (paintSpread !== 0) {
      this._paintBounds.grow(rect.inflate(paintSpread), command);
    } else {
      this._paintBounds.grow(rect, command);
    }
    this._commands.push(command);
  }

  /**
   * 绘制圆形
   */
  drawCircle(c: Offset, radius: number, paint: Paint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    this.renderStrategy.hasArbitraryPaint = true;
    this._didDraw = true;
    const paintSpread = _getPaintSpread(paint);
    const command = new PaintDrawCircle(c, radius, paint.paintData);
    
    const distance = radius + paintSpread;
    this._paintBounds.growLTRB(
      c.dx - distance,
      c.dy - distance,
      c.dx + distance,
      c.dy + distance,
      command
    );
    this._commands.push(command);
  }

  /**
   * 绘制路径
   */
  drawPath(path: Path, paint: Paint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }

    if (!paint.shader) {
      // 对于矩形/圆角矩形路径,使用专门的绘制方法以优化性能
      const sPath = path as SurfacePath;
      const rect = sPath.toRect();
      if (rect) {
        this.drawRect(rect, paint);
        return;
      }
      const rrect = sPath.toRoundedRect();
      if (rrect) {
        this.drawRRect(rrect, paint);
        return;
      }
      // 对于零宽度的直线路径使用drawRect
      const line = sPath.toStraightLine();
      if (line && paint.strokeWidth === 0) {
        const left = Math.min(line.left, line.right);
        const top = Math.min(line.top, line.bottom);
        const width = Math.abs(line.width);
        const height = Math.abs(line.height);
        const inflatedHeight = line.height === 0 ? 1 : height;
        const inflatedWidth = line.width === 0 ? 1 : width;
        const inflatedSize = new Size(inflatedWidth, inflatedHeight);
        paint.style = PaintingStyle.fill;
        this.drawRect(new Rect(left, top, inflatedSize.width, inflatedSize.height), paint);
        return;
      }
    }

    const sPath = path as SurfacePath;
    if (!sPath.pathRef.isEmpty) {
      this.renderStrategy.hasArbitraryPaint = true;
      this._didDraw = true;
      let pathBounds = sPath.getBounds();
      const paintSpread = _getPaintSpread(paint);
      if (paintSpread !== 0) {
        pathBounds = pathBounds.inflate(paintSpread);
      }
      // 克隆路径以便后续绘制可以重用
      const clone = SurfacePath.shallowCopy(path);
      const command = new PaintDrawPath(clone as SurfacePath, paint.paintData);
      this._paintBounds.grow(pathBounds, command);
      clone.fillType = sPath.fillType;
      this._commands.push(command);
    }
  }

  /**
   * 绘制图片
   */
  drawImage(image: Image, offset: Offset, paint: Paint): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    if (paint.shader && paint.shader instanceof EngineImageShader) {
      throw new Error('ImageShader not supported yet');
    }

    this.renderStrategy.hasArbitraryPaint = true;
    this.renderStrategy.hasImageElements = true;
    this._didDraw = true;

    const left = offset.dx;
    const top = offset.dy;
    const command = new PaintDrawImage(image, offset, paint.paintData);

    this._paintBounds.growLTRB(
      left,
      top,
      left + image.width,
      top + image.height,
      command
    );
    this._commands.push(command);
  }

  /**
   * 绘制图片区域
   */
  drawImageRect(
    image: Image,
    src: Rect,
    dst: Rect,
    paint: Paint
  ): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }
    if (paint.shader && paint.shader instanceof EngineImageShader) {
      throw new Error('ImageShader not supported yet');
    }

    this.renderStrategy.hasArbitraryPaint = true;
    this.renderStrategy.hasImageElements = true;
    this._didDraw = true;

    const command = new PaintDrawImageRect(image, src, dst, paint.paintData);
    this._paintBounds.grow(dst, command);
    this._commands.push(command);
  }

  /**
   * 绘制段落
   */
  drawParagraph(paragraph: Paragraph, offset: Offset): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }

    const engineParagraph = paragraph as CanvasParagraph;
    if (!engineParagraph.isLaidOut) {
      // 忽略未布局的段落,这与 Flutter 的行为一致
      return;
    }

    this._didDraw = true;
    if (engineParagraph.hasArbitraryPaint) {
      this.renderStrategy.hasArbitraryPaint = true;
    }
    this.renderStrategy.hasParagraphs = true;

    const command = new PaintDrawParagraph(engineParagraph, offset);
    const paragraphBounds = engineParagraph.paintBounds;

    this._paintBounds.growLTRB(
      offset.dx + paragraphBounds.left,
      offset.dy + paragraphBounds.top,
      offset.dx + paragraphBounds.right,
      offset.dy + paragraphBounds.bottom,
      command
    );

    this._commands.push(command);
  }

  /**
   * 绘制阴影
   */
  drawShadow(
    path: Path,
    color: Color,
    elevation: number,
    transparentOccluder: boolean
  ): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }

    this.renderStrategy.hasArbitraryPaint = true;
    this._didDraw = true;

    const shadowRect = computePenumbraBounds(path.getBounds(), elevation);
    const command = new PaintDrawShadow(
      path as Path,
      color,
      elevation,
      transparentOccluder
    );

    this._paintBounds.grow(shadowRect, command);
    this._commands.push(command);
  }

  /**
   * 绘制顶点
   */
  drawVertices(
    vertices: Vertices,
    blendMode: BlendMode,
    paint: Paint
  ): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }

    this.renderStrategy.hasArbitraryPaint = true;
    this._didDraw = true;

    const command = new PaintDrawVertices(vertices, blendMode, paint.paintData);
    this._growPaintBoundsByPoints(vertices.positions, 0, paint, command);
    this._commands.push(command);
  }

  /**
   * 绘制原始点
   */
  drawRawPoints(
    pointMode: PointMode,
    points: Float32Array,
    paint: Paint
  ): void {
    if (this._recordingEnded) {
      throw new Error('Recording has ended');
    }

    this.renderStrategy.hasArbitraryPaint = true;
    this._didDraw = true;

    const command = new PaintDrawPoints(pointMode, points, paint.paintData);
    this._growPaintBoundsByPoints(points, paint.strokeWidth, paint, command);
    this._commands.push(command);
  }

  /**
   * 根据点集合扩展绘制边界
   */
  private _growPaintBoundsByPoints(
    points: Float32Array,
    thickness: number,
    paint: Paint,
    command: DrawCommand
  ): void {
    let minValueX = points[0];
    let maxValueX = points[0];
    let minValueY = points[1];
    let maxValueY = points[1];

    const len = points.length;
    for (let i = 2; i < len; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      if (isNaN(x) || isNaN(y)) {
        // 遵循 skia 实现,如果遇到 NaN 就设置边界为空并中止
        return;
      }
      minValueX = Math.min(minValueX, x);
      maxValueX = Math.max(maxValueX, x);
      minValueY = Math.min(minValueY, y);
      maxValueY = Math.max(maxValueY, y);
    }

    const distance = thickness / 2.0;
    const paintSpread = _getPaintSpread(paint);

    this._paintBounds.growLTRB(
      minValueX - distance - paintSpread,
      minValueY - distance - paintSpread,
      maxValueX + distance + paintSpread,
      maxValueY + distance + paintSpread,
      command
    );
  }

  /**
   * 打印记录的命令到控制台
   */
  debugDumpCommands(): void {
    console.log('/' + '='.repeat(40) + ' CANVAS COMMANDS ' + '='.repeat(40) + '/');
    this._commands.forEach(command => console.log(command));
    console.log('/' + '='.repeat(37) + ' END OF CANVAS COMMANDS ' + '='.repeat(36) + '/');
  }
}