
export const mix = (value: number, x: number, y: number) =>
    x * (1 - value) + y * value;

export const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
};

export const saturate = (value: number) => clamp(value, 0, 1);

export const toDeg = (rad: number) => (rad * 180) / Math.PI;

export const toRad = (deg: number) => (deg * Math.PI) / 180;

export const TAU = 2 * Math.PI;
export const PI_OVER_2 = Math.PI / 2;

export const ARC_APPROXIMATION_MAGIC = 0.551915024494;

const projectPoint = (matrix: DOMMatrix, point: DOMPoint) => {
    const p = new DOMPoint(point.x, point.y, 0, 1).matrixTransform(matrix);
    return new DOMPoint(p.x / p.w, p.y / p.w);
};

const dist = (p1: DOMPoint, p2: DOMPoint) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y);

export const vec = (x: number, y: number) => new DOMPoint(x, y);

export const equals = (p1: DOMPoint, p2: DOMPoint) =>
    p1.x === p2.x && p1.y === p2.y;

export const plus = (p1: DOMPoint, p2: DOMPoint) =>
    new DOMPoint(p1.x + p2.x, p1.y + p2.y);

const minus = (p1: DOMPoint, p2: DOMPoint) =>
    new DOMPoint(p1.x - p2.x, p1.y - p2.y);

export const multiply = (p1: DOMPoint, p2: DOMPoint) =>
    new DOMPoint(p1.x * p2.x, p1.y * p2.y);

export const divide = (p1: DOMPoint, p2: DOMPoint) =>
    new DOMPoint(p1.x / p2.x, p1.y / p2.y);

export const multiplyScalar = (p: DOMPoint, scale: number) =>
    new DOMPoint(p.x * scale, p.y * scale);

export const divideScalar = (p: DOMPoint, d: number) =>
    new DOMPoint(p.x / d, p.y / d);

export const negate = (p: DOMPoint) => new DOMPoint(-p.x, -p.y);

export const dot = (p1: DOMPoint, p2: DOMPoint): number =>
    p1.x * p2.x + p1.y * p2.y;

export const cross = (p1: DOMPoint, p2: DOMPoint): number =>
    p1.x * p2.y - p1.y * p2.x;

export const magnitude = (p: DOMPoint): number =>
    Math.sqrt(p.x * p.x + p.y * p.y);

export const normalize = (p: DOMPoint) => {
    const m = magnitude(p);
    return new DOMPoint(p.x / m, p.y / m);
};

export const angleTo = (p1: DOMPoint, p2: DOMPoint) =>
    Math.atan2(p2.y - p1.y, p2.x - p1.x);


export type RenderingContext =
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D;

export abstract class IndexedHostObject {
    public readonly id;

    constructor(prefix: string) {
        this.id = `${prefix}-${generateId()}`;
    }
}

const generateId = () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

export interface Drawable {
    draw(ctx: RenderingContext, stroke?: boolean): void;
}

export const ns = "http://www.w3.org/2000/svg";

type CurrentGraphic = "CurrentGraphic";
export const CurrentGraphic = "CurrentGraphic";
type SourceGraphic = "SourceGraphic";
export const SourceGraphic = "SourceGraphic";
export type SVGFilter = SVGElement;
export type SVGInputFilter = SVGFilter | CurrentGraphic | SourceGraphic;

export const filterId = (filter: SVGInputFilter) => {
    if (filter === CurrentGraphic || filter === SourceGraphic) {
        return filter;
    }
    const id = filter.getAttribute("result");
    if (!id) {
        throw new Error("SVGFilter: id is null");
    }
    return id;
};

export const makeBlur = (
    blurX: number,
    blurY: number,
    inFilter: SVGInputFilter = CurrentGraphic,
    result = "CurrentGraphic"
) => {
    const filter = document.createElementNS(ns, "feGaussianBlur");
    filter.setAttribute("in", filterId(inFilter));
    filter.setAttribute("stdDeviation", `${blurX} ${blurY}`);
    filter.setAttribute("result", result);
    return filter;
};
export type TurbulenceType = "fractalNoise" | "turbulence";

export const makeTurbulence = (
    baseFrequencyX: number,
    baseFrequencyY: number,
    numOctaves: number,
    seed: number,
    type: TurbulenceType,
    result = "CurrentGraphic"
) => {
    const filter = document.createElementNS(ns, "feTurbulence");
    filter.setAttribute(
        "baseFrequency",
        [baseFrequencyX.toString(), baseFrequencyY.toString()].join(" ")
    );
    filter.setAttribute("seed", seed.toString());
    filter.setAttribute("numOctaves", numOctaves.toString());
    filter.setAttribute("type", type);
    filter.setAttribute("result", result);
    return filter;
};

type CompositeOperator = "over" | "in" | "out" | "atop" | "xor" | "arithmetic";

export const makeComposite = (
    inFilter: SVGInputFilter,
    in2Filter: SVGInputFilter,
    operator: CompositeOperator,
    result = "CurrentGraphic"
) => {
    const filter = document.createElementNS(ns, "feComposite");
    filter.setAttribute("in", filterId(inFilter));
    filter.setAttribute("in2", filterId(in2Filter));
    filter.setAttribute("operator", operator);
    filter.setAttribute("result", result);
    return filter;
};

export const makeMerge = (
    inFilters: SVGInputFilter[],
    result = "CurrentGraphic"
) => {
    const filter = document.createElementNS(ns, "feMerge");
    inFilters.forEach((filterElement) => {
        const mergeNode = document.createElementNS(ns, "feMergeNode");
        mergeNode.setAttribute("in", filterId(filterElement));
        filter.appendChild(mergeNode);
    });
    filter.setAttribute("result", result);
    return filter;
};

type BlendMode = "normal" | "multiply" | "screen" | "darken" | "lighten";

export const makeBlend = (
    inFilter: SVGInputFilter,
    in2Filter: SVGInputFilter,
    mode: BlendMode,
    result = "CurrentGraphic"
) => {
    const filter = document.createElementNS(ns, "feBlend");
    filter.setAttribute("in", filterId(inFilter));
    filter.setAttribute("in2", filterId(in2Filter));
    filter.setAttribute("mode", mode);
    filter.setAttribute("result", result);
    return filter;
};

type ColorMatrixValues =
    | { type: "matrix"; values: Float32Array }
    | { type: "saturate" | "hueRotate"; values: number }
    | { type: "luminanceToAlpha"; values?: never };

export const makeColorMatrix = (
    value: ColorMatrixValues,
    input: SVGInputFilter = CurrentGraphic,
    result = "CurrentGraphic"
) => {
    const filter = document.createElementNS(ns, "feColorMatrix");
    filter.setAttribute("in", filterId(input));
    filter.setAttribute("type", value.type);
    if (value.type !== "luminanceToAlpha") {
        filter.setAttribute(
            "values",
            Array.isArray(value.values)
                ? value.values.join(" ")
                : value.values.toString()
        );
    }
    filter.setAttribute("result", result);
    return filter;
};

export class SVGContext {
    private root: SVGSVGElement = document.createElementNS(ns, "svg");
    private defs: SVGDefsElement = document.createElementNS(ns, "defs");

    constructor(id: string) {
        this.root.id = id;
        this.root.style.width = "0";
        this.root.style.height = "0";
        // this.root.setAttribute("style", "display: none;");
        this.defs = document.createElementNS(ns, "defs");
        this.root.appendChild(this.defs);
        document.body.appendChild(this.root);
    }

    dispose() {
        document.body.removeChild(this.root);
    }

    disposeFilter(id: string) {
        const filter = document.getElementById(id);
        if (filter) {
            this.defs.removeChild(filter);
        }
    }

    discardCacheIfNeeded() {
        if (this.defs.childElementCount > 100) {
            this.disposeFilters();
        }
    }

    disposeFilters() {
        this.root.removeChild(this.defs);
        this.defs = document.createElementNS(ns, "defs");
        this.root.appendChild(this.defs);
    }

    create(id: string, filters: SVGElement[]) {
        const url = `url(#${id})`;
        // If the filter already exists, we don't need to create it again
        if (document.getElementById(id)) {
            return url;
        }
        const filter = document.createElementNS(ns, "filter");
        filter.setAttribute("id", id);
        // This step doesn't seem to be necessary
        // Now we create the CurrentGraphic filter input for composition
        // filter.append(
        //   makeColorMatrix(
        //     {
        //       type: "matrix",
        //       values: IndentityColorMatrix,
        //     },
        //     SourceGraphic
        //   )
        // );
        for (const fe of filters) {
            filter.appendChild(fe);
        }
        this.defs.appendChild(filter);
        return url;
    }
}

export class DrawablePath implements Drawable {
    constructor(
        private readonly path: Path2D,
        private readonly fillType: CanvasFillRule = "nonzero"
    ) { }

    draw(ctx: RenderingContext, stroke?: boolean) {
        if (stroke) {
            ctx.stroke(this.path);
        } else {
            ctx.fill(this.path, this.fillType);
        }
    }
}

export class DrawableText implements Drawable {
    constructor(
        private readonly text: string,
        private readonly x: number,
        private readonly y: number,
        private readonly font: string | null
    ) { }

    draw(ctx: RenderingContext, stroke?: boolean) {
        if (this.font) {
            ctx.font = this.font;
        }
        if (stroke) {
            ctx.strokeText(this.text, this.x, this.y);
        } else {
            ctx.fillText(this.text, this.x, this.y);
        }
    }
}

export class DrawableFill implements Drawable {
    private topLeft: DOMPoint;
    private topRight: DOMPoint;
    private bottomRight: DOMPoint;
    private bottomLeft: DOMPoint;

    constructor(width: number, height: number) {
        this.topLeft = new DOMPoint(0, 0);
        this.topRight = new DOMPoint(width, 0);
        this.bottomRight = new DOMPoint(width, height);
        this.bottomLeft = new DOMPoint(0, height);
    }

    draw(ctx: RenderingContext, _stroke?: boolean) {
        const path = new Path2D();
        const ctm = ctx.getTransform().inverse();
        const topLeft = projectPoint(ctm, this.topLeft);
        const topRight = projectPoint(ctm, this.topRight);
        const bottomRight = projectPoint(ctm, this.bottomRight);
        const bottomLeft = projectPoint(ctm, this.bottomLeft);
        path.moveTo(topLeft.x, topLeft.y);
        path.lineTo(topRight.x, topRight.y);
        path.lineTo(bottomRight.x, bottomRight.y);
        path.lineTo(bottomLeft.x, bottomLeft.y);
        path.closePath();
        ctx.fill(path);
    }
}

export class DrawableImage implements Drawable {
    constructor(
        private readonly image: CanvasImageSource,
        private readonly x: number = 0,
        private readonly y: number = 0
    ) { }

    draw(ctx: RenderingContext) {
        ctx.drawImage(this.image, this.x, this.y);
    }
}

export class DrawableImageRect implements Drawable {
    constructor(
        private readonly image: CanvasImageSource,
        private x1: number,
        private y1: number,
        private width1: number,
        private height1: number,
        private x2: number,
        private y2: number,
        private width2: number,
        private height2: number
    ) { }

    draw(ctx: RenderingContext) {
        ctx.drawImage(
            this.image,
            this.x1,
            this.y1,
            this.width1,
            this.height1,
            this.x2,
            this.y2,
            this.width2,
            this.height2
        );
    }
}

// export class DrawableGlyphs implements Drawable {
//   constructor(
//     private readonly glyphs: number[],
//     private readonly positions: Float32Array,
//     private readonly x: number,
//     private readonly y: number,
//     private readonly font: FontJS
//   ) {}

//   private getDrawableGlyphs() {
//     return this.glyphs.map((glyph, index) => {
//       return {
//         text: this.font.getStringForGlyph(glyph),
//         x: this.x + this.positions[index * 2],
//         y: this.y + this.positions[index * 2 + 1],
//       };
//     });
//   }

//   draw(ctx: CanvasRenderingContext2D, stroke?: boolean) {
//     if (this.font) {
//       ctx.font = this.font.fontStyle();
//     }
//     this.getDrawableGlyphs().forEach(({ text, x, y }) => {
//       if (stroke) {
//         ctx.strokeText(text, x, y);
//       } else {
//         ctx.fillText(text, x, y);
//       }
//     });
//   }
// }

export class DrawableDRRect implements Drawable {
    constructor(private readonly outer: Path2D, private readonly inner: Path2D) { }
    draw(ctx: CanvasRenderingContext2D, stroke?: boolean): void {
        // TODO: implement ctm
        // Combine the outer and inner paths
        const combinedPath = new Path2D();
        combinedPath.addPath(this.outer);
        combinedPath.addPath(this.inner);

        // Draw the combined path using the "evenodd" fill rule
        if (stroke) {
            ctx.stroke(combinedPath); // This will stroke both paths, adjust if needed
        } else {
            ctx.fill(combinedPath, "evenodd"); // This will fill only the outer minus inner
        }
    }
}

interface CanvasContext {
    matrix: DOMMatrix;
    clip: Path2D | null;
    imageFilter: ImageFilter | null;
    renderingCtx: RenderingContext;
}

export interface RuntimeEffectChild {
    texture: WebGLTexture;
    location: WebGLUniformLocation;
}

export type Textures = { [name: string]: RuntimeEffectChild };

const vertexShaderCode = `
  attribute vec2 a_position;
  
  uniform vec2 u_resolution;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
  `;

const handleError = (
    err: string,
    error: ((err: string) => void) | undefined
) => {
    if (error) {
        error(err);
    } else {
        console.error(err);
    }
    return null;
};

export class WebGLContext {
    private _gl: WebGL2RenderingContext | null = null;
    private _program: WebGLProgram | null = null;
    private _textures: Textures | null = null;

    constructor(
        shaderCode: string,
        shaderToy?: boolean,
        _error?: ((err: string) => void) | undefined
    ) {
        const canvas = new OffscreenCanvas(0, 0);
        const gl = canvas.getContext("webgl2");
        const error = _error ?? console.error.bind(console);
        if (!gl) {
            handleError(
                "Failed to get WebGL2 context. Your browser or machine may not support it.",
                error
            );
            return;
        }

        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;

        gl.shaderSource(vertexShader, vertexShaderCode);
        gl.compileShader(vertexShader);

        gl.shaderSource(
            fragmentShader,
            `precision mediump float;
    
    uniform mat4 u_matrix;
    uniform vec2 u_resolution;
    
    ${shaderCode}
    
    void main() {
      vec4 canvasSpace = gl_FragCoord;
      ${!shaderToy ? "canvasSpace.y = u_resolution.y - canvasSpace.y" : ""};
      vec4 transformedCoord = u_matrix * canvasSpace;
      vec3 transformedCoord3d = transformedCoord.xyz / transformedCoord.w;
      mainImage(gl_FragColor, transformedCoord3d.xy);
    }`
        );
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(fragmentShader);
            const msg = "Could not compile fragment shader. \n" + info;
            handleError(msg, error);
            return;
        }

        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            const msg = "Could not link WebGL program. \n" + info;
            handleError(msg, error);
            return;
        }

        gl.useProgram(program);
        const textures: Textures = {};

        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const uniformInfo = gl.getActiveUniform(program, i)!;
            const location = gl.getUniformLocation(program, uniformInfo.name);
            if (!location) {
                throw new Error("Could not get uniform location");
            }
            if (uniformInfo && uniformInfo.type === gl.SAMPLER_2D) {
                const texture = gl.createTexture()!;
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                textures[uniformInfo.name] = { texture, location };
            }
        }

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
            ]),
            gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        this._gl = gl;
        this._program = program;
        this._textures = textures;
    }

    private ensureContextIsInitialized() {
        if (!this._gl || !this._program || !this._textures) {
            throw new Error("GLSLContext not initialized.");
        }
    }

    get gl() {
        this.ensureContextIsInitialized();
        return this._gl!;
    }

    get program() {
        this.ensureContextIsInitialized();
        return this._program!;
    }

    get textures() {
        this.ensureContextIsInitialized();
        return this._textures!;
    }
}

export type RuntimeEffectChildren = RuntimeEffectChild[];
export interface Shader {
    render(width: number, height: number): OffscreenCanvas;
}

export class WebGLShader implements Shader {
    constructor(
        private readonly ctx: WebGLContext,
        uniforms: { [name: string]: number[] },
        private readonly children: Shader[],
        private readonly localMatrix?: DOMMatrix
    ) {
        const { gl, program } = ctx;
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformInfo = gl.getActiveUniform(program, i);
            if (!uniformInfo) {
                throw new Error("Could not get uniform info");
            }
            const { name } = uniformInfo;
            if (name === "u_matrix" || name === "u_resolution") {
                continue;
            }
            const location = gl.getUniformLocation(program, name);
            if (!location) {
                throw new Error("Could not get uniform location");
            }
            if (uniformInfo.type === gl.FLOAT) {
                processUniform(
                    this.ctx,
                    uniforms[name],
                    uniformInfo,
                    gl.uniform1fv.bind(gl)
                );
            } else if (uniformInfo.type === gl.FLOAT_VEC2) {
                processUniform(
                    this.ctx,
                    uniforms[name],
                    uniformInfo,
                    gl.uniform2fv.bind(gl)
                );
            } else if (uniformInfo.type === gl.FLOAT_VEC3) {
                processUniform(
                    this.ctx,
                    uniforms[name],
                    uniformInfo,
                    gl.uniform3fv.bind(gl)
                );
            } else if (uniformInfo.type === gl.FLOAT_VEC4) {
                processUniform(
                    this.ctx,
                    uniforms[name],
                    uniformInfo,
                    gl.uniform4fv.bind(gl)
                );
            } else if (uniformInfo.type === gl.FLOAT_MAT2) {
                processUniform(this.ctx, uniforms[name], uniformInfo, (loc, subarr) =>
                    gl.uniformMatrix2fv(loc, false, subarr)
                );
            } else if (uniformInfo.type === gl.FLOAT_MAT3) {
                processUniform(this.ctx, uniforms[name], uniformInfo, (loc, subarr) =>
                    gl.uniformMatrix3fv(loc, false, subarr)
                );
            } else if (uniformInfo.type === gl.FLOAT_MAT4) {
                processUniform(this.ctx, uniforms[name], uniformInfo, (loc, subarr) =>
                    gl.uniformMatrix4fv(loc, false, subarr)
                );
            }
        }
    }

    render(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
        const localMatrix = this.localMatrix ?? new DOMMatrix();
        const { gl, program, textures } = this.ctx;
        gl.canvas.width = width;
        gl.canvas.height = height;
        // Set the CTM
        const matrixLocation = gl.getUniformLocation(program, "u_matrix");
        if (matrixLocation) {
            gl.uniformMatrix4fv(
                matrixLocation,
                false,
                localMatrix.inverse().toFloat32Array()
            );
        }
        // Set the resolution
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        if (resolutionLocation) {
            gl.uniform2f(resolutionLocation, width, height);
        }
        let texIndex = 0;
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformInfo = gl.getActiveUniform(program, i);
            if (!uniformInfo) {
                throw new Error("Could not get uniform info");
            }
            const { name } = uniformInfo;
            const location = gl.getUniformLocation(program, name);
            if (!location) {
                throw new Error("Could not get uniform location");
            }
            if (uniformInfo.type === gl.SAMPLER_2D) {
                if (!this.children[texIndex]) {
                    throw new Error(`No texture for uniform ${name}`);
                }
                gl.activeTexture(gl.TEXTURE0 + texIndex);
                gl.bindTexture(gl.TEXTURE_2D, textures[name].texture);
                gl.uniform1i(location, texIndex);
                gl.texImage2D(
                    gl.TEXTURE_2D,
                    0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    this.children[texIndex].render(width, height)
                );
                texIndex++;
            }
        }
        gl.viewport(0, 0, width, height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        return gl.canvas; //as OffscreenCanvas;
    }
}

const processUniform = (
    ctx: WebGLContext,
    values: number[],
    uniformInfo: WebGLActiveInfo,
    setter: (loc: WebGLUniformLocation | null, values: number[]) => void
) => {
    const { gl, program } = ctx;
    const { name } = uniformInfo;
    const location = gl.getUniformLocation(program, name);
    if (!location) {
        console.error("Could not find uniform location for " + name);
    }
    setter(gl.getUniformLocation(program, name), values);
};
// TODO: rename to CustomShader
export abstract class CustomTexture implements Shader {
    protected texture = new OffscreenCanvas(0, 0);
    protected ctx = this.texture.getContext("2d")!;

    constructor() { }

    abstract draw(ctx: OffscreenCanvasRenderingContext2D): void;

    render(width: number, height: number) {
        this.texture.width = width;
        this.texture.height = height;
        this.draw(this.ctx);
        return this.texture;
    }
}

export class BlendShader extends CustomTexture {
    constructor(
        private blendMode: GlobalCompositeOperation,
        private child1: Shader,
        private child2: Shader
    ) {
        super();
    }

    draw(ctx: OffscreenCanvasRenderingContext2D) {
        const { width, height } = ctx.canvas;
        const t1 = this.child1.render(width, height);
        ctx.globalCompositeOperation = this.blendMode;
        ctx.drawImage(t1, 0, 0);
        const t2 = this.child2.render(width, height);
        ctx.drawImage(t2, 0, 0);
    }
}

export class ColorShader extends CustomTexture {
    constructor(private color: string) {
        super();
    }

    draw(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
}

abstract class GradientTexture extends CustomTexture {
    protected positions: number[];

    constructor(protected colors: string[], pos?: number[]) {
        super();
        this.positions = pos ? pos : colors.map((_, i) => i / (colors.length - 1));
    }

    draw(ctx: OffscreenCanvasRenderingContext2D) {
        const gradient = this.getGradient(ctx);
        this.colors.forEach((color, i) => {
            gradient.addColorStop(this.positions[i], color);
        });
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    abstract getGradient(ctx: OffscreenCanvasRenderingContext2D): CanvasGradient;
}

export class LinearGradient extends GradientTexture {
    constructor(
        private start: DOMPoint,
        private end: DOMPoint,
        colors: string[],
        positions?: number[]
    ) {
        super(colors, positions);
    }

    getGradient(ctx: OffscreenCanvasRenderingContext2D) {
        const gradient = ctx.createLinearGradient(
            this.start.x,
            this.start.y,
            this.end.x,
            this.end.y
        );
        return gradient;
    }
}

export class TwoPointConicalGradient extends GradientTexture {
    constructor(
        private c1: DOMPoint,
        private r1: number,
        private c2: DOMPoint,
        private r2: number,
        colors: string[],
        positions?: number[]
    ) {
        super(colors, positions);
    }

    getGradient(ctx: OffscreenCanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(
            this.c1.x,
            this.c1.y,
            this.r1,
            this.c2.x,
            this.c2.y,
            this.r2
        );
        return gradient;
    }
}

export class SweepGradient extends GradientTexture {
    constructor(
        private c: DOMPoint,
        private angle: number,
        colors: string[],
        positions?: number[]
    ) {
        super(colors, positions);
    }

    getGradient(ctx: OffscreenCanvasRenderingContext2D) {
        const gradient = ctx.createConicGradient(this.angle, this.c.x, this.c.y);
        return gradient;
    }
}

export class ImageShader extends CustomTexture {
    constructor(
        private image: HTMLCanvasElement,
        private localMatrix?: DOMMatrix
    ) {
        super();
    }

    draw(ctx: OffscreenCanvasRenderingContext2D) {
        if (this.localMatrix) {
            ctx.setTransform(this.localMatrix);
        }
        ctx.drawImage(this.image, 0, 0);
    }
}

export type Applier<T> = (comp: T, index: number) => void;

export class Contour implements TightBounds {
    components: PathComponent[] = [];

    constructor(public closed: boolean) { }

    computeTightBounds() {
        return computeTightBounds(this.components);
    }

    getPosTanAtLength(length: number) {
        let offset = 0;
        for (const component of this.components) {
            const componentLength = component.length();
            const nextOffset = offset + componentLength;
            if (nextOffset >= length) {
                const l0 = Math.max(0, length - offset);
                const t = component.tAtLength(l0);
                const pos = component.solve(t);
                const tan = component.solveDerivative(t);
                return [pos, tan];
            }
            offset = nextOffset;
        }
        throw new Error("length out of bounds");
    }

    getSegment(start: number, stop: number) {
        const trimmedContour = new Contour(false);
        if (start >= stop) {
            return trimmedContour;
        }
        let offset = 0;
        this.components.forEach((component) => {
            const componentLength = component.length();
            const nextOffset = offset + componentLength;
            if (nextOffset <= start || offset >= stop) {
                offset = nextOffset;
                return;
            }
            const l0 = Math.max(0, start - offset);
            const l1 = Math.min(componentLength, stop - offset);
            const partialContour = component.segment(l0, l1);
            trimmedContour.components.push(partialContour);
            offset = nextOffset;
        });
        return trimmedContour;
    }

    enumerateComponents(
        linearApplier?: Applier<LinearPathComponent>,
        quadApplier?: Applier<QuadraticPathComponent>,
        cubicApplier?: Applier<CubicPathComponent>
    ) {
        this.components.forEach((comp, index) => {
            if (comp instanceof LinearPathComponent && linearApplier) {
                linearApplier(comp, index);
            } else if (comp instanceof QuadraticPathComponent && quadApplier) {
                quadApplier(comp, index);
            } else if (comp instanceof CubicPathComponent && cubicApplier) {
                cubicApplier(comp, index);
            }
        });
    }

    length() {
        return this.components.reduce((acc, c) => acc + c.length(), 0);
    }

    getLastComponent() {
        return this.components[this.components.length - 1];
    }

    toCmds() {
        if (this.components.length === 0) {
            return [];
        }
        const [comp] = this.components;
        const cmds = [PathVerb.Move, comp.p1.x, comp.p1.y];
        const cmdToAdd = this.components.map((c) => c.toCmd());
        if (this.closed) {
            cmdToAdd[cmdToAdd.length - 1] = [PathVerb.Close];
        }
        cmds.push(...cmdToAdd.flat());
        return cmds;
    }

    toSVGString() {
        if (this.components.length === 0) {
            return "";
        }
        const [comp] = this.components;
        const cmds = [`M${comp.p1.x} ${comp.p1.y}`];
        cmds.push(...this.components.map((c) => c.toSVGString()));
        if (this.closed) {
            cmds[cmds.length - 1] = "Z";
        }
        return cmds.join(" ");
    }
}
export class Path {
    contours: Contour[] = [];
    private current = new DOMPoint(0, 0);
    private subpathStart: DOMPoint | null = null;

    get contour() {
        // SVG doesn't allow for contourless path but Skia adds moveTo(0, 0) automatically
        // see SVGParser.test.ts
        if (this.contours.length === 0) {
            this.addContour();
        }
        return this.contours[this.contours.length - 1];
    }

    enumerateComponents(
        linearApplier?: Applier<LinearPathComponent>,
        quadApplier?: Applier<QuadraticPathComponent>,
        cubicApplier?: Applier<CubicPathComponent>,
        contourApplier?: Applier<Contour>
    ) {
        this.contours.forEach((c, index) => {
            if (contourApplier) {
                contourApplier(c, index);
            }
            c.enumerateComponents(linearApplier, quadApplier, cubicApplier);
        });
    }

    addContour(isClosed = false) {
        this.contours.push(new Contour(isClosed));
    }

    closeContour() {
        this.contour.closed = true;
        return this;
    }

    moveTo(p: DOMPoint) {
        this.current = p;
        this.subpathStart = this.current;
        this.addContour();
        return this;
    }

    lineTo(p: DOMPoint) {
        this.contour.components.push(new LinearPathComponent(this.current, p));
        this.current = p;
        return this;
    }

    quadraticCurveTo(controlPoint: DOMPoint, point: DOMPoint) {
        this.contour.components.push(
            new QuadraticPathComponent(this.current, controlPoint, point)
        );
        this.current = point;
        return this;
    }

    bezierCurveTo(cp1: DOMPoint, cp2: DOMPoint, point: DOMPoint) {
        this.contour.components.push(
            new CubicPathComponent(this.current, cp1, cp2, point)
        );
        this.current = point;
        return this;
    }

    addComponent(comp: PathComponent) {
        this.contour.components.push(comp);
        return this;
    }

    addLinearComponent(p1: DOMPoint, p2: DOMPoint) {
        this.contour.components.push(new LinearPathComponent(p1, p2));
        return this;
    }

    addQuadraticComponent(p1: DOMPoint, cp: DOMPoint, p2: DOMPoint) {
        this.contour.components.push(new QuadraticPathComponent(p1, cp, p2));
        return this;
    }

    addCubicComponent(p1: DOMPoint, cp1: DOMPoint, cp2: DOMPoint, p2: DOMPoint) {
        this.contour.components.push(new CubicPathComponent(p1, cp1, cp2, p2));
        return this;
    }

    getLastComponent() {
        return this.contour.getLastComponent();
    }

    length() {
        return this.contours.reduce((acc, c) => acc + c.length(), 0);
    }

    computeTightBounds(result: Float32Array) {
        const bounds = computeTightBounds(
            this.contours.filter((c) => c.components.length > 0)
        );
        result[0] = bounds[0];
        result[1] = bounds[1];
        result[2] = bounds[2];
        result[3] = bounds[3];
    }

    getPoints() {
        const points: DOMPoint[] = [];
        this.contours.forEach((contour) => {
            contour.enumerateComponents(
                (linear) => {
                    points.push(linear.p1);
                    points.push(linear.p2);
                },
                (quad) => {
                    points.push(quad.p1);
                    points.push(quad.p2);
                    points.push(quad.cp);
                },
                (cubic) => {
                    points.push(cubic.p1);
                    points.push(cubic.p2);
                    points.push(cubic.cp1);
                    points.push(cubic.cp2);
                }
            );
        });
        return points;
    }

    getPath2D() {
        const path = new Path2D();
        const cmds = this.toCmds();
        let i = 0;
        while (i < cmds.length) {
            const cmd = cmds[i++];
            if (cmd === PathVerb.Move) {
                const p = new DOMPoint(cmds[i++], cmds[i++]);
                path.moveTo(p.x, p.y);
            } else if (cmd === PathVerb.Line) {
                const p = new DOMPoint(cmds[i++], cmds[i++]);
                path.lineTo(p.x, p.y);
            } else if (cmd === PathVerb.Cubic) {
                const cp1 = new DOMPoint(cmds[i++], cmds[i++]);
                const cp2 = new DOMPoint(cmds[i++], cmds[i++]);
                const p = new DOMPoint(cmds[i++], cmds[i++]);
                path.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p.x, p.y);
            } else if (cmd === PathVerb.Quad) {
                const cp = new DOMPoint(cmds[i++], cmds[i++]);
                const p = new DOMPoint(cmds[i++], cmds[i++]);
                path.quadraticCurveTo(cp.x, cp.y, p.x, p.y);
            } else if (cmd === PathVerb.Close) {
                path.closePath();
            }
        }
        return path;
    }

    close() {
        if (this.subpathStart) {
            this.lineTo(this.subpathStart);
            this.closeContour();
            this.addContour();
        }
        return this;
    }

    toCmds() {
        return this.contours.flatMap((c) => c.toCmds());
    }

    toSVGString() {
        return this.contours
            .map((c) => c.toSVGString())
            .join(" ")
            .trim();
    }
}

export interface TightBounds {
    computeTightBounds(): Float32Array;
}

export const computeTightBounds = (col: TightBounds[]) => {
    // Initialize with the bounds of the first object
    let [top, left, bottom, right] = col[0].computeTightBounds();

    for (const obj of col) {
        const [currTop, currLeft, currBottom, currRight] = obj.computeTightBounds();

        // Update aggregate bounds
        top = Math.min(top, currTop);
        left = Math.min(left, currLeft);
        bottom = Math.max(bottom, currBottom);
        right = Math.max(right, currRight);
    }

    return Float32Array.of(left, top, right, bottom);
};


export abstract class Flatennable {
    private _polyline: Polyline | null = null;

    abstract createPolyline(): Polyline;

    get polyline() {
        if (this._polyline === null) {
            this._polyline = this.createPolyline();
        }
        return this._polyline;
    }

    tAtLength(length: number) {
        return this.polyline.tAtLength(length);
    }

    length(): number {
        return this.polyline.length();
    }
}

export class CubicPathComponent extends Flatennable implements PathComponent {
    type = PathComponentType.Cubic;

    constructor(
        readonly p1: DOMPoint,
        readonly cp1: DOMPoint,
        readonly cp2: DOMPoint,
        readonly p2: DOMPoint
    ) {
        super();
    }

    // alternative implementation https://gist.github.com/wcandillon/c6df05d80e036d19ad25456555912b62
    createPolyline() {
        const items = this.toQuadraticPathComponents(0.4).flatMap((quad) =>
            quad.fillPolyline()
        );
        const totalLength = items.reduce((acc, _, i) => {
            if (i === 0) {
                return 0;
            }
            return acc + dist(items[i - 1].point, items[i].point);
        }, 0);
        let offset = 0;
        for (let i = 0; i < items.length; i++) {
            if (i === 0) {
                items[0].t = 0;
                items[0].point = this.p1;
            } else if (i === items.length - 1) {
                items[i].t = 1;
                items[i].point = this.p2;
            } else {
                const prev = items[i - 1].point;
                const current = items[i].point;
                const nextOffset = saturate(offset + dist(prev, current) / totalLength);
                items[i].t = nextOffset;
                items[i].point = this.solve(items[i].t);
                offset = nextOffset;
            }
        }
        return new Polyline(items);
    }

    private toQuadraticPathComponents(accuracy: number) {
        const quads: QuadraticPathComponent[] = [];

        const maxHypot2 = 432.0 * accuracy * accuracy;

        const p1x2 = new DOMPoint(
            3.0 * this.cp1.x - this.p1.x,
            3.0 * this.cp1.y - this.p1.y
        );
        const p2x2 = new DOMPoint(
            3.0 * this.cp2.x - this.p2.x,
            3.0 * this.cp2.y - this.p2.y
        );

        const p = new DOMPoint(p2x2.x - p1x2.x, p2x2.y - p1x2.y);
        const err = p.x * p.x + p.y * p.y;

        const quadCount = Math.max(
            1,
            Math.ceil(Math.pow(err / maxHypot2, 1 / 6.0))
        );

        for (let i = 0; i < quadCount; i++) {
            const t0 = i / quadCount;
            const t1 = (i + 1) / quadCount;
            const seg = this.subsegment(t0, t1);

            const segP1x2 = new DOMPoint(
                3.0 * seg.cp1.x - seg.p1.x,
                3.0 * seg.cp1.y - seg.p1.y
            );
            const segP2x2 = new DOMPoint(
                3.0 * seg.cp2.x - seg.p2.x,
                3.0 * seg.cp2.y - seg.p2.y
            );

            const middle = new DOMPoint(
                (segP1x2.x + segP2x2.x) / 4.0,
                (segP1x2.y + segP2x2.y) / 4.0
            );

            quads.push(new QuadraticPathComponent(seg.p1, middle, seg.p2));
        }
        return quads;
    }

    private chop(t: number, side: "left" | "right") {
        const { p1: p0, cp1: p1, cp2: p2, p2: p3 } = this;

        const p01 = linearSolve(t, p0, p1);
        const p12 = linearSolve(t, p1, p2);
        const p23 = linearSolve(t, p2, p3);

        const p012 = linearSolve(t, p01, p12);
        const p123 = linearSolve(t, p12, p23);

        const p0123 = linearSolve(t, p012, p123);

        if (side === "left") {
            return new CubicPathComponent(p0, p01, p012, p0123);
        } else {
            return new CubicPathComponent(p0123, p123, p23, p3);
        }
    }

    segment(l0: number, l1: number) {
        const t0 = this.tAtLength(l1);
        const c1 = this.chop(t0, "left");
        const t1 = c1.tAtLength(l0);
        return c1.chop(t1, "right");
    }

    private subsegment(t0: number, t1: number) {
        const p0 = this.solve(t0);
        const p3 = this.solve(t1);
        const d = this.lower();
        const scale = (t1 - t0) * (1.0 / 3.0);
        const p1 = plus(p0, multiplyScalar(d.solve(t0), scale));
        const p2 = minus(p3, multiplyScalar(d.solve(t1), scale));
        return new CubicPathComponent(p0, p1, p2, p3);
    }

    private lower() {
        return new QuadraticPathComponent(
            multiplyScalar(minus(this.cp1, this.p1), 3),
            multiplyScalar(minus(this.cp2, this.cp1), 3),
            multiplyScalar(minus(this.p2, this.cp2), 3)
        );
    }

    toSVGString() {
        return `C${this.cp1.x} ${this.cp1.y} ${this.cp2.x} ${this.cp2.y} ${this.p2.x} ${this.p2.y}`;
    }

    toCmd() {
        return [
            PathVerb.Cubic,
            this.cp1.x,
            this.cp1.y,
            this.cp2.x,
            this.cp2.y,
            this.p2.x,
            this.p2.y,
        ];
    }

    solve(t: number) {
        return new DOMPoint(
            cubicSolve(t, this.p1.x, this.cp1.x, this.cp2.x, this.p2.x),
            cubicSolve(t, this.p1.y, this.cp1.y, this.cp2.y, this.p2.y)
        );
    }

    solveDerivative(t: number) {
        return normalize(
            new DOMPoint(
                cubicSolveDerivative(t, this.p1.x, this.cp1.x, this.cp2.x, this.p2.x),
                cubicSolveDerivative(t, this.p1.y, this.cp1.y, this.cp2.y, this.p2.y)
            )
        );
    }

    computeTightBounds() {
        return this.polyline.computeTightBounds();
    }
}

const cubicSolve = (
    t: number,
    p0: number,
    p1: number,
    p2: number,
    p3: number
) =>
    (1 - t) * (1 - t) * (1 - t) * p0 +
    3 * (1 - t) * (1 - t) * t * p1 +
    3 * (1 - t) * t * t * p2 +
    t * t * t * p3;

const cubicSolveDerivative = (
    t: number,
    p1: number,
    cp1: number,
    cp2: number,
    p2: number
) =>
    3 * (1 - t) * (1 - t) * (cp1 - p1) +
    6 * (1 - t) * t * (cp2 - cp1) +
    3 * t * t * (p2 - cp2);



export class LinearPathComponent implements PathComponent {
    type = PathComponentType.Linear;

    constructor(readonly p1: DOMPoint, readonly p2: DOMPoint) { }

    segment(start: number, stop: number): PathComponent {
        return new LinearPathComponent(
            this.solve(this.tAtLength(start)),
            this.solve(this.tAtLength(stop))
        );
    }

    computeTightBounds() {
        const minX = Math.min(this.p1.x, this.p2.x);
        const minY = Math.min(this.p1.y, this.p2.y);
        const maxX = Math.max(this.p1.x, this.p2.x);
        const maxY = Math.max(this.p1.y, this.p2.y);
        return Float32Array.of(minX, minY, maxX, maxY);
    }

    solve(t: number) {
        return linearSolve(t, this.p1, this.p2);
    }

    solveDerivative() {
        return linearSolveDerivative(this.p1, this.p2);
    }

    tAtLength(length: number) {
        return length / this.length();
    }

    toCmd() {
        return [PathVerb.Line, this.p2.x, this.p2.y];
    }

    toSVGString() {
        return `L${this.p2.x} ${this.p2.y}`;
    }

    length() {
        return dist(this.p1, this.p2);
    }
}
export enum PathComponentType {
    Linear,
    Quadratic,
    Cubic,
}

export interface PathComponent extends TightBounds {
    p1: DOMPoint;
    p2: DOMPoint;
    type: PathComponentType;

    toCmd(): number[];
    toSVGString(): string;

    segment(start: number, stop: number): PathComponent;

    tAtLength(length: number): number;

    length(): number;

    solve(t: number): DOMPoint;
    solveDerivative(t: number): DOMPoint;
}
export enum PathVerb {
    Move,
    Line,
    Quad,
    Conic,
    Cubic,
    Close,
}
export type PolylineItem = { t: number; point: DOMPoint };

export class Polyline {
    private readonly cumulativeLengths: number[];

    constructor(readonly items: PolylineItem[]) {
        this.cumulativeLengths = this.calculateCumulativeLengths();
    }

    length() {
        return this.cumulativeLengths[this.cumulativeLengths.length - 1];
    }

    tAtLength(length: number) {
        if (length === 0) {
            return 0;
        } else if (length === this.length()) {
            return 1;
        }
        const index = this.findIndex(length);
        if (index === -1) {
            throw new Error(`Index not found for length ${length}`);
        }
        const prev = this.items[index - 1].t;
        const next = this.items[index].t;
        const l1 = this.cumulativeLengths[index - 1];
        const l2 = this.cumulativeLengths[index];
        return lerp((length - l1) / (l2 - l1), prev, next);
    }

    private findIndex(length: number): number {
        if (length < 0 || length > this.length()) {
            throw new Error(`Length out of bounds ${length} - ${this.length()}`);
        } else if (length === this.length()) {
            return this.cumulativeLengths.length - 1;
        }

        const index = this.cumulativeLengths.findIndex((l) => l > length);
        return index;
    }

    private calculateCumulativeLengths(): number[] {
        const cumulativeLengths: number[] = [0];
        for (let i = 1; i < this.items.length; i++) {
            const previousItem = this.items[i - 1];
            const currentItem = this.items[i];
            const segmentLength = dist(currentItem.point, previousItem.point);
            cumulativeLengths[i] = cumulativeLengths[i - 1] + segmentLength;
        }
        return cumulativeLengths;
    }

    computeTightBounds() {
        if (this.items.length === 0) {
            throw new Error("The polyline has no points to determine bounds.");
        }

        let minX = this.items[0].point.x;
        let minY = this.items[0].point.y;
        let maxX = this.items[0].point.x;
        let maxY = this.items[0].point.y;

        for (const item of this.items) {
            const { x, y } = item.point;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }

        return Float32Array.of(minX, minY, maxX, maxY);
    }
}

const lerp = (t: number, a: number, b: number) => (1 - t) * a + t * b;

export const linearSolve = (t: number, p0: DOMPoint, p1: DOMPoint) =>
    new DOMPoint(lerp(t, p0.x, p1.x), lerp(t, p0.y, p1.y));

export const linearSolveDerivative = (p1: DOMPoint, p2: DOMPoint) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const magnitude = Math.hypot(dx, dy);
    return new DOMPoint(dx / magnitude, dy / magnitude);
};

const defaultCurveTolerance = 0.1;

export class QuadraticPathComponent
    extends Flatennable
    implements PathComponent {
    type = PathComponentType.Quadratic;

    constructor(
        readonly p1: DOMPoint,
        readonly cp: DOMPoint,
        readonly p2: DOMPoint
    ) {
        super();
    }

    createPolyline() {
        return new Polyline(this.fillPolyline());
    }

    fillPolyline(scaleFactor = 1) {
        const points: PolylineItem[] = [{ t: 0, point: this.p1 }];
        const tolerance = defaultCurveTolerance / scaleFactor;
        const sqrtTolerance = Math.sqrt(tolerance);

        const d01 = minus(this.cp, this.p1);
        const d12 = minus(this.p2, this.cp);
        const dd = minus(d01, d12);
        const crossV = cross(minus(this.p2, this.p1), dd);
        const x0 = (dot(d01, dd) * 1) / crossV;
        const x2 = (dot(d12, dd) * 1) / crossV;
        const scale = Math.abs(crossV / (Math.hypot(dd.x, dd.y) * (x2 - x0)));

        const a0 = approximateParabolaIntegral(x0);
        const a2 = approximateParabolaIntegral(x2);
        let val = 0.0;
        if (Number.isFinite(scale)) {
            const da = Math.abs(a2 - a0);
            const sqrtScale = Math.sqrt(scale);
            if ((x0 < 0 && x2 < 0) || (x0 >= 0 && x2 >= 0)) {
                val = da * sqrtScale;
            } else {
                const xmin = sqrtTolerance / sqrtScale;
                val = (sqrtTolerance * da) / approximateParabolaIntegral(xmin);
            }
        }
        const u0 = approximateParabolaIntegral(a0);
        const u2 = approximateParabolaIntegral(a2);
        const uScale = 1 / (u2 - u0);

        const lineCount = Math.max(1, Math.ceil((0.5 * val) / sqrtTolerance));
        const step = 1 / lineCount;
        for (let i = 1; i < lineCount; i += 1) {
            const u = i * step;
            const a = a0 + (a2 - a0) * u;
            const t = (approximateParabolaIntegral(a) - u0) * uScale;
            points.push({ t, point: this.solve(t) });
        }
        points.push({ t: 1, point: this.p2 });
        return points;
    }

    private chop(t: number, side: "left" | "right") {
        const { p1: p0, cp: p1, p2 } = this;

        const p01 = linearSolve(t, p0, p1);
        const p12 = linearSolve(t, p1, p2);
        if (side === "left") {
            return new QuadraticPathComponent(p0, p01, linearSolve(t, p01, p12));
        } else {
            return new QuadraticPathComponent(linearSolve(t, p01, p12), p12, p2);
        }
    }

    segment(l0: number, l1: number) {
        const t0 = this.tAtLength(l1);
        const q1 = this.chop(t0, "left");
        const t1 = q1.tAtLength(l0);
        return q1.chop(t1, "right");
    }

    toSVGString() {
        return `Q${this.cp.x} ${this.cp.y} ${this.p2.x} ${this.p2.y}`;
    }

    toCmd() {
        return [PathVerb.Quad, this.cp.x, this.cp.y, this.p2.x, this.p2.y];
    }

    solve(t: number) {
        return new DOMPoint(
            quadraticSolve(t, this.p1.x, this.cp.x, this.p2.x),
            quadraticSolve(t, this.p1.y, this.cp.y, this.p2.y)
        );
    }

    solveDerivative(t: number) {
        return normalize(
            new DOMPoint(
                quadraticSolveDerivative(t, this.p1.x, this.cp.x, this.p2.x),
                quadraticSolveDerivative(t, this.p1.y, this.cp.y, this.p2.y)
            )
        );
    }

    computeTightBounds() {
        return this.polyline.computeTightBounds();
    }
}

/// https://raphlinus.github.io/graphics/curves/2019/12/23/flatten-quadbez.html
const approximateParabolaIntegral = (x: number) => {
    const d = 0.67;
    return x / (1.0 - d + Math.sqrt(Math.sqrt(Math.pow(d, 4) + 0.25 * x * x)));
};

const quadraticSolve = (t: number, p0: number, p1: number, p2: number) =>
    (1 - t) * (1 - t) * p0 + //
    2 * (1 - t) * t * p1 + //
    t * t * p2;

const quadraticSolveDerivative = (
    t: number,
    p0: number,
    p1: number,
    p2: number
) =>
    2 * (1 - t) * (p1 - p0) + //
    2 * t * (p2 - p1);

export class Paint {
    private stroke = false;
    private color = "black";
    private alpha = 1;
    private blendMode: GlobalCompositeOperation = "source-over";

    private lineWidth = 1;
    private lineCap: CanvasLineCap = "butt";
    private lineJoin: CanvasLineJoin = "miter";
    private miterLimit = 10;

    private shader: Shader | null = null;
    private imageFilter: ImageFilter | null = null;

    constructor() { }

    copy() {
        const paint = new Paint();
        paint.stroke = this.stroke;
        paint.color = this.color;
        paint.alpha = this.alpha;
        paint.blendMode = this.blendMode;
        paint.lineWidth = this.lineWidth;
        paint.lineCap = this.lineCap;
        paint.lineJoin = this.lineJoin;
        paint.miterLimit = this.miterLimit;
        paint.shader = this.shader;
        paint.imageFilter = this.imageFilter;
        return paint;
    }

    setStrokeStyle(stroke: boolean) {
        this.stroke = stroke;
        return this;
    }

    setColor(color: string) {
        this.color = color;
        return this;
    }

    setAlpha(alpha: number) {
        this.alpha = alpha;
        return this;
    }

    setStrokeWidth(strokeWidth: number) {
        this.lineWidth = strokeWidth;
        return this;
    }

    getStrokeWidth() {
        return this.lineWidth;
    }

    setStrokeMiter(strokeMiter: number) {
        this.miterLimit = strokeMiter;
        return this;
    }

    getStrokeMiter() {
        return this.miterLimit;
    }

    getStrokeCap() {
        return this.lineCap;
    }

    getStrokeJoin() {
        return this.lineJoin;
    }

    setStrokeCap(strokeCap: CanvasLineCap) {
        this.lineCap = strokeCap;
        return this;
    }

    setStrokeJoin(strokeJoin: CanvasLineJoin) {
        this.lineJoin = strokeJoin;
        return this;
    }

    setBlendMode(blendMode: GlobalCompositeOperation) {
        this.blendMode = blendMode;
        return this;
    }

    setImageFilter(imageFilter: ImageFilter) {
        this.imageFilter = imageFilter;
        return this;
    }

    addImageFilter(...imageFilters: SVGFilter[]) {
        if (!this.imageFilter) {
            this.imageFilter = new ImageFilter();
        }
        for (const imageFilter of imageFilters) {
            this.imageFilter.addFilter(imageFilter);
        }
        return this;
    }

    setShader(shader: Shader | null) {
        this.shader = shader;
        return this;
    }

    applyToContext(
        ctx: RenderingContext,
        svgCtx: SVGContext,
        ctm: DOMMatrix,
        clip: Path2D | null,
        drawable: Drawable
    ) {
        ctx.save();
        if (clip) {
            ctx.clip(clip);
        }
        ctx.setTransform(ctm);
        ctx.globalAlpha = this.alpha;
        if (this.stroke) {
            ctx.strokeStyle = this.color;
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = this.lineCap;
        ctx.lineJoin = this.lineJoin;
        ctx.miterLimit = this.miterLimit;
        ctx.globalCompositeOperation = this.blendMode;

        if (this.imageFilter) {
            const { id, filters } = this.imageFilter;
            const url = svgCtx.create(id, filters);
            ctx.filter = url;
        }
        // This will fail on Safari 17 (https://bugs.webkit.org/show_bug.cgi?id=149986)
        try {
            if (this.shader) {
                // const buffer = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height);
                // const bufferCtx = buffer.getContext("2d")!;
                // bufferCtx.setTransform(ctm);
                const img = this.shader.render(ctx.canvas.width, ctx.canvas.height);
                const pattern = ctx.createPattern(img, "no-repeat")!;
                if (this.stroke) {
                    ctx.strokeStyle = pattern;
                } else {
                    ctx.fillStyle = pattern;
                }
            }
        } catch (e) { }
        drawable.draw(ctx, this.stroke);
        ctx.restore();
    }
}


export class ImageFilter extends IndexedHostObject {
    constructor(protected _filters: SVGFilter[] = []) {
        super("image-filter");
    }

    addFilter(filter: SVGFilter) {
        this._filters.push(filter);
    }

    get filters() {
        return this._filters;
    }
}

export class BlurImageFilter extends ImageFilter {
    constructor(
        readonly sigmaX: number,
        readonly sigmaY: number,
        readonly input: ImageFilter | null = null
    ) {
        super();
        const blur = makeBlur(sigmaX, sigmaY);
        this._filters.push(blur);
        if (input) {
            this._filters.push(...input.filters);
        }
    }
}


interface CanvasContext {
    matrix: DOMMatrix;
    clip: Path2D | null;
    imageFilter: ImageFilter | null;
    renderingCtx: RenderingContext;
}

export class Canvas extends IndexedHostObject {
    private stack: CanvasContext[] = [];
    private svgCtx: SVGContext;

    constructor(renderingCtx: RenderingContext) {
        super("canvas");
        this.stack.push({
            matrix: new DOMMatrix(),
            clip: null,
            imageFilter: null,
            renderingCtx,
        });
        this.svgCtx = new SVGContext(this.id);
    }

    get ctx() {
        return this.stack[this.stack.length - 1];
    }

    save(imageFilter?: ImageFilter) {
        const isLayer = imageFilter !== undefined;
        this.stack.push({
            matrix: DOMMatrix.fromMatrix(this.ctx.matrix),
            clip: this.ctx.clip ? new Path2D(this.ctx.clip) : null,
            imageFilter: imageFilter ?? null,
            renderingCtx: isLayer ? this.makeLayer() : this.ctx.renderingCtx,
        });
    }

    concat(matrix: DOMMatrix) {
        this.ctx.matrix.multiplySelf(matrix);
    }

    resetMatrix() {
        this.ctx.matrix = new DOMMatrix();
    }

    getMatrix() {
        return DOMMatrix.fromMatrix(this.ctx.matrix);
    }

    clip(path: Path) {
        const p = path.getPath2D();
        if (this.ctx.clip) {
            this.ctx.clip.addPath(p);
        } else {
            this.ctx.clip = path.getPath2D();
        }
    }

    restore() {
        const { imageFilter, renderingCtx } = this.ctx;
        this.stack.pop();
        if (imageFilter) {
            const paint = new Paint();
            paint.setImageFilter(imageFilter);
            paint.applyToContext(
                this.ctx.renderingCtx,
                this.svgCtx,
                new DOMMatrix(),
                this.ctx.clip,
                new DrawableImage(
                    renderingCtx instanceof OffscreenCanvasRenderingContext2D
                        ? renderingCtx.canvas.transferToImageBitmap()
                        : renderingCtx.canvas
                )
            );
        }
    }

    draw(drawable: Drawable, paint: Paint) {
        paint.applyToContext(
            this.ctx.renderingCtx,
            this.svgCtx,
            this.ctx.matrix,
            this.ctx.clip,
            drawable
        );
    }

    drawPath(path: Path, paint: Paint) {
        paint.applyToContext(
            this.ctx.renderingCtx,
            this.svgCtx,
            this.ctx.matrix,
            this.ctx.clip,
            new DrawablePath(path.getPath2D())
        );
    }

    private makeLayer() {
        const canvas = new OffscreenCanvas(
            this.ctx.renderingCtx.canvas.width,
            this.ctx.renderingCtx.canvas.height
        );
        const ctx = canvas.getContext("2d")!;
        if (!ctx) {
            throw new Error("Failed to create canvas context");
        }
        ctx.drawImage(this.ctx.renderingCtx.canvas, 0, 0);
        return ctx;
    }
}
