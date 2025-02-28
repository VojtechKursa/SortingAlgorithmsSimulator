import { ColorSet } from "./ColorSet";

export class PageColors {
	private static readonly storageKey = "colors";

	public get currentColorSet(): ColorSet {
		return document.body.getAttribute("data-bs-theme") === "dark" ? this.darkColors : this.lightColors;
	}

	public constructor(
		public readonly lightColors: ColorSet,
		public readonly darkColors: ColorSet
	) { }

	public static getDefault(): PageColors {
		return new PageColors(
			ColorSet.getDefaultLight(),
			ColorSet.getDefaultDark()
		);
	}

	public static fromJSON(json: string): PageColors {
		const parsed = JSON.parse(json);

		try {
			return new PageColors(
				ColorSet.fromJSON(parsed.light),
				ColorSet.fromJSON(parsed.dark)
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