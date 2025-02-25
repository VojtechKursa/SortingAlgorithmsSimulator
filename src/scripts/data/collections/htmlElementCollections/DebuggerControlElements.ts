/**
 * A collection of elements used to control the simulator from the debugger portion of the simulator page.
 * This includes the buttons for stepping forward and backward the code step and an element for displaying the current code step.
 */
export class DebuggerControlElements {
	/**
	 * @param backCodeStepButton - The button to step back a code step.
	 * @param forwardCodeStepButton - The button to step forward a code step.
	 * @param stepOutput - The element to display the current code step.
	 */
	public constructor(
		public readonly backCodeStepButton: HTMLButtonElement,
		public readonly forwardCodeStepButton: HTMLButtonElement,
		public readonly stepOutput: HTMLOutputElement
	) { }
}