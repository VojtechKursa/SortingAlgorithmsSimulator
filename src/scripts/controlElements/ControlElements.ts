export abstract class ControlElements {
	public readonly backButton: HTMLButtonElement;
	public readonly stepOutput: HTMLOutputElement;
	public readonly forwardButton: HTMLButtonElement;
	public readonly pauseButton: HTMLInputElement;
	public readonly playButton: HTMLInputElement;
	public readonly periodInput: HTMLInputElement;

	protected constructor(
		backButton: HTMLButtonElement,
		forwardButton: HTMLButtonElement,
		stepOutput: HTMLOutputElement,
		pauseButton: HTMLInputElement,
		playButton: HTMLInputElement,
		periodInput: HTMLInputElement
	) {
		this.backButton = backButton;
		this.forwardButton = forwardButton;
		this.stepOutput = stepOutput;
		this.pauseButton = pauseButton;
		this.playButton = playButton;
		this.periodInput = periodInput;
	}
}