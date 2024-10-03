import { ControlElements } from "./ControlElements";

export class DebuggerControlElements extends ControlElements {
	public constructor(
		backButton: HTMLButtonElement,
		forwardButton: HTMLButtonElement,
		stepOutput: HTMLOutputElement,
		pauseButton: HTMLInputElement,
		playButton: HTMLInputElement,
		periodInput: HTMLInputElement
	) {
		super(backButton, forwardButton, stepOutput, pauseButton, playButton, periodInput);
	}
}