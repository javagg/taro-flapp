/**
 * The different ways of measuring the width of text.
 */
export enum TextWidthBasis {
    /** The text width is set to the width of the widest line. */
    parent,

    /** The text width is set to the width of the longest line that doesn't exceed the maximum width. */
    longestLine,
}

/**
 * The different ways of positioning the text within its parent.
 */
export enum TextAlign {
    left,
    right,
    center,
    justify,
    start,
    end,
}

/**
 * The different ways of handling visual overflow.
 */
export enum TextOverflow {
    /** Clip the overflowing text to fix its container. */
    clip,

    /** Fade the overflowing text to transparent. */
    fade,

    /** Use an ellipsis to indicate that the text has overflowed. */
    ellipsis,

    /** Render overflowing text outside of its container. */
    visible,
}

/**
 * A style that can be applied to a span of text.
 */
export class EngineTextStyle {
    /** The color to use when painting the text. */
    color?: Color;

    /** The name of the font to use when painting the text. */
    fontFamily?: string;

    /** The size of glyphs to use when painting the text. */
    fontSize?: number;

    /** The font weight to use when painting the text. */
    fontWeight?: FontWeight;

    /** The font style to use when painting the text. */
    fontStyle?: FontStyle;

    /** The amount of space to add between each letter. */
    letterSpacing?: number;

    /** The amount of space to add between each word. */
    wordSpacing?: number;

    /** The common height to use for all text lines. */
    height?: number;

    /** The text decorations to paint. */
    decoration?: TextDecoration;

    /** The color to use when painting the text decorations. */
    decorationColor?: Color;

    /** The style of text decorations. */
    decorationStyle?: TextDecorationStyle;

    /** The thickness of the text decorations. */
    decorationThickness?: number;

    /** Additional features to use when rendering the font. */
    fontFeatures?: FontFeature[];

    /** Font variations to use when rendering the font. */
    fontVariations?: FontVariation[];

    /** The locale used to select region-specific glyphs. */
    locale?: string;

    /** The background color to paint behind the text. */
    background?: Paint;

    /** The color to use for drawing the text and decorations. */
    foreground?: Paint;

    /** The shadows to paint under the text. */
    shadows?: Shadow[];
}

/**
 * Style information used for paragraphs.
 */
export interface EngineParagraphStyle {
    /** The text alignment. */
    textAlign?: TextAlign;

    /** The text direction. */
    textDirection?: TextDirection;

    /** The maximum number of lines the paragraph can have. */
    maxLines?: number;

    /** The strategy for breaking the text into lines. */
    textHeightBehavior?: ui.TextHeightBehavior;

    /** The string used to ellipsize overflowing text. */
    ellipsis?: string;

    /** The height of each line of text, as a multiple of the font size. */
    height?: number;

    /** The strategy for measuring the width of the text. */
    textWidthBasis?: TextWidthBasis;

    /** The font family to use as a default. */
    fontFamily?: string;

    /** The size of glyphs to use when painting the text. */
    fontSize?: number;

    /** The font weight to use when painting the text. */
    fontWeight?: ui.FontWeight;

    /** The font style to use when painting the text. */
    fontStyle?: ui.FontStyle;

    /** The strategy for handling visual overflow. */
    overflow?: TextOverflow;

    /** The locale used to select region-specific glyphs. */
    locale?: string;

    /** The common height to use for all text lines. */
    strutStyle?: ui.StrutStyle;
}

export class ParagraphPlaceholder {
    constructor(
        readonly width: number,
        readonly height: number,
        readonly alignment: PlaceholderAlignment,
        readonly baseline: TextBaseline = TextBaseline.alphabetic,
        readonly baselineOffset: number = 0,
    ) { }
}
/**
 * A span that represents a placeholder in the text.
 */
export class PlaceholderSpan extends ParagraphSpan {
    constructor(
        style: EngineTextStyle,
        start: number,
        end: number,
        readonly width: number,
        readonly height: number,
        readonly alignment: PlaceholderAlignment,
        options: {
            baselineOffset: number;
            baseline: TextBaseline;
        }
    ) {
        super({ style, start, end });
        this.baselineOffset = options.baselineOffset;
        this.baseline = options.baseline;
    }

    /** The width of the placeholder. */
    readonly width: number;

    /** The height of the placeholder. */
    readonly height: number;

    /** How to align the placeholder with the text. */
    readonly alignment: ui.PlaceholderAlignment;

    /** The distance from the top of the placeholder to its baseline. */
    readonly baselineOffset: number;

    /** Which baseline to align to. */
    readonly baseline: ui.TextBaseline;

    override get isPlaceholder(): boolean {
        return true;
    }
}

/**
 * A node in the style inheritance tree.
 */
export class StyleNode {
    constructor(
        readonly parent: StyleNode | null,
        readonly style: EngineTextStyle
    ) { }

    /** Creates a new child node with the given style. */
    createChild(style: EngineTextStyle): StyleNode {
        return new StyleNode(this, style);
    }

    /** Resolves the full style by combining this node's style with its ancestors'. */
    resolveStyle(): EngineTextStyle {
        const styles: EngineTextStyle[] = [];
        let node: StyleNode | null = this;
        while (node != null) {
            styles.unshift(node.style);
            node = node.parent;
        }
        return Object.assign({}, ...styles);
    }
}

/**
 * The root node of a style inheritance tree.
 */
export class RootStyleNode extends StyleNode {
    constructor(paragraphStyle: EngineParagraphStyle) {
        super(null, {
            fontFamily: paragraphStyle.fontFamily,
            fontSize: paragraphStyle.fontSize,
            fontWeight: paragraphStyle.fontWeight,
            fontStyle: paragraphStyle.fontStyle,
            height: paragraphStyle.height,
            locale: paragraphStyle.locale,
        });
    }
}

/**
 * Applies the given text style to a DOM element.
 */
export function applyTextStyleToElement(options: {
    element: DomElement;
    style: EngineTextStyle;
}): void {
    const { element, style } = options;
    const cssStyle = element.style;

    if (style.color != null) {
        cssStyle.color = style.color.toString();
    }

    if (style.decoration != null) {
        const decoration = style.decoration;
        const decorationColor = style.decorationColor;
        const decorationStyle = style.decorationStyle;
        const decorationThickness = style.decorationThickness;

        let textDecoration = '';
        if ((decoration & ui.TextDecoration.underline) !== 0) {
            textDecoration += ' underline';
        }
        if ((decoration & ui.TextDecoration.overline) !== 0) {
            textDecoration += ' overline';
        }
        if ((decoration & ui.TextDecoration.lineThrough) !== 0) {
            textDecoration += ' line-through';
        }
        cssStyle.textDecoration = textDecoration.trim();

        if (decorationColor != null) {
            cssStyle.textDecorationColor = decorationColor.toString();
        }
        if (decorationStyle != null) {
            switch (decorationStyle) {
                case ui.TextDecorationStyle.dashed:
                    cssStyle.textDecorationStyle = 'dashed';
                    break;
                case ui.TextDecorationStyle.dotted:
                    cssStyle.textDecorationStyle = 'dotted';
                    break;
                case ui.TextDecorationStyle.double:
                    cssStyle.textDecorationStyle = 'double';
                    break;
                case ui.TextDecorationStyle.solid:
                    cssStyle.textDecorationStyle = 'solid';
                    break;
                case ui.TextDecorationStyle.wavy:
                    cssStyle.textDecorationStyle = 'wavy';
                    break;
            }
        }
        if (decorationThickness != null) {
            cssStyle.textDecorationThickness = `${decorationThickness}px`;
        }
    }

    if (style.fontSize != null) {
        cssStyle.fontSize = `${style.fontSize}px`;
    }

    let fontFamily = style.fontFamily;
    if (fontFamily != null) {
        fontFamily = fontFamily.trim();
        if (fontFamily.indexOf(' ') >= 0 && !fontFamily.startsWith('"') && !fontFamily.endsWith('"')) {
            fontFamily = `"${fontFamily}"`;
        }
        cssStyle.fontFamily = fontFamily;
    }

    if (style.fontWeight != null) {
        cssStyle.fontWeight = style.fontWeight.toString();
    }

    if (style.fontStyle != null) {
        switch (style.fontStyle) {
            case ui.FontStyle.normal:
                cssStyle.fontStyle = 'normal';
                break;
            case ui.FontStyle.italic:
                cssStyle.fontStyle = 'italic';
                break;
        }
    }

    if (style.height != null) {
        cssStyle.lineHeight = style.height.toString();
    }

    if (style.letterSpacing != null) {
        cssStyle.letterSpacing = `${style.letterSpacing}px`;
    }

    if (style.wordSpacing != null) {
        cssStyle.wordSpacing = `${style.wordSpacing}px`;
    }

    if (style.shadows != null) {
        cssStyle.textShadow = style.shadows
            .map(shadow => {
                return `${shadow.offset.dx}px ${shadow.offset.dy}px ${shadow.blurRadius}px ${shadow.color}`;
            })
            .join(',');
    }

    if (style.background != null) {
        cssStyle.backgroundColor = style.background.toString();
    }

    if (style.foreground != null) {
        cssStyle.color = style.foreground.toString();
    }
}

/**
 * Converts a TextAlign value to its CSS equivalent.
 */
export function textAlignToCssValue(textAlign: TextAlign, textDirection: TextDirection): string {
    switch (textAlign) {
        case TextAlign.left:
            return 'left';
        case TextAlign.right:
            return 'right';
        case TextAlign.center:
            return 'center';
        case TextAlign.justify:
            return 'justify';
        case TextAlign.start:
            return textDirection === TextDirection.rtl ? 'right' : 'left';
        case TextAlign.end:
            return textDirection === TextDirection.rtl ? 'left' : 'right';
        default:
            return 'left';
    }
} 