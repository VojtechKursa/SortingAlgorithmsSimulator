import { InputPreset } from "../presets/InputPreset";
import { InputFunction } from "../presets/functions/InputFunction";	// Included only for documentation links.
import { InputMethod } from "./InputMethod";

/**
 * An input method for loading a simulator input from a preset.
 * A preset can be either a function generating an input or a fixed array.
 *
 * @see {@link InputPreset}
 * @see {@link InputFunction}
 */
export class PresetInputMethod implements InputMethod {
	public readonly name: string = "Preset";
	public readonly loadButtonText: string = "Load";

	/**
	 * The select element for choosing a preset.
	 */
	private select: HTMLSelectElement | undefined;

	/**
	 * The div element containing the parameters of the selected preset, if any.
	 */
	private parametersDiv: HTMLDivElement | undefined;

	/**
	 * The reference to the input load button.
	 */
	private loadButton: HTMLButtonElement | undefined;

	/**
	 * The previously selected preset, stored for de-initialization when switching to a new preset.
	 */
	private previousPreset: InputPreset;

	/**
	 * @param presets - An array of available presets.
	 */
	public constructor(
		private readonly presets: InputPreset[]
	) {
		this.previousPreset = presets[0];
	}

	public createForm(methodArea: HTMLDivElement, loadButton: HTMLButtonElement): void {
		let selectName = "preset_select";

		let selectWrapper = document.createElement("div");
		selectWrapper.classList.add("select_wrapper");

		let label = document.createElement("label");
		label.setAttribute("for", selectName);
		label.textContent = "Preset";

		let select = document.createElement("select");
		select.id = selectName;
		select.classList.add("form-select");

		this.presets.forEach((preset, index) => {
			let option = document.createElement("option");

			option.text = preset.name;
			option.value = index.toString();

			select.add(option);
		});

		select.addEventListener("change", _ => this.switchToPreset(select.selectedIndex))

		let parametersDiv = document.createElement("div");
		parametersDiv.id = "preset_parameters";

		selectWrapper.appendChild(label);
		selectWrapper.appendChild(select);
		methodArea.appendChild(selectWrapper);
		methodArea.appendChild(parametersDiv);

		this.select = select;
		this.parametersDiv = parametersDiv;
		this.loadButton = loadButton;

		this.switchToPreset(0);
	}

	/**
	 * Switches to a preset on the given index in the select element.
	 *
	 * @param index - The index of the preset to switch to.
	 */
	public switchToPreset(index: number): void {
		if (this.parametersDiv && this.loadButton && index >= 0 && index < this.presets.length) {
			let newPreset = this.presets[index];

			this.previousPreset.onClear();
			this.parametersDiv.innerHTML = "";

			newPreset.createForm(this.parametersDiv, this.loadButton);

			this.loadButton.disabled = false;

			this.previousPreset = newPreset;
		}
	}

	public onClear(): void {
		this.select = undefined;
		this.parametersDiv = undefined;
		this.loadButton = undefined;
	}

	/**
	 * Retrieves the currently selected preset.
	 *
	 * @returns The currently selected preset.
	 * @throws An error if this preset method isn't active (the select field is undefined).
	 *
	 * @see {@link InputPreset}
	 */
	public getCurrentPreset(): InputPreset {
		if (this.select == undefined)
			throw new Error("Attempted to retrieve preset when preset input method isn't active");

		return this.presets[this.select.selectedIndex];
	}

	public async getInput(): Promise<number[]> {
		return this.getCurrentPreset().getArray();
	}
}