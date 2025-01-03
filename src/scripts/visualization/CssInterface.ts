// TODO: Reorganize

export const inputPresetDivClass: string = "input_parameter_module";

/** Class which is set to elements associated with a parameter in case of a problem with the parameter. */
export const problemInputClass: string = "problem_input";
export const problemDescriptionDivClass: string = "problem_description";

export const inputWrapperClass: string = "input_wrapper";

export class VariableWatchClasses {
	public static readonly row = "variable_watch-row";
	public static readonly nameColumn = "variable_watch-var_name";
	public static readonly valueColumn = "variable_watch-var_value";
}

export class RendererClasses {
	public static readonly elementClass: string = "array_item";
	public static readonly elementValueClass: string = "value";
	public static readonly elementIndexClass: string = "index";
	public static readonly variableWrapperClass: string = "variable-wrapper";
	public static readonly variableTextClass: string = "variable-text";
	public static readonly variablePointerClass: string = "variable-pointer";
}
