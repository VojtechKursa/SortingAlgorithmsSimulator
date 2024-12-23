import { RendererHighlight } from "./Highlights";

export class ColorSet {
	private map: Map<RendererHighlight, string>;
	private defaultValue: string;

	public constructor(map: Iterable<readonly [RendererHighlight, string]>, defaultValue: string) {
		this.map = new Map<RendererHighlight, string>();

		for (const item of map) {
			this.map.set(item[0], item[1]);
		}

		this.defaultValue = defaultValue;
	}

	public get(color: RendererHighlight | undefined): string {
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
