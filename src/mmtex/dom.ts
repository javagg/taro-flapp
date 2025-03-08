import type {
    FontWeightEnumValues,
    AlphaTypeEnumValues, ColorTypeEnumValues, StrokeCapEnumValues,
    TextAlignEnumValues,
    TextDirectionEnumValues,
    PlaceholderAlignmentEnumValues,
    AffinityEnumValues
} from "@/mtex/canvaskit";

export function createDomCanvasElement(width?: number, height?: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    if (width) canvas.width = width;
    if (height) canvas.height = height;
    return canvas;
}

export function clampInt(value: number, min: number, max: number): number {
    if (min > max) throw new Error("min must be less than or equal to max");
    return Math.min(Math.max(value, min), max);
}

export const mapKeys = <T extends object>(obj: T) =>
    Object.keys(obj) as (keyof T)[];

const makeEnum = <T>(values: Record<Exclude<keyof T, "values">, number>): T => {
    const valueKeys = mapKeys(values)
        .filter((name) => typeof values[name] === "number")
        .map((name) => ({
            name,
            value: values[name],
        }));
    const result = Object.assign(
        {
            values: Object.assign(
                {},
                ...valueKeys.map(({ value }) => ({ [value]: { value } }))
            ),
        },
        ...valueKeys.map(({ name, value }) => ({ [name]: { value } }))
    );
    return result;
};

export enum StrokeCapEnum {
    Butt,
    Round,
    Square,
}

export const StrokeCap = makeEnum<StrokeCapEnumValues>(StrokeCapEnum);

export enum AlphaTypeEnum {
    Opaque = 1,
    Premul = 2,
    Unpremul = 3,
}
export const AlphaType = makeEnum<AlphaTypeEnumValues>(AlphaTypeEnum);

export enum ColorTypeEnum {
    //Unknown = 0,
    Alpha_8 = 1,
    RGB_565 = 2,
    //ARGB_4444 = 3,
    RGBA_8888 = 4,
    //RGB_888x = 5,
    BGRA_8888 = 6,
    RGBA_1010102 = 7,
    //BGRA_1010102 = 8,
    RGB_101010x = 9,
    //BGR_101010x = 10,
    Gray_8 = 12,
    RGBA_F16 = 14,
    RGBA_F32 = 15,
    //R8G8_unorm = 16,
    //A16_float = 16,
    //R16G16_float = 17,
    //A16_unorm = 18,
    //R16G16_unorm = 19,
    //R16G16B16A16_unorm = 20,
    //SRGBA_8888 = 21,
}
export const ColorType = makeEnum<ColorTypeEnumValues>(ColorTypeEnum);


export enum TextDirectionEnum {
    RTL,
    LTR,
}

export const TextDirection = makeEnum<TextDirectionEnumValues>(TextDirectionEnum);

export enum FontWeightEnum {
    Invisible = 0,
    Thin = 100,
    ExtraLight = 200,
    Light = 300,
    Normal = 400,
    Medium = 500,
    SemiBold = 600,
    Bold = 700,
    ExtraBold = 800,
    Black = 900,
    ExtraBlack = 1000,
}

export const FontWeight = makeEnum<FontWeightEnumValues>(FontWeightEnum);

export enum TextAlignEnum {
    Left,
    Right,
    Center,
    Justify,
    Start,
    End,
}

export const TextAlign = makeEnum<TextAlignEnumValues>(TextAlignEnum);


export enum PlaceholderAlignmentEnum {
    Baseline,
    AboveBaseline,
    BelowBaseline,
    Top,
    Bottom,
    Middle,
}

export const PlaceholderAlignment = makeEnum<PlaceholderAlignmentEnumValues>(PlaceholderAlignmentEnum);

export enum AffinityEnum {
    Upstream,
    Downstream,
}

export const Affinity = makeEnum<AffinityEnumValues>(AffinityEnum);
