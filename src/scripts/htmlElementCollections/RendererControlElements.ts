import { ControlElements } from "./ControlElements";

export class RendererControlElements extends ControlElements {
	public constructor(
		backButton: HTMLButtonElement,
		forwardButton: HTMLButtonElement,
		stepOutput: HTMLOutputElement,
		pauseButton: HTMLInputElement,
		playButton: HTMLInputElement,
		periodInput: HTMLInputElement,
		public readonly beginningButton: HTMLButtonElement,
		public readonly endButton: HTMLButtonElement
	) {
		super(backButton, forwardButton, stepOutput, pauseButton, playButton, periodInput);
	}
}