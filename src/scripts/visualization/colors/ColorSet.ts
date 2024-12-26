import Color from "colorjs.io";
import { SymbolicColor } from "../colors/SymbolicColor";

export class ColorSet {
	private map: Map<SymbolicColor, Color>;

	public constructor(
		map: Iterable<readonly [SymbolicColor, Color]>,
		private readonly defaultValue: Color
	) {
		this.map = new Map<SymbolicColor, Color>();

		for (const item of map) {
			this.map.set(item[0], item[1]);
		}
	}

	public get(color: SymbolicColor | undefined): Color {
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

	public set(color: SymbolicColor, value: Color): void {
		this.map.set(color, value);
	}

	public static fromJSON(source: string): ColorSet;
	public static fromJSON(source: object): ColorSet;
	public static fromJSON(source: Array<[SymbolicColor, string]>, defaultValue: Color): ColorSet;
	public static fromJSON(source: any, defaultValue?: Color): ColorSet {
		let parsed = typeof source === "string" ? JSON.parse(source) : source;

		if (parsed instanceof Array) {
			if (defaultValue != undefined)
				return new ColorSet(parsed, defaultValue);
			else
				throw new Error("Default value not defined with Array-type source when parsing ColorSet");
		}
		else if (typeof parsed === "object") {
			let data = parsed.data;
			let defaultValue = parsed.defaultValue;

			if (data instanceof Array && typeof defaultValue === "string")
				return new ColorSet(data.map(value => [value[0], new Color(value[1])]), new Color(defaultValue));
			else
				throw new Error("Attempted to parse invalid ColorSet object");
		}
		else {
			throw new Error("Attempted to parse ColorSet from unsupported format");
		}
	}

	public toJSON(): string {
		return JSON.stringify(this.toSerializableObject());
	}

	public toSerializableObject() {
		return {
			data: this.toSerializableArray(),
			defaultValue: this.defaultValue.toString()
		};
	}

	public toArray(): Array<[SymbolicColor, Color]> {
		const result = new Array<[SymbolicColor, Color]>();

		for (const item of this.map) {
			result.push(item);
		}

		return result;
	}

	public toSerializableArray(): Array<[SymbolicColor, string]> {
		return this.toArray().map(value => [value[0], value[1].toString()]);
	}

	public static getDefaultLight(): ColorSet {
		return new ColorSet([
			[SymbolicColor.Simulator_Background, new Color("transparent")],
			[SymbolicColor.Simulator_Foreground, new Color("black")],
			[SymbolicColor.Element_Background, new Color("white")],
			[SymbolicColor.Element_Foreground, new Color("black")],
			[SymbolicColor.Element_Border, new Color("black")],
			[SymbolicColor.Element_Sorted, new Color("grey")],
			[SymbolicColor.Element_OrderCorrect, new Color("limegreen")],
			[SymbolicColor.Element_OrderIncorrect, new Color("crimson")],
			[SymbolicColor.Element_Highlight_1, new Color("blue")],
			[SymbolicColor.Element_Highlight_2, new Color("green")],
			[SymbolicColor.Element_Highlight_3, new Color("red")],
			[SymbolicColor.Code_ActiveLine, new Color("rgba(255, 255, 0, 0.5)")],
			[SymbolicColor.Variable_1, new Color("blue")],
			[SymbolicColor.Variable_2, new Color("green")],
			[SymbolicColor.Variable_3, new Color("red")],
			[SymbolicColor.Variable_4, new Color("cyan")],
		], new Color("white"));
	}

	public static getDefaultDark(): ColorSet {
		return new ColorSet([
			[SymbolicColor.Simulator_Background, new Color("transparent")],
			[SymbolicColor.Simulator_Foreground, new Color("black")],
			[SymbolicColor.Element_Background, new Color("white")],
			[SymbolicColor.Element_Foreground, new Color("black")],
			[SymbolicColor.Element_Border, new Color("black")],
			[SymbolicColor.Element_Sorted, new Color("grey")],
			[SymbolicColor.Element_OrderCorrect, new Color("limegreen")],
			[SymbolicColor.Element_OrderIncorrect, new Color("crimson")],
			[SymbolicColor.Element_Highlight_1, new Color("blue")],
			[SymbolicColor.Element_Highlight_2, new Color("green")],
			[SymbolicColor.Element_Highlight_3, new Color("red")],
			[SymbolicColor.Code_ActiveLine, new Color("rgba(255, 255, 0, 0.5)")],
			[SymbolicColor.Variable_1, new Color("blue")],
			[SymbolicColor.Variable_2, new Color("green")],
			[SymbolicColor.Variable_3, new Color("red")],
			[SymbolicColor.Variable_4, new Color("cyan")],
		], new Color("white"));
	}
}
