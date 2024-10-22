export const inputPresetDivClass: string = "input_parameter_module";

/** Class which is set to elements associated with a parameter in case of a problem with the parameter. */
export const problemInputClass: string = "problem_input";
export const problemDescriptionDivClass: string = "problem_description";

export const inputWrapperClass: string = "input_wrapper";

export const codeHighlightClass: string = "code-highlight";

export enum CssRendererClass {
	Element = "element",
	Highlight_1 = "renderer_highlight1",
	Highlight_2 = "renderer_highlight2",
	Highlight_3 = "renderer_highlight3",
    Sorted = "renderer_sorted",
    ElementOrderCorrect = "renderer_order_correct",
    ElementOrderSwapped = "renderer_order_swapped",
}

export enum CssVariables {
	RendererDivMaxWidth = "--div-max-width",
}