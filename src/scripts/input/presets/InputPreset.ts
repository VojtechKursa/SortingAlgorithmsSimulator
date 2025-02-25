/**
 * Interface definition for a preset of input values for an algorithm.
 */
export interface InputPreset {
	/**
	 * The (display) name of the input preset.
	 */
	readonly name: string;

	/**
	 * Creates the form for the input preset.
	 *
	 * @param parametersDiv - The HTML div element into which the form is to be created.
	 * @param loadButton - The HTML button element for loading the input into the simulator.
	 * 						It is the caller's responsibility to create it beforehand.
	 */
	createForm(parametersDiv: HTMLDivElement, loadButton: HTMLButtonElement): void;

	/**
	 * Called on unloading the input preset when i.e. switching to another input preset.
	 * The method is responsible for resetting the internal state of the input preset.
	 *
	 * Clearing of the form is the responsibility of the caller.
	 */
	onClear(): void;

	/**
	 * Retrieves the input data.
	 *
	 * @returns An array of numbers representing the algorithm input provided by the input preset.
	 */
	getArray(): number[];
}