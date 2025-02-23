export type DarkModeChangedEventHandler = (dark: boolean) => void;

export class DarkModeHandler {
	private readonly localStorageVariable: string = "darkMode";

	private readonly handlers = new Array<DarkModeChangedEventHandler>();

	private darkMode: boolean;
	public get DarkMode(): boolean {
		return this.darkMode;
	}
	public set DarkMode(value: boolean) {
		this.darkMode = value;

		this.apply();
		this.save();

		for (const handler of this.handlers) {
			handler(this.DarkMode);
		}
	}

	private darkModeSwitchButton?: HTMLButtonElement;
	private readonly darkModeIcon = "bi-moon-fill";
	private readonly lightModeIcon = "bi-sun-fill";

	public constructor(darkModeSwitchButton: HTMLButtonElement | undefined | null) {
		let darkMode = this.load();

		if (darkMode == undefined) {
			this.darkMode = false;
			this.save();
		} else {
			this.darkMode = darkMode;
		}

		if (darkModeSwitchButton != undefined && darkModeSwitchButton != null) {
			this.darkModeSwitchButton = darkModeSwitchButton;
			darkModeSwitchButton.addEventListener("click", _ => this.DarkMode = !this.DarkMode);
		}

		this.apply();
	}

	private apply(): void {
		document.body.setAttribute("data-bs-theme", this.darkMode ? "dark" : "light");

		if (this.darkModeSwitchButton != undefined) {
			let icon = this.darkModeSwitchButton.querySelector(`i.${this.darkModeIcon}, i.${this.lightModeIcon}`);

			if (icon == null) {
				icon = document.createElement("i");
				icon.classList.add("bi");
				this.darkModeSwitchButton.appendChild(icon);
			}

			icon.classList.remove(this.darkModeIcon, this.lightModeIcon);
			icon.classList.add(this.darkMode ? this.lightModeIcon : this.darkModeIcon);
		}
	}

	private load(): boolean | undefined {
		let localStorageValue = localStorage.getItem(this.localStorageVariable);
		if (localStorageValue == null)
			return undefined;

		let parsed = JSON.parse(localStorageValue);
		if (typeof parsed != "boolean")
			return undefined;

		return parsed;
	}

	private save(): void {
		localStorage.setItem(this.localStorageVariable, JSON.stringify(this.darkMode));
	}

	public addEventHandler(handler: DarkModeChangedEventHandler): void {
		this.handlers.push(handler);
	}

	public removeEventHandler(handler: DarkModeChangedEventHandler): void {
		const index = this.handlers.findIndex(item => item == handler);

		if (index != -1) {
			this.handlers.splice(index, 1);
		}
	}
}