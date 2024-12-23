export const enum SymbolicColor {
	Element_Sorted = "element-sorted",
	Element_OrderCorrect = "element-order_correct",
	Element_OrderIncorrect = "element-order_incorrect",
	Element_Highlight_1 = "element-highlight_1",
	Element_Highlight_2 = "element-highlight_2",
	Element_Highlight_3 = "element-highlight_3",
	Code_ActiveLine = "code-line_active",
	Variable_1 = "variable-1",
	Variable_2 = "variable-2",
	Variable_3 = "variable-3",
	Variable_4 = "variable-4",
}

export class SymbolicColorHelper {
	public static getCssClass(color: SymbolicColor): string {
		return color;
	}

	public static getCssColorVar(color: SymbolicColor): string {
		return `--color-${color}`;
	}
}
