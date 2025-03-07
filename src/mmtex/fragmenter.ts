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
}


/**
 * Base class for text fragmenters.
 * 
 * A fragmenter breaks text into smaller pieces based on specific criteria.
 */
export abstract class TextFragmenter {
    constructor(protected readonly text: string) { }

    /**
     * Fragments the text into a list of fragments.
     */
    abstract fragment(): TextFragment[];
}