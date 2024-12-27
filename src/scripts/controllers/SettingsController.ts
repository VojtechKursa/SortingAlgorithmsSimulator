import { ColorSet } from "../visualization/colors/ColorSet";
import { PageColors } from "../visualization/colors/PageColors";
import { SymbolicColor, symbolicColors } from "../visualization/colors/SymbolicColor";
import { SymbolicColorHelper } from "../visualization/colors/SymbolicColorHelper";

export class SettingsController {
	private dialog: HTMLDialogElement;

	private darkModeSelector?: HTMLSelectElement;

	private colorsDiv: HTMLDivElement;
	private readonly colorInputs = new Array<HTMLInputElement>();

	public constructor(
		private readonly colors: PageColors
	) {
		this.colorsDiv = document.createElement("div");
		this.colorsDiv.id = "settings-colors-wrapper";
		this.colorsDiv.classList.add("row");

		this.dialog = this.createDialog();
	}

	private createDialog(): HTMLDialogElement {
		const dialog = document.createElement("dialog");
		dialog.id = "dialog-settings";

		const header = document.createElement("h3");
		header.textContent = "Settings";
		dialog.appendChild(header);

		const currentTheme = document.body.getAttribute("data-bs-theme") ?? "light";
		let selected = false;

		const darkModes = ["Dark", "Light"];
		const darkModeSelector = document.createElement("select");
		darkModeSelector.id = "settings-select-darkmode";

		for (const mode of darkModes) {
			const option = document.createElement("option");
			option.value = mode.toLowerCase();
			option.text = mode;

			if (option.value == currentTheme) {
				option.selected = true;
				selected = true;
			}

			darkModeSelector.appendChild(option);
		}

		if (!selected) {
			let options = darkModeSelector.querySelectorAll("option");
			if (options.length > 0)
				options[0].selected = true;
		}

		dialog.appendChild(darkModeSelector);

		this.darkModeSelector = darkModeSelector;
		this.darkModeSelector.addEventListener("change", _ => {
			this.createColorInputs(this.darkModeSelector?.value === "dark" ? this.colors.darkColors : this.colors.lightColors);
		});

		this.createColorInputs(this.colors.currentColorSet);

		dialog.appendChild(this.colorsDiv);

		dialog.addEventListener("close", _ => {
			this.afterClose();
		});

		return dialog;
	}

	private createColorInputs(colorSet: ColorSet): void {
		while (this.colorsDiv.firstChild != null) {
			this.colorsDiv.firstChild.remove();
		}

		this.colorInputs.splice(0, this.colorInputs.length);

		for (const color of symbolicColors) {
			const colorInput = document.createElement("input");
			colorInput.id = SymbolicColorHelper.getCssClass(color);
			colorInput.type = "color";
			colorInput.value = colorSet.get(color).toString({ format: "hex" });
			colorInput.classList.add("form-control");

			const label = document.createElement("label");
			label.htmlFor = colorInput.id;
			label.textContent = SymbolicColorHelper.getReadableName(color);
			label.classList.add("form-label");

			const wrapper = document.createElement("div");
			wrapper.classList.add("color-wrapper", "col-12", "col-md-6", "col-lg-3");

			wrapper.appendChild(label);
			wrapper.appendChild(colorInput);

			this.colorsDiv.appendChild(wrapper);

			this.colorInputs.push(colorInput);
		}
	}

	public open(): void {
		if (this.dialog == undefined)
			this.dialog = this.createDialog();

		document.body.classList.add("blur");

		document.body.appendChild(this.dialog);
		this.dialog.showModal();
	}

	public close(): void {
		if (this.dialog != undefined) {
			this.dialog.close();
		}
	}

	private afterClose() {
		document.body.classList.remove("blur");

		this.dialog.remove();
	}
}