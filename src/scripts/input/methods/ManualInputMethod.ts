import { InputMethod } from "./InputMethod";

export class ManualInputMethod implements InputMethod {
	public readonly name: string = "Manual input";
	public readonly loadButtonName: string = "Set";

	protected loadButton: HTMLButtonElement | undefined;
	protected inputElement: HTMLInputElement | undefined;

	public static readonly inputRegEx: RegExp = new RegExp("^\d+(?:,\d+)*$");

	public createForm(methodArea: HTMLDivElement, loadButton: HTMLButtonElement): void {
		let inputElement = document.createElement("input");
		inputElement.type = "text";
		inputElement.pattern = ManualInputMethod.inputRegEx.source;
		inputElement.id = "input_manual";

		let label = document.createElement("label");
		label.textContent = "Input";
		label.setAttribute("for", inputElement.id);

		methodArea.appendChild(label);
		methodArea.appendChild(inputElement);

		this.inputElement = inputElement;
		this.loadButton = loadButton;
	}

	public onClear(): void {
		this.loadButton = undefined;
		this.inputElement = undefined;
	}

	public async getInput(): Promise<number[] | null> {
		if (!this.inputElement)
			throw new Error("Attempted to get input from ManualInputMethod that doesn't currently exist.");

		let text = this.inputElement.value;

		if (ManualInputMethod.inputRegEx.test(text))
			throw new Error("Input is in incorrect format.");

		return text.split(",").map(numStr => Number.parseInt(numStr));
	}

	public static parseNumbers(text: string): number[] {
		if (ManualInputMethod.inputRegEx.test(text))
			throw new Error("Input is in incorrect format.");

		return text.split(",").map(numStr => Number.parseInt(numStr));
	}
}