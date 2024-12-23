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
}
