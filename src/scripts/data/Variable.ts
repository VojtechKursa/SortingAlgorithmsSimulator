import { SymbolicColor } from "../visualization/colors/SymbolicColor";

/**
 * Represents a variable in an algorithm.
 */
export class Variable {
	/**
	 * The index at which the variable should be drawn. Null if the variable should not be drawn.
	 */
	public readonly drawAtIndex: number | null;

	/**
	 * @param name - The name of the variable.
	 * @param value - The value of the variable.
	 * @param color - The color to use when drawing the variable graphically. Null to forbid drawing.
	 * @param drawAtIndex - The index at which the variable should be drawn. Null to forbid drawing.
	 * 						Undefined to use the of the variable value as the index (if the value is a number).
	 */
	public constructor(
		public readonly name: string,
		public readonly value: any,
		public readonly color: SymbolicColor | null = null,
		drawAtIndex: number | null | undefined = undefined
	) {
		if (drawAtIndex == undefined) {
			if (typeof value === "number" && this.color != null)
				this.drawAtIndex = value;
			else
				this.drawAtIndex = null;
		}
		else
			this.drawAtIndex = drawAtIndex;
	}

	/**
	 * Determines whether the variable should be drawn.
	 * @returns True if the variable should be drawn, false otherwise.
	 */
	public shouldDraw(): boolean {
		return this.getDrawInformation() != null;
	}

	/**
	 * Gets the information needed to draw the variable.
	 * @returns The information needed to draw the variable, or null if the variable should not be drawn.
	 */
	public getDrawInformation(): VariableDrawInformation | null {
		if (this.drawAtIndex != null && this.color != null)
			return new VariableDrawInformation(this.name, this.drawAtIndex, this.color);
		else
			return null;
	}
};

/**
 * Represents the information needed to draw a variable graphically.
 * @see {@link Variable}
 */
export class VariableDrawInformation {
	/**
	 * @param variableName - The name of the variable.
	 * @param drawAtIndex - The index at which the variable should be drawn.
	 * @param color - The color to use when drawing the variable graphically.
	 */
	public constructor(
		public readonly variableName: string,
		public readonly drawAtIndex: number,
		public readonly color: SymbolicColor
	) { }
}