import { InputParameter } from "../parameters/InputParameter";
import { InputMethod } from "./InputMethod";

/**
 * An input method for creating an input manually (via a text input).
 */
export class ManualInputMethod implements InputMethod {
	public readonly name: string = "Manual input";
	public readonly loadButtonText: string = "Set";

	/**
	 * Reference to the load button.
	 */
	protected loadButton: HTMLButtonElement | undefined;

	/**
	 * The input parameter that contains the manually entered text based on which the input is to be generated.
	 */
	protected readonly input: InputParameter;

	/**
	 * Regular expression for validating the input.
	 */
	public static readonly inputRegEx: RegExp = new RegExp(/^\d+(?:,\d+)*$/);

	public constructor() {
		this.input = new InputParameter("input_manual", "Input", "", true);
		this.input.addInputListener((input, event, parameter) => this.formatTestEvent(parameter))
	}


	public createForm(methodArea: HTMLDivElement, loadButton: HTMLButtonElement): void {
		this.input.createForm(methodArea, loadButton);

		this.loadButton = loadButton;

		this.input.startProblemCheck(new Event("input"));
	}

	public onClear(): void {
		this.loadButton = undefined;
	}

	/**
	 * Verifies that the input is in a correct format and displays adds a problem to the input parameter if it is not.
	 *
	 * @param input The input parameter to verify.
	 */
	private formatTestEvent(input: InputParameter): void {
		const text = input.getValue();

		if (text == "")
			return;

		if (!ManualInputMethod.testInput(text))
			input.addProblem("Input is in incorrect format.<br />(Expected colon separated integers)");
	}

	public async getInput(): Promise<number[] | null> {
		return ManualInputMethod.parseNumbers(this.input.getValueMandatory());
	}

	/**
	 * Tests if the input is in the correct format.
	 *
	 * @param text The input to test.
	 * @returns True if the input is in the correct format, false otherwise.
	 */
	public static testInput(text: string): boolean {
		return ManualInputMethod.inputRegEx.test(text);
	}

	/**
	 * Parses the input text into an array of numbers representing the algorithm input.
	 *
	 * @param text The input text to parse.
	 * @returns An array of numbers representing the algorithm input.
	 */
	public static parseNumbers(text: string): number[] {
		if (!this.testInput(text))
			throw new Error("Input is in incorrect format.");

		return text.split(",").map(numStr => Number.parseInt(numStr));
	}
}