export class DebuggerControlElements {
	public constructor(
		public readonly backCodeStepButton: HTMLButtonElement,
		public readonly forwardCodeStepButton: HTMLButtonElement,
		public readonly stepOutput: HTMLOutputElement
	) { }
}