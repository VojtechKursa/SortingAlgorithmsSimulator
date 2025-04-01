import Color from "colorjs.io";
import { SymbolicColor } from "./SymbolicColor";
import { SymbolicColorHelper } from "./SymbolicColorHelper";

export class ColorMap implements Iterable<[SymbolicColor, Color]> {
	private readonly map: Map<SymbolicColor, Color>;

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

	public applyCSS() {
		const root = document.documentElement;

		for (const pair of this.map) {
			root.style.setProperty(SymbolicColorHelper.getCssColorVar(pair[0]), pair[1].toString());
		}
	}

	public static fromJSON(source: string): ColorMap;
	public static fromJSON(source: object): ColorMap;
	public static fromJSON(source: Array<[SymbolicColor, string]>, defaultValue: Color): ColorMap;
	public static fromJSON(source: any, defaultValue?: Color): ColorMap {
		let parsed = typeof source === "string" ? JSON.parse(source) : source;

		if (parsed instanceof Array) {
			if (defaultValue != undefined)
				return new ColorMap(parsed, defaultValue);
			else
				throw new Error("Default value not defined with Array-type source when parsing ColorMap");
		}
		else if (typeof parsed === "object") {
			let data = parsed.data;
			let defaultValue = parsed.defaultValue;

			if (data instanceof Array && typeof defaultValue === "string")
				return new ColorMap(data.map(value => [value[0], new Color(value[1])]), new Color(defaultValue));
			else
				throw new Error("Attempted to parse invalid ColorMap object");
		}
		else {
			throw new Error("Attempted to parse ColorMap from unsupported format");
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

	public static getDefaultLight(): ColorMap {
		return new ColorMap([
			[SymbolicColor.Simulator_Background, new Color("transparent")],
			[SymbolicColor.Simulator_Foreground, new Color("black")],
			[SymbolicColor.Simulator_Border, new Color("black")],
			[SymbolicColor.Element_Background, new Color("white")],
			[SymbolicColor.Element_Foreground, new Color("black")],
			[SymbolicColor.Element_Border, new Color("black")],
			[SymbolicColor.Element_Sorted, new Color("grey")],
			[SymbolicColor.Element_OrderCorrect, new Color("limegreen")],
			[SymbolicColor.Element_OrderIncorrect, new Color("crimson")],
			[SymbolicColor.Element_Highlight_1, new Color("#42a5f5")],
			[SymbolicColor.Element_Highlight_2, new Color("#66bb6a")],
			[SymbolicColor.Element_Highlight_3, new Color("red")],
			[SymbolicColor.Element_Unimportant, new Color("#d3d3d3")],
			[SymbolicColor.Code_ActiveLine, new Color("rgba(255, 255, 0, 0.5)")],
			[SymbolicColor.Variable_1, new Color("#42a5f5")],
			[SymbolicColor.Variable_2, new Color("#66bb6a")],
			[SymbolicColor.Variable_3, new Color("red")],
			[SymbolicColor.Variable_4, new Color("cyan")],
		], new Color("white"));
	}

	public static getDefaultDark(): ColorMap {
		return new ColorMap([
			[SymbolicColor.Simulator_Background, new Color("transparent")],
			[SymbolicColor.Simulator_Foreground, new Color("white")],
			[SymbolicColor.Simulator_Border, new Color("black")],
			[SymbolicColor.Element_Background, new Color("white")],
			[SymbolicColor.Element_Foreground, new Color("black")],
			[SymbolicColor.Element_Border, new Color("black")],
			[SymbolicColor.Element_Sorted, new Color("grey")],
			[SymbolicColor.Element_OrderCorrect, new Color("limegreen")],
			[SymbolicColor.Element_OrderIncorrect, new Color("crimson")],
			[SymbolicColor.Element_Highlight_1, new Color("#42a5f5")],
			[SymbolicColor.Element_Highlight_2, new Color("#66bb6a")],
			[SymbolicColor.Element_Highlight_3, new Color("red")],
			[SymbolicColor.Element_Unimportant, new Color("#d3d3d3")],
			[SymbolicColor.Code_ActiveLine, new Color("rgba(255, 255, 0, 0.5)")],
			[SymbolicColor.Variable_1, new Color("#42a5f5")],
			[SymbolicColor.Variable_2, new Color("#66bb6a")],
			[SymbolicColor.Variable_3, new Color("red")],
			[SymbolicColor.Variable_4, new Color("cyan")],
		], new Color("white"));
	}

	[Symbol.iterator](): MapIterator<[SymbolicColor, Color]> {
		return this.map.entries();
	}
}
