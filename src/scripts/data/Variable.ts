import { SymbolicColor } from "../visualization/colors/SymbolicColor";

export class Variable {
	public readonly drawAtIndex: number | null;

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

	public shouldDraw(): boolean {
		return this.getDrawInformation() != null;
	}

	public getDrawInformation(): VariableDrawInformation | null {
		if (this.drawAtIndex != null && this.color != null)
			return new VariableDrawInformation(this.name, this.drawAtIndex, this.color);
		else
			return null;
	}
};

export class VariableDrawInformation {
	public constructor(
		public readonly variableName: string,
		public readonly drawAtIndex: number,
		public readonly color: SymbolicColor
	) { }
}