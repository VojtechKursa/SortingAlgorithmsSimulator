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

/**
 * The controller for the simulator input dialog.
 */
export class InputController {
	/**
	 * List of event listeners that listen to events on the Input dialog.
	 */
	private readonly dialogEventListeners: DialogEventListener[] = [];

	/**
	 * The previously selected input method. (used for it's de-initialization after a new input method is selected)
	 */
	private previousMethod: InputMethod;

	/**
	 * Array of available input methods.
	 */
	public inputMethods: InputMethod[];

	/**
	 * Creates an instance of InputController.
	 * @param playerController - The player controller instance responsible for managing the simulator to which this InputController is attached.
	 * @param body - The HTML body element (to blur when the input dialog is opened).
	 * @param dialog - The dialog element which represents the input dialog.
	 * @param dialogOpenButton - The button to open the input dialog.
	 * @param dialog_methodSelector - The select element for choosing input methods.
	 * @param dialog_methodArea - The div element used to display the selected input method's form.
	 * @param dialog_okButton - The button to load the currently selected input into the simulator and close the dialog.
	 * @param dialog_closeButton - The button to close the dialog without changing the simulator.
	 * @param extraPresets - Optional additional input presets.
	 */
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

	/**
	 * Opens the input dialog.
	 */
	public openDialog() {
		this.dialogEventListeners.forEach(listener => listener(true));

		this.dialog.showModal();
		this.body.classList.add("blur");
	}

	/**
	 * Closes the input dialog.
	 */
	public closeDialog() {
		this.dialog.close();
	}

	/**
	 * Handles the dialog close event.
	 */
	private onDialogClose() {
		this.body.classList.remove("blur");

		this.dialogEventListeners.forEach(listener => listener(false));
	}

	/**
	 * Adds a DialogEventListener that listens to events on the input dialog.
	 * @see DialogEventListener
	 * @param listener - The listener to add
	 */
	public addDialogEventListener(listener: DialogEventListener) {
		this.dialogEventListeners.push(listener);
	}

	/**
	 * Removes a previously registered DialogEventListener from the list of notified listeners.
	 * @see DialogEventListener
	 * @param listener - The listener to remove
	 */
	public removeDialogEventListener(listener: DialogEventListener) {
		let index = this.dialogEventListeners.indexOf(listener);

		if (index != -1) {
			this.dialogEventListeners.splice(index, 1);
		}
	}

	/**
	 * Loads the input from the currently selected input method into the simulator.
	 */
	public async loadInput() {
		let input = await this.getCurrentMethod().getInput();

		if (input != null) {
			this.playerController.setInput(input);
			this.dialog.close();
		}
	}

	/**
	 * Gets the currently selected input method.
	 * @returns The currently selected input method
	 */
	public getCurrentMethod(): InputMethod {
		return this.inputMethods[this.dialog_methodSelector.selectedIndex];
	}

	/**
	 * Switches to the specified input method.
	 * @param index - The index of the input method to switch to
	 */
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

	/**
	 * Gets the default input array.
	 * @returns The default input array
	 */
	public getDefaultInput(): number[] {
		return new InputFunctionRandom().getArray();
	}

	/**
	 * Creates an array of available input methods.
	 * @param inputPresets - The input presets to use for the PresetInputMethod.
	 * @see PresetInputMethod
	 * @returns An array of available input methods
	 */
	private createInputMethods(inputPresets: InputPreset[]): InputMethod[] {
		return [
			new PresetInputMethod(inputPresets),
			new ManualInputMethod(),
			new FileInputMethod(),
		];
	}

	/**
	 * Gets the default input presets for the PresetInputMethod.
	 * @see PresetInputMethod
	 * @returns An array of default input presets
	 */
	private static getDefaultPresets(): InputPreset[] {
		return [
			new InputFunctionRandom(),
			new InputFunctionSorted(),
			new InputFunctionReversed(),
		];
	}
}