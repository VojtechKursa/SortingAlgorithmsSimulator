/**
 * Represents a collection of elements that are used to control the simulator from the state renderer portion of the simulator page.
 */
export class RendererControlElements {
	/**
	 * Creates an instance of RendererControlElements.
	 * @param backFullStepButton - The button to step back a full step.
	 * @param forwardFullStepButton - The button to step forward a full step.
	 * @param backSubStepButton - The button to step back a sub step.
	 * @param forwardSubStepButton - The button to step forward a sub step.
	 * @param beginningButton - The button to go to the beginning of the algorithm.
	 * @param endButton - The button to go to the end of the algorithm.
	 * @param stepOutput - The element to display the current step.
	 */
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