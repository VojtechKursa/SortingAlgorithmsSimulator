export class PlayerControls {
	public readonly back: HTMLButtonElement;
	public readonly step: HTMLOutputElement;
	public readonly forward: HTMLButtonElement;
	public readonly pause: HTMLInputElement;
	public readonly play: HTMLInputElement;
	public readonly periodInput: HTMLInputElement;

	public constructor(
		back: HTMLButtonElement,
		step: HTMLOutputElement,
		next: HTMLButtonElement,
		pause: HTMLInputElement,
		play: HTMLInputElement,
		periodInput: HTMLInputElement
	) {
		this.back = back;
		this.step = step;
		this.forward = next;
		this.pause = pause;
		this.play = play;
		this.periodInput = periodInput;
	}
}