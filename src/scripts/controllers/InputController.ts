import { InputMethod } from "../input/methods/InputMethod";
import { PresetInputMethod } from "../input/methods/PresetInputMethod";
import { InputFunctionRandom } from "../input/presets/functions/InputFunctionRandom";
import { InputFunctionReversed } from "../input/presets/functions/InputFunctionReversed";
import { InputFunctionSorted } from "../input/presets/functions/InputFunctionSorted";
import { InputPreset } from "../input/presets/InputPreset";
import { PlayerController } from "./PlayerController";

export class InputController {
	public readonly playerController: PlayerController;

	private readonly body: HTMLBodyElement;

	private readonly dialog: HTMLDialogElement;
	private readonly dialogOpenButton: HTMLButtonElement;
	private readonly dialog_methodSelector: HTMLSelectElement;
	private readonly dialog_methodArea: HTMLDivElement;
	private readonly dialog_okButton: HTMLButtonElement;
	private readonly dialog_closeButton: HTMLButtonElement;

	private previousMethod: InputMethod;

	public inputMethods: InputMethod[];
	public inputPresets: InputPreset[];

	public constructor(
		playerController: PlayerController,
		body: HTMLBodyElement,
		dialog: HTMLDialogElement,
		dialogOpenButton: HTMLButtonElement,
		dialog_methodSelector: HTMLSelectElement,
		dialog_methodArea: HTMLDivElement,
		dialog_okButton: HTMLButtonElement,
		dialog_closeButton: HTMLButtonElement,
		extraPresets?: InputPreset[]
	) {
		this.playerController = playerController;

		this.body = body;

		this.dialog = dialog;
		this.dialogOpenButton = dialogOpenButton;
		this.dialog_methodSelector = dialog_methodSelector;
		this.dialog_methodArea = dialog_methodArea;
		this.dialog_okButton = dialog_okButton;
		this.dialog_closeButton = dialog_closeButton;

		this.inputPresets = InputController.getDefaultPresets();

		if(extraPresets) {
			this.inputPresets.concat(extraPresets);
		}

		this.inputMethods = this.createInputMethods();
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
		this.dialog.showModal();
		this.body.classList.add("blur");
	}

	public closeDialog() {
		this.dialog.close();
	}

	private onDialogClose() {
		this.body.classList.remove("blur");
	}

	public loadInput() {

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

	private createInputMethods(): InputMethod[] {
		return [
			new PresetInputMethod(this.inputPresets),
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