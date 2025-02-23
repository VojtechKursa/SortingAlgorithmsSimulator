import { StepKind, StepKindHelper } from "../data/stepResults/StepKind";

export class StepKindController {
	public get selectedStepKind(): StepKind {
		// This getter hides the method for future optimization
		return this.getSelectedStepKind();
	}
	public set selectedStepKind(value: StepKind) {
		const stepKindDescription = StepKindHelper.toString(value);

		let radio = this.radioButtonWrapper.querySelector(`input[type=radio][value="${stepKindDescription.machineName}"]`) as HTMLInputElement | null;

		if (radio == null)
			throw new Error(`No radio button found for step kind ${stepKindDescription.displayName} (${stepKindDescription.machineName})`);

		radio.checked = true;
	}

	public constructor(
		private readonly radioButtonWrapper: HTMLDivElement
	) {
		let firstRadioButton: HTMLInputElement | null = null;

		for (const kind of StepKindHelper.getStepKindsStrings()) {
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

		let defaultRadioButton = radioButtonWrapper.querySelector(`input[type="radio"][value="${StepKindHelper.toString(StepKind.Sub).machineName}"]`) as HTMLInputElement | null;
		if (defaultRadioButton == null)
			defaultRadioButton = firstRadioButton;

		if (defaultRadioButton != null)
			defaultRadioButton.checked = true;
	}

	private getSelectedStepKind(): StepKind {
		let checkedRadio = this.radioButtonWrapper.querySelector("input[type=radio]:checked") as HTMLInputElement | null;

		if (checkedRadio == null)
			throw new Error("No step kind radio button checked.");

		let kind = StepKindHelper.fromString(checkedRadio.value);

		if (kind == undefined)
			throw new Error("Checked step kind radio button has invalid value");

		return kind;
	}

	public selectNextInLine(next: boolean): void {
		const selectedKind = this.selectedStepKind;
		const nextKind = StepKindHelper.getRelativeKind(selectedKind, next, true);

		this.selectedStepKind = nextKind;
	}
}