/**
 * Represents a collection of elements that are used to control the simulator from the state renderer portion of the simulator page.
 */
export class RendererControlElements {
	/**
	 * @param backAlgorithmicStepButton - The button to step back an algorithmic step.
	 * @param forwardAlgorithmicStepButton - The button to step forward a algorithmic step.
	 * @param backSignificantStepButton - The button to step back a significant step.
	 * @param forwardSignificantStepButton - The button to step forward a significant step.
	 * @param beginningButton - The button to go to the beginning of the algorithm.
	 * @param endButton - The button to go to the end of the algorithm.
	 * @param stepOutput - The element to display the current step.
	 */
	public constructor(
		public readonly backAlgorithmicStepButton: HTMLButtonElement,
		public readonly forwardAlgorithmicStepButton: HTMLButtonElement,
		public readonly backSignificantStepButton: HTMLButtonElement,
		public readonly forwardSignificantStepButton: HTMLButtonElement,
		public readonly beginningButton: HTMLButtonElement,
		public readonly endButton: HTMLButtonElement,
		public readonly stepOutput: HTMLDivElement
	) { }
}