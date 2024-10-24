export abstract class ControlElements {
	protected constructor(
		public readonly backButton: HTMLButtonElement,
		public readonly forwardButton: HTMLButtonElement,
		public readonly stepOutput: HTMLOutputElement,
		public readonly pauseButton: HTMLInputElement,
		public readonly playButton: HTMLInputElement,
		public readonly periodInput: HTMLInputElement
	) { }
}