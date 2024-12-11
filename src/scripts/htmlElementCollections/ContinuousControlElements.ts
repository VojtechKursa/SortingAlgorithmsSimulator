import { StepKind, StepKindHelper } from "../stepResults/StepKind";

export type ContinuousControlEventHandler = (start: boolean, stepKind: StepKind, interval: number) => void;

export class ContinuousControlElements {
	private readonly handlers = new Array<ContinuousControlEventHandler>();
	private playing: boolean;

	public constructor(
		public readonly periodInput: HTMLInputElement,
		public readonly pauseButton: HTMLInputElement,
		public readonly playButton: HTMLInputElement,
		public readonly radioButtonWrapper: HTMLDivElement
	) {
		let firstRadioButton: HTMLInputElement | undefined;

		for (const kind of StepKindHelper.getStepKindsStrings()) {
			let radio = document.createElement("input");
			radio.type = "radio";
			radio.name = "continuous_control-step_kind";
			radio.value = kind.machineName;
			radio.id = `input-continuous_control-step_kind-${kind.machineName}`;

			let label = document.createElement("label");
			label.setAttribute("for", radio.id);
			label.textContent = kind.displayName;

			radioButtonWrapper.appendChild(radio);
			radioButtonWrapper.appendChild(label);

			if (firstRadioButton == undefined)
				firstRadioButton = radio;
		}

		if (firstRadioButton != undefined)
			firstRadioButton.checked = true;

		this.playing = false;

		pauseButton.addEventListener("click", _ => {
			if (this.playing) {
				this.handlers.forEach(handler => handler(false, this.getStepKind(), this.getTimerIntervalMs()));
				this.setActiveElementDisabledState(false);
				this.playing = false;
			}
		});
		playButton.addEventListener("click", _ => {
			if (!this.playing) {
				this.handlers.forEach(handler => handler(true, this.getStepKind(), this.getTimerIntervalMs()));
				this.setActiveElementDisabledState(true);
				this.playing = true;
			}
		})
	}

	private setActiveElementDisabledState(disabled: boolean) {
		this.periodInput.disabled = disabled;
		(this.radioButtonWrapper.querySelectorAll("input[type=radio]") as NodeListOf<HTMLInputElement>).forEach(radio => radio.disabled = disabled);
	}

	public getTimerIntervalMs(): number {
		let value = this.periodInput.valueAsNumber;

        if (value <= 0 || Number.isNaN(value)) {
            value = Number.parseFloat(this.periodInput.min);

            this.periodInput.valueAsNumber = value;
        }

        return value * 1000;
	}

	public getStepKind(): StepKind {
		let checkedRadio = this.radioButtonWrapper.querySelector("input[type=radio]:checked") as HTMLInputElement | null;

		if (checkedRadio == null)
			throw new Error("No step kind radio button checked.");

		let kind = StepKindHelper.fromString(checkedRadio.value);

		if (kind == undefined)
			throw new Error("Checked step kind radio button has invalid value");

		return kind;
	}

	public registerHandler(handler: ContinuousControlEventHandler): void {
		this.handlers.push(handler);
	}

	public unregisterHandler(handler: ContinuousControlEventHandler): void {
		let index: number;
		
		do {
			index = this.handlers.findIndex(val => val == handler);

			if (index != -1)
				this.handlers.splice(index, 1);
		} while (index != -1);
	}
}