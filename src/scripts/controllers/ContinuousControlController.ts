import { StepKind } from "../data/stepResults/StepKind";
import { StepKindController } from "./StepKindController";



/**
 * Interface of an event handler function for handling play events.
 * @param stepKind - The kind of step that started playing.
 * @param interval - The interval in milliseconds between steps.
 */
export interface PlayEventHandler { (stepKind: StepKind, interval: number): void }

/**
 * Interface of an event handler function for handling pause events.
 */
export interface PauseEventHandler { (): void }

/**
 * Interface of an event handler function for handling tick events.
 * @param stepKind - The kind of step that is currently being played as of the time of this tick.
 */
export interface TickEventHandler { (stepKind: StepKind): void }



/**
 * Controller for continuous control (playing and pausing) of the simulation.
 */
export class ContinuousControlController {
	/**
	 * An array of all registered event handler for the player event.
	 */
	private readonly playHandlers = new Array<PlayEventHandler>();
	/**
	 * An array of all registered event handler for the pause event.
	 */
	private readonly pauseHandlers = new Array<PauseEventHandler>();
	/**
	 * An array of all registered event handler for the tick event.
	 */
	private readonly tickHandlers = new Array<TickEventHandler>();

	/**
	 * The ID of the timer.
	 */
	private intervalId: NodeJS.Timeout | number | null = null;

	/**
	 * The current playing state. True if playing is currently in progress, false otherwise.
	 */
	private _playing: boolean = false;

	/**
	 * Sets the playing state.
	 * @param value - The new playing state.
	 */
	private set playing(value: boolean) {
		this._playing = value;
	}

	/**
	 * Gets the current playing state.
	 */
	public get playing(): boolean {
		return this._playing;
	}

	/**
	 * Gets the timer interval in milliseconds.
	 */
	public get timerIntervalMs(): number {
		// This getter hides the method for future optimization
		return this.getTimerIntervalMs(false);
	}

	/**
	 * @param periodInput - The input element for the tick interval.
	 * @param pauseButton - The button element for pausing.
	 * @param playButton - The button element for playing.
	 * @param stepKindController - The controller for controlling the currently selected step kind to play.
	 */
	public constructor(
		public readonly periodInput: HTMLInputElement,
		public readonly pauseButton: HTMLInputElement,
		public readonly playButton: HTMLInputElement,
		public readonly stepKindController: StepKindController
	) {
		pauseButton.addEventListener("click", () => this.pause());
		playButton.addEventListener("click", () => this.play());
	}

	/**
	 * Starts the simulation.
	 * @param kind - The kind of step that is to be played. Defaults to the currently selected step of the step kind controller.
	 * @param intervalMs - The interval in milliseconds between steps, defaults to the current value of the period input.
	 * @returns True if the simulation started, false otherwise (i.e. when it's already playing).
	 */
	public play(kind?: StepKind, intervalMs?: number): boolean {
		if (this.playing)
			return false;

		if (kind == undefined)
			kind = this.stepKindController.selectedStepKind;
		else
			this.stepKindController.selectedStepKind = kind;

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

	/**
	 * Pauses the simulation.
	 * @returns True if the simulation paused, false otherwise (i.e. when it's isn't playing).
	 */
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

	/**
	 * Lets all subscribers know that a tick has happened.
	 */
	private tick() {
		this.tickHandlers.forEach(handler => handler(this.stepKindController.selectedStepKind));
	}

	/**
	 * Updates the disabled state of active elements.
	 * @param disabled - The new disabled state.
	 */
	private updateActiveElementDisabledState(disabled?: boolean) {
		if (disabled == undefined)
			disabled = this.playing;

		this.periodInput.disabled = disabled;
	}

	/**
	 * Gets the timer interval in milliseconds.
	 * @param updateControl - Whether to update the period input with the current correct interval (if it's content is currently invalid).
	 * @returns The timer interval in milliseconds.
	 */
	private getTimerIntervalMs(updateControl: boolean = true): number {
		let value = this.periodInput.valueAsNumber;

		if (value <= 0 || Number.isNaN(value)) {
			value = Number.parseFloat(this.periodInput.min);

			if (updateControl)
				this.periodInput.valueAsNumber = value;
		}

		return value * 1000;
	}

	/**
	 * Adds a play event listener.
	 * @param handler - The handler for the play event.
	 */
	public addEventListenerPlay(handler: PlayEventHandler): void {
		this.playHandlers.push(handler);
	}

	/**
	 * Adds a pause event listener.
	 * @param handler - The handler for the pause event.
	 */
	public addEventListenerPause(handler: PauseEventHandler): void {
		this.pauseHandlers.push(handler);
	}

	/**
	 * Adds a tick event listener.
	 * @param handler - The handler for the tick event.
	 */
	public addEventListenerTick(handler: TickEventHandler): void {
		this.tickHandlers.push(handler);
	}

	/**
	 * Removes an event listener.
	 * @param event - The type of event.
	 * @param handler - The handler to be removed.
	 */
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