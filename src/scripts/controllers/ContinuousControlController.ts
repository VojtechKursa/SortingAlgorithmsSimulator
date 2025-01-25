import { StepKind, StepKindHelper } from "../data/stepResults/StepKind";

export interface PlayEventHandler { (stepKind: StepKind, interval: number): void }
export interface PauseEventHandler { (): void }
export interface TickEventHandler { (stepKind: StepKind): void }

export class ContinuousControlController {
	private readonly playHandlers = new Array<PlayEventHandler>();
	private readonly pauseHandlers = new Array<PauseEventHandler>();
	private readonly tickHandlers = new Array<TickEventHandler>();

	private intervalId: NodeJS.Timeout | number | null = null;

	private _playing: boolean = false;
	private set playing(value: boolean) {
		this._playing = value;
	}
	public get playing(): boolean {
		return this._playing;
	}

	public get selectedStepKind(): StepKind {
		// This getter hides the method for future optimization
		return this.getSelectedStepKind();
	}

	public get timerIntervalMs(): number {
		// This getter hides the method for future optimization
		return this.getTimerIntervalMs(false);
	}

	public constructor(
		public readonly periodInput: HTMLInputElement,
		public readonly pauseButton: HTMLInputElement,
		public readonly playButton: HTMLInputElement,
		public readonly radioButtonWrapper: HTMLDivElement
	) {
		let firstRadioButton: HTMLInputElement | null = null;

		for (const kind of StepKindHelper.getStepKindsStrings()) {
			const radio = document.createElement("input");
			radio.type = "radio";
			radio.name = "continuous_control-step_kind";
			radio.value = kind.machineName;
			radio.id = `input-continuous_control-step_kind-${kind.machineName}`;
			radio.classList.add("form-check-input");

			const label = document.createElement("label");
			label.setAttribute("for", radio.id);
			label.textContent = kind.displayName;
			label.classList.add("form-check-label");

			const div = document.createElement("div");
			div.appendChild(radio);
			div.appendChild(label);

			radioButtonWrapper.appendChild(div);

			if (firstRadioButton == null)
				firstRadioButton = radio;
		}

		let defaultRadioButton = radioButtonWrapper.querySelector(`input[type="radio"][value="${StepKindHelper.toString(StepKind.Sub).machineName}"]`) as HTMLInputElement | null;
		if (defaultRadioButton == null)
			defaultRadioButton = firstRadioButton;

		if (defaultRadioButton != null)
			defaultRadioButton.checked = true;

		pauseButton.addEventListener("click", _ => this.pause());
		playButton.addEventListener("click", _ => this.play());
	}

	public play(kind?: StepKind, intervalMs?: number): boolean {
		if (this.playing)
			return false;

		if (kind == undefined)
			kind = this.selectedStepKind;

		if (intervalMs == undefined)
			intervalMs = this.getTimerIntervalMs(true);

		this.playing = true;
		this.updateActiveElementDisabledState(true);

		if (!this.playButton.checked)
			this.playButton.checked = true;

		this.playHandlers.forEach(handler => handler(kind, intervalMs));

		this.intervalId = setInterval(() => this.tick(), intervalMs);

		return true;
	}

	public pause(): boolean {
		if (this.intervalId == null)
			return false;

		clearInterval(this.intervalId);
		this.intervalId = null;

		this.playing = false;
		this.updateActiveElementDisabledState(false);

		if (!this.pauseButton.checked)
			this.pauseButton.checked = true;

		this.pauseHandlers.forEach(handler => handler());

		return true;
	}

	private tick() {
		this.tickHandlers.forEach(handler => handler(this.selectedStepKind));
	}

	private updateActiveElementDisabledState(disabled?: boolean) {
		if (disabled == undefined)
			disabled = this.playing;

		this.periodInput.disabled = disabled;
	}

	private getTimerIntervalMs(updateControl: boolean = true): number {
		let value = this.periodInput.valueAsNumber;

		if (value <= 0 || Number.isNaN(value)) {
			value = Number.parseFloat(this.periodInput.min);

			if (updateControl)
				this.periodInput.valueAsNumber = value;
		}

		return value * 1000;
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

	public addEventListenerPlay(handler: PlayEventHandler): void {
		this.playHandlers.push(handler);
	}
	public addEventListenerPause(handler: PauseEventHandler): void {
		this.pauseHandlers.push(handler);
	}
	public addEventListenerTick(handler: TickEventHandler): void {
		this.tickHandlers.push(handler);
	}

	public removeEventListener(event: "play" | "pause" | "tick", handler: Function): void {
		let array;
		switch (event) {
			case "play": array = this.playHandlers; break;
			case "pause": array = this.pauseHandlers; break;
			case "tick": array = this.tickHandlers; break;
			default: throw new Error("Invalid event type");
		}

		let index: number;
		do {
			index = array.findIndex(val => val == handler);

			if (index != -1)
				array.splice(index, 1);
		} while (index != -1);
	}
}