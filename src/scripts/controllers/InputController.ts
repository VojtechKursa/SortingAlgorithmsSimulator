import { DialogEventListener } from "../data/DialogEventListener";
import { FileInputMethod } from "../input/methods/FileInputMethod";
import { InputMethod } from "../input/methods/InputMethod";
import { ManualInputMethod } from "../input/methods/ManualInputMethod";
import { PresetInputMethod } from "../input/methods/PresetInputMethod";
import { InputFunctionRandom } from "../input/presets/functions/InputFunctionRandom";
import { InputFunctionReversed } from "../input/presets/functions/InputFunctionReversed";
import { InputFunctionSorted } from "../input/presets/functions/InputFunctionSorted";
import { InputPreset } from "../input/presets/InputPreset";
import { PlayerController } from "./PlayerController";

export class InputController {
	private readonly dialogEventListeners: DialogEventListener[] = [];

	private previousMethod: InputMethod;

	public inputMethods: InputMethod[];

	public constructor(
		public readonly playerController: PlayerController,
		private readonly body: HTMLBodyElement,
		private readonly dialog: HTMLDialogElement,
		private readonly dialogOpenButton: HTMLButtonElement,
		private readonly dialog_methodSelector: HTMLSelectElement,
		private readonly dialog_methodArea: HTMLDivElement,
		private readonly dialog_okButton: HTMLButtonElement,
		private readonly dialog_closeButton: HTMLButtonElement,
		extraPresets?: InputPreset[]
	) {
		let inputPresets = InputController.getDefaultPresets();

		if (extraPresets) {
			inputPresets = inputPresets.concat(extraPresets);
		}

		this.inputMethods = this.createInputMethods(inputPresets);
		this.previousMethod = this.inputMethods[0];

		this.inputMethods.forEach((method, index) => {
			let option = document.createElement("option");
			option.text = method.name;
			option.value = index.toString();

			this.dialog_methodSelector.add(option);
		});

		this.dialog.addEventListener("close", () => this.onDialogClose());
		this.dialog_methodSelector.addEventListener("change", () => this.switchToMethod(this.dialog_methodSelector.selectedIndex));

		this.dialogOpenButton.addEventListener("click", () => this.openDialog());
		this.dialog_closeButton.addEventListener("click", () => this.closeDialog());
		this.dialog_okButton.addEventListener("click", () => this.loadInput());

		this.switchToMethod(0);
		this.playerController.setInput(this.getDefaultInput());
	}

	public openDialog() {
		this.dialogEventListeners.forEach(listener => listener(true));

		this.dialog.showModal();
		this.body.classList.add("blur");
	}

	public closeDialog() {
		this.dialog.close();
	}

	private onDialogClose() {
		this.body.classList.remove("blur");

		this.dialogEventListeners.forEach(listener => listener(false));
	}

	public addDialogEventListener(listener: DialogEventListener) {
		this.dialogEventListeners.push(listener);
	}

	public removeDialogEventListener(listener: DialogEventListener) {
		let index = this.dialogEventListeners.indexOf(listener);

		if (index != -1) {
			this.dialogEventListeners.splice(index, 1);
		}
	}

	public async loadInput() {
		let input = await this.getCurrentMethod().getInput();

		if (input != null) {
			this.playerController.setInput(input);
			this.dialog.close();
		}
	}

	public getCurrentMethod(): InputMethod {
		return this.inputMethods[this.dialog_methodSelector.selectedIndex];
	}

	public switchToMethod(index: number) {
		if (index >= 0 && index < this.inputMethods.length) {
			let newMethod = this.inputMethods[index];

			this.previousMethod.onClear();
			this.dialog_methodArea.innerHTML = "";

			this.dialog_okButton.textContent = newMethod.loadButtonName;
			newMethod.createForm(this.dialog_methodArea, this.dialog_okButton);

			this.previousMethod = newMethod;
		}
	}

	public getDefaultInput(): number[] {
		return new InputFunctionRandom().getArray();
	}

	private createInputMethods(inputPresets: InputPreset[]): InputMethod[] {
		return [
			new PresetInputMethod(inputPresets),
			new ManualInputMethod(),
			new FileInputMethod(),
		];
	}

	private static getDefaultPresets(): InputPreset[] {
		return [
			new InputFunctionRandom(),
			new InputFunctionSorted(),
			new InputFunctionReversed(),
		];
	}
}