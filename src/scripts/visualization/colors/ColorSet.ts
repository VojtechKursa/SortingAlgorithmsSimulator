import { SymbolicColor } from "../colors/SymbolicColor";

export class ColorSet {
	private map: Map<SymbolicColor, string>;
	private defaultValue: string;

	public constructor(map: Iterable<readonly [SymbolicColor, string]>, defaultValue: string) {
		this.map = new Map<SymbolicColor, string>();

		for (const item of map) {
			this.map.set(item[0], item[1]);
		}

		this.defaultValue = defaultValue;
	}

	public get(color: SymbolicColor | undefined): string {
		if (color == undefined)
			return this.defaultValue;

		let result = this.map.get(color);

		if (result == undefined) {
			return this.defaultValue;
		}
		else {
			return result;
		}
	}

	public set(color: SymbolicColor, value: string): void {
		this.map.set(color, value);
	}

	public static fromJSON(source: string): ColorSet;
	public static fromJSON(source: any): ColorSet;
	public static fromJSON(source: any): ColorSet {
		if (typeof source == "string") {
			let obj = JSON.parse(source);
			return new ColorSet(obj.data, obj.defaultValue);
		}
		else {
			return new ColorSet(source.data, source.defaultValue);
		}
	}

	public toJSON(): string {
		return JSON.stringify(this.toSerializableObject());
	}

	public toSerializableObject() {
		return {
			data: this.toArray(),
			defaultValue: this.defaultValue
		};
	}

	public toArray(): Array<[SymbolicColor, string]> {
		const resultBuilder = new Array<[SymbolicColor, string]>();

		for (const item of this.map) {
			resultBuilder.push(item);
		}

		return resultBuilder;
	}

	public static getDefaultLight(): ColorSet {
		return new ColorSet([
			[SymbolicColor.Simulator_Background, "transparent"],
			[SymbolicColor.Simulator_Foreground, "black"],
			[SymbolicColor.Element_Background, "white"],
			[SymbolicColor.Element_Foreground, "black"],
			[SymbolicColor.Element_Border, "black"],
			[SymbolicColor.Element_Sorted, "grey"],
			[SymbolicColor.Element_OrderCorrect, "limegreen"],
			[SymbolicColor.Element_OrderIncorrect, "crimson"],
			[SymbolicColor.Element_Highlight_1, "blue"],
			[SymbolicColor.Element_Highlight_2, "green"],
			[SymbolicColor.Element_Highlight_3, "red"],
			[SymbolicColor.Code_ActiveLine, "#ffff007f"],
			[SymbolicColor.Variable_1, "blue"],
			[SymbolicColor.Variable_2, "green"],
			[SymbolicColor.Variable_3, "red"],
			[SymbolicColor.Variable_4, "cyan"],
		], "white");
	}

	public static getDefaultDark(): ColorSet {
		return new ColorSet([
			[SymbolicColor.Simulator_Background, "transparent"],
			[SymbolicColor.Simulator_Foreground, "black"],
			[SymbolicColor.Element_Background, "white"],
			[SymbolicColor.Element_Foreground, "black"],
			[SymbolicColor.Element_Border, "black"],
			[SymbolicColor.Element_Sorted, "grey"],
			[SymbolicColor.Element_OrderCorrect, "limegreen"],
			[SymbolicColor.Element_OrderIncorrect, "crimson"],
			[SymbolicColor.Element_Highlight_1, "blue"],
			[SymbolicColor.Element_Highlight_2, "green"],
			[SymbolicColor.Element_Highlight_3, "red"],
			[SymbolicColor.Code_ActiveLine, "#ffff007f"],
			[SymbolicColor.Variable_1, "blue"],
			[SymbolicColor.Variable_2, "green"],
			[SymbolicColor.Variable_3, "red"],
			[SymbolicColor.Variable_4, "cyan"],
		], "white");
	}
}
