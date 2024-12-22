export const enum RendererHighlight {
	Highlight_1,
	Highlight_2,
	Highlight_3,
	Sorted,
	ElementOrderCorrect,
	ElementOrderSwapped,
}

export const enum CodeHighlight {
	ActiveLine,
}

export const enum VariableColor {
	Variable_1,
	Variable_2,
	Variable_3,
	Variable_4
}

// Map index -> symbolic color
export type RendererHighlights = Map<number, RendererHighlight>;
export type CodeHighlights = Map<number, CodeHighlight>;
