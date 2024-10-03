import { ControlElements } from "./ControlElements";

export class RendererControlElements extends ControlElements {
	public readonly beginningButton: HTMLButtonElement;
	public readonly endButton: HTMLButtonElement;

	public constructor(
		backButton: HTMLButtonElement,
		forwardButton: HTMLButtonElement,
		stepOutput: HTMLOutputElement,
		pauseButton: HTMLInputElement,
		playButton: HTMLInputElement,
		periodInput: HTMLInputElement,
		beginningButton: HTMLButtonElement,
		endButton: HTMLButtonElement
	) {
		super(backButton, forwardButton, stepOutput, pauseButton, playButton, periodInput);

		this.beginningButton = beginningButton;
		this.endButton = endButton;
	}
}