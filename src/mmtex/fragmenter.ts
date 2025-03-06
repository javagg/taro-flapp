import { LineBreakType } from './line_breaker';

/**
 * A fragment of text with associated metadata.
 */
export abstract class TextFragment {
    constructor(
        readonly start: number,
        readonly end: number,
    ) { }

    /**
     * Whether this fragment's range overlaps with the given range.
     */
    overlapsWith(start: number, end: number): boolean {
        return start < this.end && this.start < end;
    }

    /**
     * The text content of this fragment.
     */
    abstract get text(): string;
}

/**
 * A fragment that represents a line break opportunity.
 */
export class LineBreakFragment extends TextFragment {
    constructor(
        start: number,
        end: number,
        readonly type: LineBreakType,
        readonly text: string,
    ) {
        super(start, end);
    }
}

/**
 * A fragment that represents text with a specific directionality.
 */
export class DirectionalityFragment extends TextFragment {
    constructor(
        start: number,
        end: number,
        readonly direction: TextDirection,
        readonly text: string,
    ) {
        super(start, end);
    }
}

/**
 * Base class for text fragmenters.
 * 
 * A fragmenter breaks text into smaller pieces based on specific criteria.
 */
export abstract class TextFragmenter<T extends TextFragment> {
    constructor(protected readonly text: string) { }

    /**
     * Fragments the text into a list of fragments.
     */
    abstract fragment(): T[];
}

/**
 * A fragmenter that combines the results of multiple fragmenters.
 */
export class CompositeFragmenter<T extends TextFragment> extends TextFragmenter<T> {
    constructor(
        text: string,
        private readonly fragmenters: TextFragmenter<T>[],
    ) {
        super(text);
    }

    fragment(): T[] {
        // Get fragments from all fragmenters
        const allFragments = this.fragmenters.flatMap(f => f.fragment());

        // Sort fragments by start position
        allFragments.sort((a, b) => a.start - b.start);

        // Merge overlapping fragments
        const mergedFragments: T[] = [];
        let current: T | null = null;

        for (const fragment of allFragments) {
            if (!current) {
                current = fragment;
                continue;
            }

            if (this._canMerge(current, fragment)) {
                current = this._merge(current, fragment);
            } else {
                mergedFragments.push(current);
                current = fragment;
            }
        }

        if (current) {
            mergedFragments.push(current);
        }

        return mergedFragments;
    }

    /**
     * Whether two fragments can be merged.
     */
    protected _canMerge(a: T, b: T): boolean {
        return a.end >= b.start;
    }

    /**
     * Merges two fragments.
     * 
     * This method should be overridden by subclasses to provide specific
     * merging behavior.
     */
    protected _merge(a: T, b: T): T {
        throw new Error('Merge not implemented');
    }
}

/**
 * A fragmenter that splits text into fragments at specified positions.
 */
export class PositionFragmenter extends TextFragmenter<TextFragment> {
    constructor(
        text: string,
        private readonly positions: number[],
    ) {
        super(text);
    }

    fragment(): TextFragment[] {
        const fragments: TextFragment[] = [];
        let start = 0;

        for (const position of this.positions) {
            if (position > start && position <= this.text.length) {
                fragments.push(new LineBreakFragment(
                    start,
                    position,
                    LineBreakType.opportunity,
                    this.text.substring(start, position),
                ));
                start = position;
            }
        }

        // Add final fragment if necessary
        if (start < this.text.length) {
            fragments.push(new LineBreakFragment(
                start,
                this.text.length,
                LineBreakType.endOfText,
                this.text.substring(start),
            ));
        }

        return fragments;
    }
} 
