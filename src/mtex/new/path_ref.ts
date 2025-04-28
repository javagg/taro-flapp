/**
 * Stores the path verbs, points and conic weights.
 * 
 * This is a TypeScript port of Flutter's PathRef class.
 * For reference Flutter Gallery average points array size is 5.9, max 25
 * we start with kInitialPointsCapacity 10 to reduce allocations during growth.
 */
export class PathRef {
  // Constants
  private static readonly kInitialPointsCapacity = 8;
  private static readonly kInitialVerbsCapacity = 8;
  private static readonly kMinSize = 256;

  // 添加路径操作类型常量
  private static readonly MOVE = 0;
  private static readonly LINE = 1;
  private static readonly QUAD = 2;
  private static readonly CONIC = 3;
  private static readonly CUBIC = 4;
  private static readonly CLOSE = 5;
  private static readonly DONE = 6;

  // 添加线段掩码常量
  private static readonly LINE_SEGMENT_MASK = 0x01;
  private static readonly QUAD_SEGMENT_MASK = 0x02;
  private static readonly CONIC_SEGMENT_MASK = 0x04;
  private static readonly CUBIC_SEGMENT_MASK = 0x08;

  // Instance fields
  private fPoints: Float32Array;
  private _fVerbs: Uint8Array;
  private _fPointsCapacity: number = 0;
  private _fPointsLength: number = 0;
  private _fVerbsCapacity: number = 0;
  private _fVerbsLength: number = 0;
  private _conicWeightsCapacity: number = 0;
  private _conicWeights: Float32Array | null = null;
  private _conicWeightsLength: number = 0;

  // Bounds related fields
  public fBounds: Rect | null = null;
  public cachedBounds: Rect | null = null;
  public fBoundsIsDirty: boolean = true;
  public fIsFinite: boolean = true;

  // Shape type flags
  public fIsOval: boolean = false;
  public fIsRRect: boolean = false;
  public fIsRect: boolean = false;
  public fRRectOrOvalIsCCW: boolean = false;
  public fRRectOrOvalStartIdx: number = -1;
  public fSegmentMask: number = 0;

  constructor() {
    this.fPoints = new Float32Array(PathRef.kInitialPointsCapacity * 2);
    this._fVerbs = new Uint8Array(PathRef.kInitialVerbsCapacity);
    this._fPointsCapacity = PathRef.kInitialPointsCapacity;
    this._fVerbsCapacity = PathRef.kInitialVerbsCapacity;
    this._resetFields();
  }

  /**
   * Creates a copy of the path by pointing new path to a current
   * points,verbs and weights arrays. If original path is mutated by adding
   * more verbs, this copy only returns path at the time of copy and shares
   * typed arrays of original path.
   */
  static shallowCopy(ref: PathRef): PathRef {
    const newRef = new PathRef();
    newRef.fPoints = ref.fPoints;
    newRef._fVerbs = ref._fVerbs;
    
    newRef._fVerbsCapacity = ref._fVerbsCapacity;
    newRef._fVerbsLength = ref._fVerbsLength;

    newRef._fPointsCapacity = ref._fPointsCapacity;
    newRef._fPointsLength = ref._fPointsLength;

    newRef._conicWeightsCapacity = ref._conicWeightsCapacity;
    newRef._conicWeightsLength = ref._conicWeightsLength;
    newRef._conicWeights = ref._conicWeights;
    
    newRef.fBoundsIsDirty = ref.fBoundsIsDirty;
    if (!newRef.fBoundsIsDirty) {
      newRef.fBounds = ref.fBounds;
      newRef.cachedBounds = ref.cachedBounds;
      newRef.fIsFinite = ref.fIsFinite;
    }

    newRef.fSegmentMask = ref.fSegmentMask;
    newRef.fIsOval = ref.fIsOval;
    newRef.fIsRRect = ref.fIsRRect;
    newRef.fIsRect = ref.fIsRect;
    newRef.fRRectOrOvalIsCCW = ref.fRRectOrOvalIsCCW;
    newRef.fRRectOrOvalStartIdx = ref.fRRectOrOvalStartIdx;
    
    newRef.debugValidate();
    return newRef;
  }

  private _resetFields(): void {
    this.fBoundsIsDirty = true; // this also invalidates fIsFinite
    this.fSegmentMask = 0;
    this.fIsOval = false;
    this.fIsRRect = false;
    this.fIsRect = false;
    // The next two values don't matter unless fIsOval or fIsRRect are true
    this.fRRectOrOvalIsCCW = false;
    this.fRRectOrOvalStartIdx = 0xAC;
    this.debugValidate();
  }

  /**
   * 克隆路径引用
   */
  clone(): PathRef {
    const copy = new PathRef();
    copy.fPoints = this.fPoints.slice();
    copy._fVerbs = this._fVerbs.slice();
    copy._fPointsCapacity = this._fPointsCapacity;
    copy._fPointsLength = this._fPointsLength;
    copy._fVerbsCapacity = this._fVerbsCapacity;
    copy._fVerbsLength = this._fVerbsLength;
    copy._conicWeightsCapacity = this._conicWeightsCapacity;
    copy._conicWeightsLength = this._conicWeightsLength;
    copy._conicWeights = this._conicWeights ? this._conicWeights.slice() : null;
    copy.fBoundsIsDirty = this.fBoundsIsDirty;
    copy.fSegmentMask = this.fSegmentMask;
    copy.fIsOval = this.fIsOval;
    copy.fIsRRect = this.fIsRRect;
    copy.fIsRect = this.fIsRect;
    copy.fRRectOrOvalIsCCW = this.fRRectOrOvalIsCCW;
    copy.fRRectOrOvalStartIdx = this.fRRectOrOvalStartIdx;
    copy.fBounds = this.fBounds;
    copy.cachedBounds = this.cachedBounds;
    copy.fIsFinite = this.fIsFinite;
    copy.debugValidate();
    return copy;
  }

  /**
   * 重置路径
   */
  reset(): void {
    this._resetFields();
    this._fPointsLength = 0;
    this._fVerbsLength = 0;
    this._conicWeightsLength = 0;
    this.fBounds = null;
    this.cachedBounds = null;
  }

  /**
   * 移动到指定点
   */
  moveTo(x: number, y: number): void {
    this._ensureVerbsCapacity(1);
    this._fVerbs[this._fVerbsLength++] = PathRef.MOVE;
    this._ensurePointsCapacity(2);
    this.fPoints[this._fPointsLength++] = x;
    this.fPoints[this._fPointsLength++] = y;
    this.fBoundsIsDirty = true;
  }

  /**
   * 画线到指定点
   */
  lineTo(x: number, y: number): void {
    this._ensureVerbsCapacity(1);
    this._fVerbs[this._fVerbsLength++] = PathRef.LINE;
    this._ensurePointsCapacity(2);
    this.fPoints[this._fPointsLength++] = x;
    this.fPoints[this._fPointsLength++] = y;
    this.fBoundsIsDirty = true;
  }

  /**
   * 二次贝塞尔曲线
   */
  quadraticBezierTo(x1: number, y1: number, x2: number, y2: number): void {
    this._ensureVerbsCapacity(1);
    this._fVerbs[this._fVerbsLength++] = PathRef.QUAD;
    this._ensurePointsCapacity(4);
    this.fPoints[this._fPointsLength++] = x1;
    this.fPoints[this._fPointsLength++] = y1;
    this.fPoints[this._fPointsLength++] = x2;
    this.fPoints[this._fPointsLength++] = y2;
    this.fBoundsIsDirty = true;
  }

  /**
   * 三次贝塞尔曲线
   */
  cubicTo(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): void {
    this._ensureVerbsCapacity(1);
    this._fVerbs[this._fVerbsLength++] = PathRef.CUBIC;
    this._ensurePointsCapacity(6);
    this.fPoints[this._fPointsLength++] = x1;
    this.fPoints[this._fPointsLength++] = y1;
    this.fPoints[this._fPointsLength++] = x2;
    this.fPoints[this._fPointsLength++] = y2;
    this.fPoints[this._fPointsLength++] = x3;
    this.fPoints[this._fPointsLength++] = y3;
    this.fBoundsIsDirty = true;
  }

  /**
   * 闭合路径
   */
  close(): void {
    if (this._fVerbsLength > 0) {
      this._ensureVerbsCapacity(1);
      this._fVerbs[this._fVerbsLength++] = PathRef.CLOSE;
    }
  }

  /**
   * 添加矩形
   */
  addRect(rect: Rect): void {
    this.moveTo(rect.left, rect.top);
    this.lineTo(rect.right, rect.top);
    this.lineTo(rect.right, rect.bottom);
    this.lineTo(rect.left, rect.bottom);
    this.close();
  }

  /**
   * 添加圆角矩形
   */
  addRRect(rrect: RRect): void {
    const rx = rrect.tlRadiusX;
    const ry = rrect.tlRadiusY;
    
    if (rx === 0 || ry === 0) {
      this.addRect(rrect.outerRect);
      return;
    }

    // 计算控制点
    const cpx = rx * 0.5522847498307936;
    const cpy = ry * 0.5522847498307936;

    this.moveTo(rrect.left + rx, rrect.top);
    
    // 上边
    this.lineTo(rrect.right - rx, rrect.top);
    this.cubicTo(
      rrect.right - rx + cpx, rrect.top,
      rrect.right, rrect.top + ry - cpy,
      rrect.right, rrect.top + ry
    );

    // 右边
    this.lineTo(rrect.right, rrect.bottom - ry);
    this.cubicTo(
      rrect.right, rrect.bottom - ry + cpy,
      rrect.right - rx + cpx, rrect.bottom,
      rrect.right - rx, rrect.bottom
    );

    // 下边
    this.lineTo(rrect.left + rx, rrect.bottom);
    this.cubicTo(
      rrect.left + rx - cpx, rrect.bottom,
      rrect.left, rrect.bottom - ry + cpy,
      rrect.left, rrect.bottom - ry
    );

    // 左边
    this.lineTo(rrect.left, rrect.top + ry);
    this.cubicTo(
      rrect.left, rrect.top + ry - cpy,
      rrect.left + rx - cpx, rrect.top,
      rrect.left + rx, rrect.top
    );

    this.close();
  }

  /**
   * 添加椭圆
   */
  addOval(oval: Rect): void {
    const rx = oval.width / 2;
    const ry = oval.height / 2;
    const cx = oval.left + rx;
    const cy = oval.top + ry;

    // 计算控制点
    const cpx = rx * 0.5522847498307936;
    const cpy = ry * 0.5522847498307936;

    this.moveTo(cx + rx, cy);
    this.cubicTo(
      cx + rx, cy + cpy,
      cx + cpx, cy + ry,
      cx, cy + ry
    );
    this.cubicTo(
      cx - cpx, cy + ry,
      cx - rx, cy + cpy,
      cx - rx, cy
    );
    this.cubicTo(
      cx - rx, cy - cpy,
      cx - cpx, cy - ry,
      cx, cy - ry
    );
    this.cubicTo(
      cx + cpx, cy - ry,
      cx + rx, cy - cpy,
      cx + rx, cy
    );
    this.close();
  }

  /**
   * 添加圆弧
   */
  arcTo(
    rect: Rect,
    startAngle: number,
    sweepAngle: number,
    forceMoveTo: boolean
  ): void {
    // 实现圆弧绘制...
    // 这里需要复杂的圆弧计算,暂时省略
  }

  /**
   * 添加椭圆弧
   */
  arcToPoint(
    arcEnd: Offset,
    radius: Radius,
    rotation: number,
    largeArc: boolean,
    clockwise: boolean
  ): void {
    // 实现椭圆弧绘制...
    // 这里需要复杂的椭圆弧计算,暂时省略
  }

  /**
   * 添加路径
   */
  addPath(
    path: PathRef,
    dx: number,
    dy: number,
    matrix4?: Float32Array
  ): void {
    const transform = matrix4 ? Matrix4.fromFloat32List(matrix4) : null;
    
    for (let i = 0; i < path._fVerbsLength; i++) {
      const verb = path._fVerbs[i];
      switch (verb) {
        case PathRef.MOVE: {
          const x = path.fPoints[i * 2] + dx;
          const y = path.fPoints[i * 2 + 1] + dy;
          if (transform) {
            const point = transform.transform2(new Offset(x, y));
            this.moveTo(point.dx, point.dy);
          } else {
            this.moveTo(x, y);
          }
          break;
        }

        case PathRef.LINE: {
          const x = path.fPoints[i * 2] + dx;
          const y = path.fPoints[i * 2 + 1] + dy;
          if (transform) {
            const point = transform.transform2(new Offset(x, y));
            this.lineTo(point.dx, point.dy);
          } else {
            this.lineTo(x, y);
          }
          break;
        }

        case PathRef.QUAD: {
          const x1 = path.fPoints[i * 2] + dx;
          const y1 = path.fPoints[i * 2 + 1] + dy;
          const x2 = path.fPoints[i * 2 + 2] + dx;
          const y2 = path.fPoints[i * 2 + 3] + dy;
          if (transform) {
            const p1 = transform.transform2(new Offset(x1, y1));
            const p2 = transform.transform2(new Offset(x2, y2));
            this.quadraticBezierTo(p1.dx, p1.dy, p2.dx, p2.dy);
          } else {
            this.quadraticBezierTo(x1, y1, x2, y2);
          }
          break;
        }

        case PathRef.CUBIC: {
          const x1 = path.fPoints[i * 2] + dx;
          const y1 = path.fPoints[i * 2 + 1] + dy;
          const x2 = path.fPoints[i * 2 + 2] + dx;
          const y2 = path.fPoints[i * 2 + 3] + dy;
          const x3 = path.fPoints[i * 2 + 4] + dx;
          const y3 = path.fPoints[i * 2 + 5] + dy;
          if (transform) {
            const p1 = transform.transform2(new Offset(x1, y1));
            const p2 = transform.transform2(new Offset(x2, y2));
            const p3 = transform.transform2(new Offset(x3, y3));
            this.cubicTo(p1.dx, p1.dy, p2.dx, p2.dy, p3.dx, p3.dy);
          } else {
            this.cubicTo(x1, y1, x2, y2, x3, y3);
          }
          break;
        }

        case PathRef.CLOSE:
          this.close();
          break;
      }
    }
  }

  /**
   * 变换路径
   */
  transform(matrix4: Float32Array): PathRef {
    const transform = Matrix4.fromFloat32List(matrix4);
    const result = new PathRef();
    
    for (let i = 0; i < this._fVerbsLength; i++) {
      const verb = this._fVerbs[i];
      switch (verb) {
        case PathRef.MOVE: {
          const point = transform.transform2(
            new Offset(this.fPoints[i * 2], this.fPoints[i * 2 + 1])
          );
          result.moveTo(point.dx, point.dy);
          break;
        }

        case PathRef.LINE: {
          const point = transform.transform2(
            new Offset(this.fPoints[i * 2], this.fPoints[i * 2 + 1])
          );
          result.lineTo(point.dx, point.dy);
          break;
        }

        case PathRef.QUAD: {
          const p1 = transform.transform2(
            new Offset(this.fPoints[i * 2], this.fPoints[i * 2 + 1])
          );
          const p2 = transform.transform2(
            new Offset(this.fPoints[i * 2 + 2], this.fPoints[i * 2 + 3])
          );
          result.quadraticBezierTo(p1.dx, p1.dy, p2.dx, p2.dy);
          break;
        }

        case PathRef.CUBIC: {
          const p1 = transform.transform2(
            new Offset(this.fPoints[i * 2], this.fPoints[i * 2 + 1])
          );
          const p2 = transform.transform2(
            new Offset(this.fPoints[i * 2 + 2], this.fPoints[i * 2 + 3])
          );
          const p3 = transform.transform2(
            new Offset(this.fPoints[i * 2 + 4], this.fPoints[i * 2 + 5])
          );
          result.cubicTo(p1.dx, p1.dy, p2.dx, p2.dy, p3.dx, p3.dy);
          break;
        }

        case PathRef.CLOSE:
          result.close();
          break;
      }
    }

    return result;
  }

  /**
   * 获取路径边界
   */
  getBounds(): Rect {
    if (this.fBoundsIsDirty) {
      this._calculateBounds();
    }
    return this.fBounds!;
  }

  /**
   * 判断路径是否为空
   */
  get isEmpty(): boolean {
    return this._fVerbsLength === 0;
  }

  private _calculateBounds(): void {
    if (this._fVerbsLength === 0) {
      this.fBounds = Rect.zero;
      this.cachedBounds = Rect.zero;
      this.fIsFinite = true;
      return;
    }

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < this._fPointsLength; i += 2) {
      const x = this.fPoints[i];
      const y = this.fPoints[i + 1];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    this.fBounds = new Rect(minX, minY, maxX - minX, maxY - minY);
    this.cachedBounds = this.fBounds;
    this.fIsFinite = true;
  }

  private _ensureVerbsCapacity(additionalVerbs: number): void {
    if (this._fVerbsLength + additionalVerbs > this._fVerbsCapacity) {
      const newCapacity = Math.max(this._fVerbsCapacity * 2, this._fVerbsLength + additionalVerbs);
      const newVerbs = new Uint8Array(newCapacity);
      newVerbs.set(this._fVerbs);
      this._fVerbs = newVerbs;
      this._fVerbsCapacity = newCapacity;
    }
  }

  private _ensurePointsCapacity(additionalPoints: number): void {
    if (this._fPointsLength + additionalPoints > this._fPointsCapacity) {
      const newCapacity = Math.max(this._fPointsCapacity * 2, this._fPointsLength + additionalPoints);
      const newPoints = new Float32Array(newCapacity * 2);
      newPoints.set(this.fPoints);
      this.fPoints = newPoints;
      this._fPointsCapacity = newCapacity;
    }
  }

  private _ensureConicWeightsCapacity(additionalWeights: number): void {
    if (this._conicWeightsLength + additionalWeights > this._conicWeightsCapacity) {
      const newCapacity = Math.max(this._conicWeightsCapacity * 2, this._conicWeightsLength + additionalWeights);
      const newWeights = new Float32Array(newCapacity);
      newWeights.set(this._conicWeights!);
      this._conicWeights = newWeights;
      this._conicWeightsCapacity = newCapacity;
    }
  }

  private debugValidate(): void {
    // Implementation of debugValidate method
  }

  /**
   * 返回点索引处的x,y坐标
   */
  setPoint(pointIndex: number, x: number, y: number): void {
    const index = pointIndex * 2;
    this.fPoints[index] = x;
    this.fPoints[index + 1] = y;
  }

  get points(): Float32Array {
    return this.fPoints;
  }

  get conicWeights(): Float32Array | null {
    return this._conicWeights;
  }

  countPoints(): number {
    return this._fPointsLength;
  }

  countVerbs(): number {
    return this._fVerbsLength;
  }

  countWeights(): number {
    return this._conicWeightsLength;
  }

  atVerb(index: number): number {
    return this._fVerbs[index];
  }

  atPoint(index: number): Offset {
    return new Offset(
      this.fPoints[index * 2],
      this.fPoints[index * 2 + 1]
    );
  }

  pointXAt(index: number): number {
    return this.fPoints[index * 2];
  }

  pointYAt(index: number): number {
    return this.fPoints[index * 2 + 1];
  }

  atWeight(index: number): number {
    return this._conicWeights![index];
  }

  get isFinite(): boolean {
    if (this.fBoundsIsDirty) {
      this._computeBounds();
    }
    return this.fIsFinite;
  }

  get segmentMasks(): number {
    return this.fSegmentMask;
  }

  get isOval(): number {
    return this.fIsOval ? this.fRRectOrOvalStartIdx : -1;
  }

  get isOvalCCW(): boolean {
    return this.fRRectOrOvalIsCCW;
  }

  get isRRect(): number {
    return this.fIsRRect ? this.fRRectOrOvalStartIdx : -1;
  }

  get isRect(): number {
    return this.fIsRect ? this.fRRectOrOvalStartIdx : -1;
  }

  getRRect(): RRect | null {
    return this.fIsRRect ? this._getRRect() : null;
  }

  getRect(): Rect | null {
    if (this.fIsRect) {
      return new Rect(
        this.atPoint(0).dx,
        this.atPoint(0).dy,
        this.atPoint(1).dx,
        this.atPoint(2).dy
      );
    } else {
      return this._fVerbsLength === 4 ? this._detectRect() : null;
    }
  }

  get isRectCCW(): boolean {
    return this.fRRectOrOvalIsCCW;
  }

  get hasComputedBounds(): boolean {
    return !this.fBoundsIsDirty;
  }

  private _detectRect(): Rect | null {
    if (this._fVerbs[0] !== PathRef.MOVE) {
      return null;
    }

    const x0 = this.atPoint(0).dx;
    const y0 = this.atPoint(0).dy;
    const x1 = this.atPoint(1).dx;
    const y1 = this.atPoint(1).dy;

    if (this._fVerbs[1] !== PathRef.LINE || y1 !== y0) {
      return null;
    }

    const width = x1 - x0;
    const x2 = this.atPoint(2).dx;
    const y2 = this.atPoint(2).dy;

    if (this._fVerbs[2] !== PathRef.LINE || x2 !== x1) {
      return null;
    }

    const height = y2 - y1;
    const x3 = this.atPoint(3).dx;
    const y3 = this.atPoint(3).dy;

    if (this._fVerbs[3] !== PathRef.LINE || y3 !== y2) {
      return null;
    }

    if ((x2 - x3) !== width || (y3 - y0) !== height) {
      return null;
    }

    const x = Math.min(x0, x1);
    const y = Math.min(y0, y2);
    return new Rect(x, y, Math.abs(width), Math.abs(height));
  }

  private _getRRect(): RRect {
    const bounds = this.getBounds();
    const radii: Radius[] = [];
    const iter = new PathRefIterator(this);
    const pts = new Float32Array(PathRefIterator.kMaxBufferSize);
    
    let verb = iter.next(pts);
    let cornerIndex = 0;

    while ((verb = iter.next(pts)) !== PathRef.DONE) {
      if (verb === PathRef.CONIC) {
        const controlPx = pts[2];
        const controlPy = pts[3];
        const vector1_0x = controlPx - pts[0];
        const vector1_0y = controlPy - pts[1];
        const vector2_1x = pts[4] - pts[2];
        const vector2_1y = pts[5] - pts[3];
        
        let dx: number, dy: number;
        if (vector1_0x !== 0.0) {
          dx = Math.abs(vector1_0x);
          dy = Math.abs(vector2_1y);
        } else if (vector1_0y !== 0.0) {
          dx = Math.abs(vector2_1x);
          dy = Math.abs(vector1_0y);
        } else {
          dx = Math.abs(vector1_0x);
          dy = Math.abs(vector1_0y);
        }

        radii.push(new Radius(dx, dy));
        ++cornerIndex;
      }
    }

    return new RRect(
      bounds,
      radii[0],
      radii[1],
      radii[2],
      radii[3]
    );
  }

  equals(ref: PathRef): boolean {
    if (this.fSegmentMask !== ref.fSegmentMask) {
      return false;
    }

    const pointCount = this.countPoints();
    if (pointCount !== ref.countPoints()) {
      return false;
    }

    const len = pointCount * 2;
    for (let i = 0; i < len; i++) {
      if (this.fPoints[i] !== ref.fPoints[i]) {
        return false;
      }
    }

    if (this._conicWeights === null) {
      if (ref._conicWeights !== null) {
        return false;
      }
    } else {
      if (ref._conicWeights === null) {
        return false;
      }
      const weightCount = this._conicWeights.length;
      if (ref._conicWeights.length !== weightCount) {
        return false;
      }
      for (let i = 0; i < weightCount; i++) {
        if (this._conicWeights[i] !== ref._conicWeights[i]) {
          return false;
        }
      }
    }

    const verbCount = this.countVerbs();
    if (verbCount !== ref.countVerbs()) {
      return false;
    }

    for (let i = 0; i < verbCount; i++) {
      if (this._fVerbs[i] !== ref._fVerbs[i]) {
        return false;
      }
    }

    return true;
  }

  computeSegmentMask(): number {
    let mask = 0;
    const verbCount = this.countVerbs();
    
    for (let i = 0; i < verbCount; ++i) {
      switch (this._fVerbs[i]) {
        case PathRef.LINE:
          mask |= PathRef.LINE_SEGMENT_MASK;
          break;
        case PathRef.QUAD:
          mask |= PathRef.QUAD_SEGMENT_MASK;
          break;
        case PathRef.CONIC:
          mask |= PathRef.CONIC_SEGMENT_MASK;
          break;
        case PathRef.CUBIC:
          mask |= PathRef.CUBIC_SEGMENT_MASK;
          break;
      }
    }
    return mask;
  }

  static interpolate(ending: PathRef, weight: number, out: PathRef): void {
    const count = out.countPoints() * 2;
    const outValues = out.points;
    const inValues = ending.points;
    
    for (let index = 0; index < count; ++index) {
      outValues[index] = outValues[index] * weight + inValues[index] * (1.0 - weight);
    }
    
    out.fBoundsIsDirty = true;
    out.startEdit();
  }

  private _computeBounds(): void {
    const pointCount = this.countPoints();
    this.fBoundsIsDirty = false;
    this.cachedBounds = null;
    let accum = 0;

    if (pointCount === 0) {
      this.fBounds = Rect.zero;
      this.fIsFinite = true;
      return;
    }

    let minX = this.fPoints[0];
    let maxX = minX;
    accum *= minX;
    let minY = this.fPoints[1];
    let maxY = minY;
    accum *= minY;

    const len = 2 * pointCount;
    for (let i = 2; i < len; i += 2) {
      const x = this.fPoints[i];
      accum *= x;
      const y = this.fPoints[i + 1];
      accum *= y;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    const allFinite = accum * 0 === 0;
    if (allFinite) {
      this.fBounds = new Rect(minX, minY, maxX - minX, maxY - minY);
      this.fIsFinite = true;
    } else {
      this.fBounds = Rect.zero;
      this.fIsFinite = false;
    }
  }

  /**
   * 开始编辑路径
   */
  startEdit(): void {
    this.fIsOval = false;
    this.fIsRRect = false;
    this.fIsRect = false;
    this.cachedBounds = null;
    this.fBoundsIsDirty = true;
  }

  /**
   * 从源路径创建一个偏移的新路径
   */
  static shiftedFrom(source: PathRef, offsetX: number, offsetY: number): PathRef {
    const newRef = new PathRef();
    newRef.fPoints = PathRef._fPointsFromSource(source, offsetX, offsetY);
    newRef._fVerbs = PathRef._fVerbsFromSource(source);

    newRef._conicWeightsCapacity = source._conicWeightsCapacity;
    newRef._conicWeightsLength = source._conicWeightsLength;
    if (source._conicWeights != null) {
      newRef._conicWeights = new Float32Array(newRef._conicWeightsCapacity);
      newRef._conicWeights.set(source._conicWeights);
    }

    newRef._fVerbsCapacity = source._fVerbsCapacity;
    newRef._fVerbsLength = source._fVerbsLength;

    newRef._fPointsCapacity = source._fPointsCapacity;
    newRef._fPointsLength = source._fPointsLength;
    newRef.fBoundsIsDirty = source.fBoundsIsDirty;
    
    if (!newRef.fBoundsIsDirty) {
      newRef.fBounds = source.fBounds!.translate(offsetX, offsetY);
      newRef.cachedBounds = source.cachedBounds?.translate(offsetX, offsetY);
      newRef.fIsFinite = source.fIsFinite;
    }

    newRef.fSegmentMask = source.fSegmentMask;
    newRef.fIsOval = source.fIsOval;
    newRef.fIsRRect = source.fIsRRect;
    newRef.fIsRect = source.fIsRect;
    newRef.fRRectOrOvalIsCCW = source.fRRectOrOvalIsCCW;
    newRef.fRRectOrOvalStartIdx = source.fRRectOrOvalStartIdx;
    
    newRef.debugValidate();
    return newRef;
  }

  /**
   * 从源路径创建点数组
   */
  private static _fPointsFromSource(
    source: PathRef,
    offsetX: number,
    offsetY: number
  ): Float32Array {
    const sourceLength = source._fPointsLength;
    const sourceCapacity = source._fPointsCapacity;
    const dest = new Float32Array(sourceCapacity * 2);
    const sourcePoints = source.points;
    const len = sourceLength * 2;
    
    for (let i = 0; i < len; i += 2) {
      dest[i] = sourcePoints[i] + offsetX;
      dest[i + 1] = sourcePoints[i + 1] + offsetY;
    }
    
    return dest;
  }

  /**
   * 从源路径创建动作数组
   */
  private static _fVerbsFromSource(source: PathRef): Uint8Array {
    const verbs = new Uint8Array(source._fVerbsCapacity);
    verbs.set(source._fVerbs);
    return verbs;
  }

  /**
   * 复制源路径的内容
   */
  copy(
    ref: PathRef,
    additionalReserveVerbs: number,
    additionalReservePoints: number
  ): void {
    ref.debugValidate();
    const verbCount = ref.countVerbs();
    const pointCount = ref.countPoints();
    const weightCount = ref.countWeights();
    
    this.resetToSize(
      verbCount,
      pointCount,
      weightCount,
      additionalReserveVerbs,
      additionalReservePoints
    );

    this._fVerbs.set(ref._fVerbs);
    this.fPoints.set(ref.fPoints);
    
    if (ref._conicWeights == null) {
      this._conicWeights = null;
    } else {
      this._conicWeights!.set(ref._conicWeights);
    }

    this.fBoundsIsDirty = ref.fBoundsIsDirty;
    if (!this.fBoundsIsDirty) {
      this.fBounds = ref.fBounds;
      this.cachedBounds = ref.cachedBounds;
      this.fIsFinite = ref.fIsFinite;
    }

    this.fSegmentMask = ref.fSegmentMask;
    this.fIsOval = ref.fIsOval;
    this.fIsRRect = ref.fIsRRect;
    this.fIsRect = ref.fIsRect;
    this.fRRectOrOvalIsCCW = ref.fRRectOrOvalIsCCW;
    this.fRRectOrOvalStartIdx = ref.fRRectOrOvalStartIdx;
    
    this.debugValidate();
  }

  /**
   * 重置路径大小
   */
  resetToSize(
    verbCount: number,
    pointCount: number,
    conicCount: number,
    reserveVerbs: number = 0,
    reservePoints: number = 0
  ): void {
    this.debugValidate();
    this.fBoundsIsDirty = true;
    this.fSegmentMask = 0;
    this.startEdit();

    this._resizePoints(pointCount + reservePoints);
    this._resizeVerbs(verbCount + reserveVerbs);
    this._resizeConicWeights(conicCount);
    
    this.debugValidate();
  }

  /**
   * 调整点数组大小
   */
  private _resizePoints(newLength: number): void {
    if (newLength > this._fPointsCapacity) {
      this._fPointsCapacity = newLength + 10;
      const newPoints = new Float32Array(this._fPointsCapacity * 2);
      newPoints.set(this.fPoints);
      this.fPoints = newPoints;
    }
    this._fPointsLength = newLength;
  }

  /**
   * 调整动作数组大小
   */
  private _resizeVerbs(newLength: number): void {
    if (newLength > this._fVerbsCapacity) {
      this._fVerbsCapacity = newLength + 8;
      const newVerbs = new Uint8Array(this._fVerbsCapacity);
      newVerbs.set(this._fVerbs);
      this._fVerbs = newVerbs;
    }
    this._fVerbsLength = newLength;
  }

  /**
   * 调整权重数组大小
   */
  private _resizeConicWeights(newLength: number): void {
    if (newLength > this._conicWeightsCapacity) {
      this._conicWeightsCapacity = newLength + 4;
      const newWeights = new Float32Array(this._conicWeightsCapacity);
      if (this._conicWeights != null) {
        newWeights.set(this._conicWeights);
      }
      this._conicWeights = newWeights;
    }
    this._conicWeightsLength = newLength;
  }

  /**
   * 添加动作并为点预留空间
   */
  growForVerb(verb: number, weight: number): number {
    this.debugValidate();
    let pCnt: number;
    let mask = 0;
    
    switch (verb) {
      case PathVerb.MOVE:
        pCnt = 1;
        break;
      case PathVerb.LINE:
        mask = PathRef.LINE_SEGMENT_MASK;
        pCnt = 1;
        break;
      case PathVerb.QUAD:
        mask = PathRef.QUAD_SEGMENT_MASK;
        pCnt = 2;
        break;
      case PathVerb.CONIC:
        mask = PathRef.CONIC_SEGMENT_MASK;
        pCnt = 2;
        break;
      case PathVerb.CUBIC:
        mask = PathRef.CUBIC_SEGMENT_MASK;
        pCnt = 3;
        break;
      case PathVerb.CLOSE:
        pCnt = 0;
        break;
      default:
        throw new Error('Invalid path verb');
    }

    this.fSegmentMask |= mask;
    this.fBoundsIsDirty = true;
    this.startEdit();

    const verbCount = this.countVerbs();
    this._resizeVerbs(verbCount + 1);
    this._fVerbs[verbCount] = verb;

    if (verb === PathVerb.CONIC) {
      const weightCount = this.countWeights();
      this._resizeConicWeights(weightCount + 1);
      this._conicWeights![weightCount] = weight;
    }

    const ptsIndex = this._fPointsLength;
    this._resizePoints(ptsIndex + pCnt);
    this.debugValidate();
    return ptsIndex;
  }

  /**
   * 为重复动作预留空间
   */
  growForRepeatedVerb(verb: number, numVbs: number): number {
    this.debugValidate();
    let pCnt: number;
    let mask = 0;
    
    switch (verb) {
      case PathVerb.MOVE:
        pCnt = numVbs;
        break;
      case PathVerb.LINE:
        mask = PathRef.LINE_SEGMENT_MASK;
        pCnt = numVbs;
        break;
      case PathVerb.QUAD:
        mask = PathRef.QUAD_SEGMENT_MASK;
        pCnt = 2 * numVbs;
        break;
      case PathVerb.CONIC:
        mask = PathRef.CONIC_SEGMENT_MASK;
        pCnt = 2 * numVbs;
        break;
      case PathVerb.CUBIC:
        mask = PathRef.CUBIC_SEGMENT_MASK;
        pCnt = 3 * numVbs;
        break;
      case PathVerb.CLOSE:
        pCnt = 0;
        break;
      default:
        throw new Error('Invalid path verb');
    }

    this.fSegmentMask |= mask;
    this.fBoundsIsDirty = true;
    this.startEdit();

    if (verb === PathVerb.CONIC) {
      this._resizeConicWeights(this.countWeights() + numVbs);
    }

    const verbCount = this.countVerbs();
    this._resizeVerbs(verbCount + numVbs);
    for (let i = 0; i < numVbs; i++) {
      this._fVerbs[verbCount + i] = verb;
    }

    const ptsIndex = this._fPointsLength;
    this._resizePoints(ptsIndex + pCnt);
    this.debugValidate();
    return ptsIndex;
  }

  /**
   * 添加路径的所有动作
   */
  growForVerbsInPath(path: PathRef): void {
    this.debugValidate();
    this.startEdit();
    this.fSegmentMask |= path.fSegmentMask;
    this.fBoundsIsDirty = true;

    const numVerbs = path.countVerbs();
    if (numVerbs !== 0) {
      const curLength = this.countVerbs();
      this._resizeVerbs(curLength + numVerbs);
      this._fVerbs.set(path._fVerbs, curLength);
    }

    const numPts = path.countPoints();
    if (numPts !== 0) {
      const curLength = this.countPoints();
      this._resizePoints(curLength + numPts);
      this.fPoints.set(path.fPoints.subarray(0, numPts * 2), curLength * 2);
    }

    const numConics = path.countWeights();
    if (numConics !== 0) {
      const curLength = this.countWeights();
      this._resizeConicWeights(curLength + numConics);
      this._conicWeights!.set(path._conicWeights!.subarray(0, numConics), curLength);
    }

    this.debugValidate();
  }
}

export class PathRefIterator {
  static readonly kMaxBufferSize = 8;

  private pathRef: PathRef;
  private _conicWeightIndex: number = -1;
  private _verbIndex: number = 0;
  private _pointIndex: number = 0;
  iterIndex: number = 0;

  constructor(pathRef: PathRef) {
    this.pathRef = pathRef;
    this._pointIndex = 0;
    if (!pathRef.isFinite) {
      this._verbIndex = pathRef.countVerbs();
    }
  }

  get pointIndex(): number {
    return this._pointIndex >> 1;
  }

  skipToNextContour(): number {
    let verb = -1;
    let curPointIndex = this._pointIndex;
    
    do {
      curPointIndex = this._pointIndex;
      verb = this.nextIndex();
    } while (verb !== PathRef.DONE && (this.iterIndex === 0 || verb !== PathRef.MOVE));
    
    return (verb === PathRef.DONE ? this._pointIndex : curPointIndex) >> 1;
  }

  nextIndex(): number {
    if (this._verbIndex === this.pathRef.countVerbs()) {
      return PathRef.DONE;
    }

    const verb = this.pathRef.atVerb(this._verbIndex++);
    switch (verb) {
      case PathRef.MOVE:
        this.iterIndex = this._pointIndex;
        this._pointIndex += 2;
        break;
      case PathRef.LINE:
        this.iterIndex = this._pointIndex - 2;
        this._pointIndex += 2;
        break;
      case PathRef.CONIC:
        this._conicWeightIndex++;
        this.iterIndex = this._pointIndex - 2;
        this._pointIndex += 4;
        break;
      case PathRef.QUAD:
        this.iterIndex = this._pointIndex - 2;
        this._pointIndex += 4;
        break;
      case PathRef.CUBIC:
        this.iterIndex = this._pointIndex - 2;
        this._pointIndex += 6;
        break;
      case PathRef.CLOSE:
        break;
      case PathRef.DONE:
        break;
      default:
        throw new Error(`Unsupported Path verb ${verb}`);
    }
    return verb;
  }

  next(outPts: Float32Array): number {
    if (this._verbIndex === this.pathRef.countVerbs()) {
      return PathRef.DONE;
    }

    const verb = this.pathRef.atVerb(this._verbIndex++);
    const points = this.pathRef.points;
    let pointIndex = this._pointIndex;

    switch (verb) {
      case PathRef.MOVE:
        outPts[0] = points[pointIndex++];
        outPts[1] = points[pointIndex++];
        break;
      case PathRef.LINE:
        outPts[0] = points[pointIndex - 2];
        outPts[1] = points[pointIndex - 1];
        outPts[2] = points[pointIndex++];
        outPts[3] = points[pointIndex++];
        break;
      case PathRef.CONIC:
        this._conicWeightIndex++;
        outPts[0] = points[pointIndex - 2];
        outPts[1] = points[pointIndex - 1];
        outPts[2] = points[pointIndex++];
        outPts[3] = points[pointIndex++];
        outPts[4] = points[pointIndex++];
        outPts[5] = points[pointIndex++];
        break;
      case PathRef.QUAD:
        outPts[0] = points[pointIndex - 2];
        outPts[1] = points[pointIndex - 1];
        outPts[2] = points[pointIndex++];
        outPts[3] = points[pointIndex++];
        outPts[4] = points[pointIndex++];
        outPts[5] = points[pointIndex++];
        break;
      case PathRef.CUBIC:
        outPts[0] = points[pointIndex - 2];
        outPts[1] = points[pointIndex - 1];
        outPts[2] = points[pointIndex++];
        outPts[3] = points[pointIndex++];
        outPts[4] = points[pointIndex++];
        outPts[5] = points[pointIndex++];
        outPts[6] = points[pointIndex++];
        outPts[7] = points[pointIndex++];
        break;
      case PathRef.CLOSE:
        break;
      case PathRef.DONE:
        break;
      default:
        throw new Error(`Unsupported Path verb ${verb}`);
    }

    this._pointIndex = pointIndex;
    return verb;
  }

  get conicWeight(): number {
    return this.pathRef.atWeight(this._conicWeightIndex);
  }

  peek(): number {
    return this._verbIndex < this.pathRef.countVerbs() 
      ? this.pathRef.atVerb(this._verbIndex)
      : PathRef.DONE;
  }
}

class Corner {
  static readonly kUpperLeft = 0;
  static readonly kUpperRight = 1;
  static readonly kLowerRight = 2;
  static readonly kLowerLeft = 3;
}

export enum PathVerb {
  MOVE = 0,
  LINE = 1,
  QUAD = 2,
  CONIC = 3,
  CUBIC = 4,
  CLOSE = 5,
  DONE = 6,
}

export class PathRef {
  /**
   * 判断两个浮点数是否近似相等
   */
  private static nearlyEqual(a: number, b: number): boolean {
    const epsilon = 1e-5;
    return Math.abs(a - b) < epsilon;
  }

  /**
   * 查找不同点的索引
   */
  private findDiffPoint(index: number, n: number, inc: number): number {
    let i = index;
    for (;;) {
      i = (i + inc) % n;
      if (i === index) {
        break;
      }
      if (this.fPoints[index * 2] !== this.fPoints[i * 2] ||
          this.fPoints[index * 2 + 1] !== this.fPoints[i * 2 + 1]) {
        break;
      }
    }
    return i;
  }

  /**
   * 查找最大 y 坐标的点索引
   */
  private findMaxY(pointIndex: number, count: number): number {
    let max = this.fPoints[pointIndex * 2 + 1];
    let firstIndex = pointIndex;
    for (let i = 1; i < count; i++) {
      const y = this.fPoints[(pointIndex + i) * 2 + 1];
      if (y > max) {
        max = y;
        firstIndex = pointIndex + i;
      }
    }
    return firstIndex;
  }
} 