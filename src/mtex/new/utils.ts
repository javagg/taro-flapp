export const resolveContext = (
    canvas: string | HTMLCanvasElement,
    options?: CanvasRenderingContext2DSettings
) => {
    let resolved: HTMLCanvasElement;
    if (typeof canvas === "string") {
        const el = document.getElementById(canvas) as HTMLCanvasElement;
        if (!el) {
            return null;
        }
        resolved = el;
    } else {
        resolved = canvas;
    }
    return resolved.getContext("2d", options);
};

export const createTexture = (
    width: number,
    height: number,
    options?: CanvasRenderingContext2DSettings
) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d", options);
    if (!ctx) {
        throw new Error("Could not create 2d context");
    }
    return ctx;
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
