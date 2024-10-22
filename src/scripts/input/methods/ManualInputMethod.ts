import { InputParameter } from "../parameters/InputParameter";
import { InputMethod } from "./InputMethod";

export class ManualInputMethod implements InputMethod {
	public readonly name: string = "Manual input";
	public readonly loadButtonName: string = "Set";

	protected loadButton: HTMLButtonElement | undefined;
	protected readonly input: InputParameter;

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

	private formatTestEvent(input: InputParameter) {
		const text = input.getValue();

		if (text == "")
			return;

		if (!ManualInputMethod.testInput(text))
			input.addProblem("Input is in incorrect format.<br />(Expected colon separated integers)");
	}

	public async getInput(): Promise<number[] | null> {
		return ManualInputMethod.parseNumbers(this.input.getValueMandatory());
	}

	public static testInput(text: string): boolean {
		return ManualInputMethod.inputRegEx.test(text);
	}

	public static parseNumbers(text: string): number[] {
		if (!this.testInput(text))
			throw new Error("Input is in incorrect format.");

		return text.split(",").map(numStr => Number.parseInt(numStr));
	}
}