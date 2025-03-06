export function createDomCanvasElement(width?: number, height?: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    if (width) canvas.width = width;
    if (height) canvas.height = height;
    return canvas;
}