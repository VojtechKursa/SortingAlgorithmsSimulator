// TODO: Reorganize

export const inputPresetDivClass: string = "input_parameter_module";

/** Class which is set to elements associated with a parameter in case of a problem with the parameter. */
export const problemInputClass: string = "problem_input";
export const problemDescriptionDivClass: string = "problem_description";

export const inputWrapperClass: string = "input_wrapper";

export const codeHighlightClass: string = "code-highlight";

export const enum RendererHighlight {
	Highlight_1,
	Highlight_2,
	Highlight_3,
	Sorted,
	ElementOrderCorrect,
	ElementOrderSwapped,
}

export const enum CodeHighlight {
	CodeHighlight_1,
}

export class RendererHighlightCssHelper {
	public static getCssClass(highlight: RendererHighlight): string {
		switch (highlight) {
			case RendererHighlight.Highlight_1: return "renderer_highlight1";
			case RendererHighlight.Highlight_2: return "renderer_highlight2";
			case RendererHighlight.Highlight_3: return "renderer_highlight3";
			case RendererHighlight.Sorted: return "renderer_sorted";
			case RendererHighlight.ElementOrderCorrect: return "renderer_order_correct";
			case RendererHighlight.ElementOrderSwapped: return "renderer_order_swapped";
		}
	}

	public static getCssColorVariable(highlight: RendererHighlight): string {
		return `--${RendererHighlightCssHelper.getCssClass(highlight)}-color`;
	}
}

export const rendererElementClass: string = "element";

export const enum CssVariables {
	RendererDivMaxWidth = "--div-max-width",
}