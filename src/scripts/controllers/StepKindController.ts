import { StepKind, StepKindHelper } from "../data/stepResults/StepKind";

/**
 * Controller for managing the UI and selection of step kinds.
 * @see {@link StepKind}
 */
export class StepKindController {
	/**
	 * Gets the currently selected step kind.
	 * @returns The currently selected step kind.
	 */
	public get selectedStepKind(): StepKind {
		// This getter hides the method for future optimization
		return this.getSelectedStepKind();
	}

	/**
	 * Sets the selected step kind and updates the state of the UI.
	 * @param value - The step kind to select.
	 * @throws Will throw an error if no UI element for representing the given step kind is found in this controller.
	 */
	public set selectedStepKind(value: StepKind) {
		const stepKindDescription = StepKindHelper.toString(value);

		let radio = this.radioButtonWrapper.querySelector(`input[type=radio][value="${stepKindDescription.machineName}"]`) as HTMLInputElement | null;

		if (radio == null)
			throw new Error(`No radio button found for step kind ${stepKindDescription.displayName} (${stepKindDescription.machineName})`);

		radio.checked = true;
	}

	/**
	 * Initializes the radio buttons for each step kind and sets the default selection.
	 * @param radioButtonWrapper - The wrapper element for containing the radio buttons for selection of step kinds.
	 */
	public constructor(
		private readonly radioButtonWrapper: HTMLDivElement
	) {
		let firstRadioButton: HTMLInputElement | null = null;

		for (const kind of StepKindHelper.getStepKindsStrings().reverse()) {
			const radio = document.createElement("input");
			radio.type = "radio";
			radio.name = "continuous_control-step_kind";
			radio.value = kind.machineName;
			radio.id = `input-continuous_control-step_kind-${kind.machineName}`;
			radio.classList.add("btn-check");

			const label = document.createElement("label");
			label.setAttribute("for", radio.id);
			label.textContent = kind.displayName;
			label.classList.add("btn", "btn-outline-primary");

			radioButtonWrapper.appendChild(radio);
			radioButtonWrapper.appendChild(label);

			if (firstRadioButton == null)
				firstRadioButton = radio;
		}

		let defaultRadioButton = radioButtonWrapper.querySelector(`input[type="radio"][value="${StepKindHelper.toString(StepKind.Significant).machineName}"]`) as HTMLInputElement | null;
		if (defaultRadioButton == null)
			defaultRadioButton = firstRadioButton;

		if (defaultRadioButton != null)
			defaultRadioButton.checked = true;
	}

	/**
	 * Gets the currently selected step kind by checking for a checked radio button in the wrapper.
	 * @returns The currently selected step kind.
	 * @throws Will throw an error if no radio button is checked or if the checked radio button has a value not associated with any StepKind.
	 * @see {@link StepKind}
	 */
	private getSelectedStepKind(): StepKind {
		let checkedRadio = this.radioButtonWrapper.querySelector("input[type=radio]:checked") as HTMLInputElement | null;

		if (checkedRadio == null)
			throw new Error("No step kind radio button checked.");

		let kind = StepKindHelper.fromString(checkedRadio.value);

		if (kind == undefined)
			throw new Error("Checked step kind radio button has invalid value");

		return kind;
	}

	/**
	 * Selects the next or previous step kind in a step kind sequence. Wraps around.
	 * @param next - If true, selects the next step kind. Otherwise, selects the previous step kind.
	 */
	public selectNextInLine(next: boolean): void {
		const selectedKind = this.selectedStepKind;
		const nextKind = StepKindHelper.getRelativeKind(selectedKind, next, true);

		this.selectedStepKind = nextKind;
	}
}