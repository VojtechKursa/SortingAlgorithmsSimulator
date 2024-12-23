export class RendererControlElements {
	public constructor(
		public readonly backFullStepButton: HTMLButtonElement,
		public readonly forwardFullStepButton: HTMLButtonElement,
		public readonly backSubStepButton: HTMLButtonElement,
		public readonly forwardSubStepButton: HTMLButtonElement,
		public readonly beginningButton: HTMLButtonElement,
		public readonly endButton: HTMLButtonElement,
		public readonly stepOutput: HTMLDivElement
	) { }
}