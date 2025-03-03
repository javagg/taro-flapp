export declare const colorToHex: (rgbaColor: Float32Array) => string;
export declare const valueOfRGBAInt: (r: number, g: number, b: number, a: number) => Float32Array;
export declare const valueOfRectXYWH: (x: number, y: number, w: number, h: number) => Float32Array;
export declare function isEnglishWord(str: string): boolean;
export declare function isSquareCharacter(str: string): boolean;
export declare function isPunctuation(char: string): boolean;
export declare function convertToUpwardToPixelRatio(number: number, pixelRatio: number): number;
export declare function createCanvas(width: number, height: number): HTMLCanvasElement;
