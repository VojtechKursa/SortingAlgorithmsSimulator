import { ColorMap } from "./ColorMap";

export class PageColors {
	private static readonly storageKey = "colors";

	public get currentColorMap(): ColorMap {
		return document.body.getAttribute("data-bs-theme") === "dark" ? this.darkColors : this.lightColors;
	}

	public constructor(
		public readonly lightColors: ColorMap,
		public readonly darkColors: ColorMap
	) { }

	public static getDefault(): PageColors {
		return new PageColors(
			ColorMap.getDefaultLight(),
			ColorMap.getDefaultDark()
		);
	}

	public static fromJSON(json: string): PageColors {
		const parsed = JSON.parse(json);

		try {
			return new PageColors(
				ColorMap.fromJSON(parsed.light),
				ColorMap.fromJSON(parsed.dark)
			);
		} catch {
			const defaultColors = PageColors.getDefault();
			defaultColors.save();

			return defaultColors;
		}
	}

	public toJSON(): string {
		return JSON.stringify({
			light: this.lightColors.toSerializableObject(),
			dark: this.darkColors.toSerializableObject()
		});
	}

	public save(): void {
		localStorage.setItem(PageColors.storageKey, this.toJSON());
	}

	public static load(): PageColors | null {
		const json = localStorage.getItem(PageColors.storageKey);

		if (json == null)
			return null;

		return PageColors.fromJSON(json);
	}
}