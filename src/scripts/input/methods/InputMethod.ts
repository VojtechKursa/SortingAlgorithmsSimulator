/**
 * Interface definition for a method of defining input for an algorithm.
 */
export interface InputMethod {
	/**
	 * The (display) name of the input method.
	 */
	readonly name: string;

	/**
	 * The text to be displayed on the load button.
	 */
	readonly loadButtonText: string;

	/**
	 * Creates the form for the input method.
	 *
	 * @param methodArea - The HTML div element into which the form is to be created.
	 * @param loadButton - The HTML button element for loading the input into the simulator.
	 * 						It is the caller's responsibility to create it beforehand.
	 */
	createForm(methodArea: HTMLDivElement, loadButton: HTMLButtonElement): void;

	/**
	 * Called on unloading the input method when i.e. switching to another input method.
	 * The method is responsible for resetting the internal state of the input method.
	 *
	 * Clearing of the form is the responsibility of the caller.
	 */
	onClear(): void;

	/**
	 * Retrieves the input data.
	 *
	 * @returns A promise that resolves to an array of numbers representing the algorithm input provided
	 * 			by the input method or null if the input is invalid.
	 */
	getInput(): Promise<number[] | null>;
}