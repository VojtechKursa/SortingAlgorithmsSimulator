import { SymbolicColor } from "./colors/SymbolicColor";

/**
 * A map that maps an index in some array to a highlight defined by a SymbolicColor.
 *
 * @see {@link SymbolicColor}
 */
export type Highlights = Map<number, SymbolicColor>;


/**
 * A read-only map that maps an index in some array to a highlight defined by a SymbolicColor.
 *
 * @see {@link SymbolicColor}
 */
export type ReadOnlyHighlights = ReadonlyMap<number, SymbolicColor>;
