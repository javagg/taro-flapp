export const createTexture = (
    width: number,
    height: number,
    options?: CanvasRenderingContext2DSettings,
    offscreen = false,
) => {
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    if (offscreen) {
        canvas = new OffscreenCanvas(width, height);
    } else {
        canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
    }
    const ctx = canvas.getContext("2d", options);
    if (!ctx) {
        throw new Error("Could not create 2d context");
    }
    return ctx;
};

export const resolveContext = (
    idOrElement: string | HTMLCanvasElement | OffscreenCanvas,
    options?: CanvasRenderingContext2DSettings
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null => {
    let canvas = idOrElement;
    let resolved: HTMLCanvasElement | OffscreenCanvas;
    const isHTMLCanvas = typeof HTMLCanvasElement !== 'undefined' && canvas instanceof HTMLCanvasElement;
    const isOffscreenCanvas = typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas;
    if (!isHTMLCanvas && !isOffscreenCanvas) {
        const el = document.getElementById(idOrElement as string);
        if (!el) {
            // throw 'Canvas with id ' + idOrElement + ' was not found';
            return null;
        } else {
            resolved = el
        }
    } else {
        resolved = idOrElement;
    }
    // Maybe better to use clientWidth/height.  See:
    // https://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html
    // var surface = CanvasKit.MakeSurface(canvas.width, canvas.height);
    // if (surface) {
    //   surface._canvas = canvas;
    // }
    // return surface;

    // let resolved: HTMLCanvasElement;
    // if (typeof canvas === "string") {
    //     const el = document.getElementById(canvas) as HTMLCanvasElement;
    //     if (!el) {
    //         return null;
    //     }
    //     resolved = el;
    // } else {
    //     resolved = canvas;
    // }
    return resolved.getContext("2d", options);
};

export const clampColorComp = (c: number) => {
    return Math.round(Math.max(0, Math.min(c || 0, 255)));
};

export const colorAsInt = (r: number, g: number, b: number, a = 1) => {
    // default to opaque
    if (a === undefined) {
        a = 255;
    }
    // This is consistent with how Skia represents colors in C++, as an unsigned int.
    // This is also consistent with how Flutter represents colors:
    return (
        ((clampColorComp(a) << 24) |
            (clampColorComp(r) << 16) |
            (clampColorComp(g) << 8) |
            ((clampColorComp(b) << 0) & 0xfffffff)) >>>
        0
    ); // This makes the value an unsigned int.
};

export const dist = (p1: DOMPoint, p2: DOMPoint) =>
    Math.hypot(p2.x - p1.x, p2.y - p1.y);

export const vec = (x: number, y: number) => new DOMPoint(x, y);

export const equals = (p1: DOMPoint, p2: DOMPoint) =>
    p1.x === p2.x && p1.y === p2.y;

export const plus = (p1: DOMPoint, p2: DOMPoint) =>
    new DOMPoint(p1.x + p2.x, p1.y + p2.y);

export const minus = (p1: DOMPoint, p2: DOMPoint) =>
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
