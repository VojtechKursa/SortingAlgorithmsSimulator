import { InputMethod } from "./InputMethod";
import { ManualInputMethod } from "./ManualInputMethod";

/**
 * An input method for loading simulator input from a local file.
 */
export class FileInputMethod implements InputMethod {
	public readonly name: string = "File input";
	public readonly loadButtonText: string = "Load";

	/**
	 * Reference to the load button.
	 */
	protected loadButton: HTMLButtonElement | undefined;

	/**
	 * Reference to the input element.
	 */
	protected inputElement: HTMLInputElement | undefined;

	public createForm(methodArea: HTMLDivElement, loadButton: HTMLButtonElement): void {
		let inputElement = document.createElement("input");
		inputElement.type = "file";
		inputElement.id = "input_file";
		inputElement.addEventListener("input", () => {
			if (this.loadButton != undefined)
				this.loadButton.disabled = !this.inputElement?.value;
		});

		let label = document.createElement("label");
		label.textContent = "Input file";
		label.setAttribute("for", inputElement.id);

		methodArea.appendChild(label);
		methodArea.appendChild(inputElement);

		loadButton.disabled = true;

		this.inputElement = inputElement;
		this.loadButton = loadButton;
	}

	public onClear(): void {
		this.loadButton = undefined;
		this.inputElement = undefined;
	}

	public async getInput(): Promise<number[] | null> {
		if (!this.inputElement)
			throw new Error("Attempted to get input from FileInputMethod that doesn't currently exist.");

		let files = this.inputElement.files;

		if (files == null || files.length < 1)
			return null;

		return ManualInputMethod.parseNumbers((await files[0].text()).trim());
	}
}