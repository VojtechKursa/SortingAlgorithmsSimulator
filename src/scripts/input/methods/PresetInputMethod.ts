import { InputPreset } from "../presets/InputPreset";
import { InputMethod } from "./InputMethod";

export class PresetInputMethod implements InputMethod {
	public readonly name: string = "Preset";
	public readonly loadButtonName: string = "Load";

	private select: HTMLSelectElement | undefined;
	private parametersDiv: HTMLDivElement | undefined;
	private loadButton: HTMLButtonElement | undefined;

	private previousPreset: InputPreset;

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

	public getCurrentPreset(): InputPreset {
		if (this.select == undefined)
			throw new Error("Attempted to retrieve preset when preset input method isn't active");

		return this.presets[this.select.selectedIndex];
	}

	public async getInput(): Promise<number[]> {
		return this.getCurrentPreset().getArray();
	}
}