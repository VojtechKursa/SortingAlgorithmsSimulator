import { StepKind, StepKindHelper } from "../data/stepResults/StepKind";
import { StepKindController } from "./StepKindController";

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

	public get timerIntervalMs(): number {
		// This getter hides the method for future optimization
		return this.getTimerIntervalMs(false);
	}

	public constructor(
		public readonly periodInput: HTMLInputElement,
		public readonly pauseButton: HTMLInputElement,
		public readonly playButton: HTMLInputElement,
		public readonly stepKindController: StepKindController
	) {
		pauseButton.addEventListener("click", _ => this.pause());
		playButton.addEventListener("click", _ => this.play());
	}

	public play(kind?: StepKind, intervalMs?: number): boolean {
		if (this.playing)
			return false;

		if (kind == undefined)
			kind = this.stepKindController.selectedStepKind;

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
		this.tickHandlers.forEach(handler => handler(this.stepKindController.selectedStepKind));
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