/**
 * Type definition of an event handler function that is called when the dark mode state changes.
 * @param dark - A boolean indicating the new dark mode state.
 */
export type DarkModeChangedEventHandler = (dark: boolean) => void;

/**
 * A class to handle switching between dark and light display modes, including saving the state to local storage,
 * applying the dark mode to the document, and managing event handlers for dark mode changes.
 */
export class DarkModeHandler {
	/**
	 * The name of the local storage variable used to save the dark mode state.
	 */
	private readonly localStorageVariable: string = "darkMode";

	/**
	 * An array of event handlers to be called when the dark mode state changes.
	 */
	private readonly handlers = new Array<DarkModeChangedEventHandler>();

	/**
	 * The current dark mode state.
	 */
	private darkMode: boolean;

	/**
	 * Gets the current dark mode state.
	 */
	public get DarkMode(): boolean {
		return this.darkMode;
	}

	/**
	 * Sets the dark mode state.
	 * It also applies the new dark mode state to the document, saves the state to local storage,
	 * and calls all registered event handlers.
	 * @param value - The new dark mode state.
	 */
	public set DarkMode(value: boolean) {
		this.darkMode = value;

		this.apply();
		this.save();

		for (const handler of this.handlers) {
			handler(this.DarkMode);
		}
	}

	/**
	 * The button element used to toggle dark mode.
	 */
	private darkModeSwitchButton?: HTMLButtonElement;

	/**
	 * The icon class for dark mode.
	 */
	private readonly darkModeIcon = "bi-moon-fill";

	/**
	 * The icon class for light mode.
	 */
	private readonly lightModeIcon = "bi-sun-fill";

	/**
	 * @param darkModeSwitchButton - The button element used to toggle dark mode.
	 */
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
			darkModeSwitchButton.addEventListener("click", () => this.DarkMode = !this.DarkMode);
		}

		this.apply();
	}

	/**
	 * Applies the current dark mode state to the document and updates the icon on the switch button.
	 */
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

	/**
	 * Loads the dark mode state from local storage.
	 * @returns The dark mode state, or undefined if not found or invalid.
	 */
	private load(): boolean | undefined {
		let localStorageValue = localStorage.getItem(this.localStorageVariable);
		if (localStorageValue == null)
			return undefined;

		let parsed = JSON.parse(localStorageValue);
		if (typeof parsed != "boolean")
			return undefined;

		return parsed;
	}

	/**
	 * Saves the current dark mode state to local storage.
	 */
	private save(): void {
		localStorage.setItem(this.localStorageVariable, JSON.stringify(this.darkMode));
	}

	/**
	 * Adds an event handler to be called when the dark mode state changes.
	 * @param handler - The event handler to add.
	 */
	public addEventHandler(handler: DarkModeChangedEventHandler): void {
		this.handlers.push(handler);
	}

	/**
	 * Removes a previously registered event handler.
	 * @param handler - The event handler to remove.
	 */
	public removeEventHandler(handler: DarkModeChangedEventHandler): void {
		const index = this.handlers.findIndex(item => item == handler);

		if (index != -1) {
			this.handlers.splice(index, 1);
		}
	}
}