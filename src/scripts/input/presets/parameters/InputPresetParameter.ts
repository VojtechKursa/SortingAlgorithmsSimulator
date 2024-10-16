import { inputPresetDivClass, problemClass } from "../../../CssInterface";
import { MandatoryError } from "./MandatoryError";

export const nullInputErrorMessage: string = "Attempted to get value from PresetParameter that doesn't have associated input.";

export class InputPresetParameter {
	public readonly machineName: string;
	public readonly readableName: string;

	protected readonly initialValue: string;

	protected listeners: Array<(inputElement: HTMLInputElement, event: Event) => string | null> = [];

	protected wrapper: HTMLDivElement | undefined;
	protected label: HTMLLabelElement | undefined;
	protected input: HTMLInputElement | undefined;
	protected problemDescriptionDiv: HTMLDivElement | undefined;

	private loadButton: HTMLButtonElement | undefined;

	private mandatory: boolean;
	public set Mandatory(value: boolean) {
		this.mandatory = value;

		if (value) {
			if (this.input?.value == "") {
				this.setProblem(`${this.readableName} is mandatory.`);
			}
		} else {
			if (this.wrapper?.classList.contains(problemClass)) {
				this.unsetProblem();
			}
		}
	}
	public get Mandatory(): boolean {
		return this.mandatory;
	}

	private problemActive = false;

	public constructor(machineName: string, readableName: string, initialValue: string, mandatory: boolean) {
		this.machineName = machineName;
		this.readableName = readableName;
		this.initialValue = initialValue;
		this.mandatory = mandatory;

		this.listeners.push(this.mandatoryEnsurer);
	}

	public createForm(parametersDiv: HTMLDivElement, loadButton: HTMLButtonElement): void {
		this.loadButton = loadButton;

		let id = this.getInputId();

		this.label = document.createElement("label");
		this.label.setAttribute("for", id);
		this.label.textContent = this.readableName;

		this.input = document.createElement("input");
		this.input.id = id;
		this.input.value = this.initialValue;
		this.input.addEventListener("change", (event) => this.correctnessEnsurer(this.input, event));

		this.problemDescriptionDiv = document.createElement("div");

		this.wrapper = document.createElement("div");
		this.wrapper.classList.add(inputPresetDivClass);

		this.wrapper.appendChild(this.label);
		this.wrapper.appendChild(this.input);
		this.wrapper.appendChild(this.problemDescriptionDiv);

		parametersDiv.appendChild(this.wrapper);
	}

	public addInputListener(listener: (inputElement: HTMLInputElement, event: Event) => string | null): void {
		this.listeners.push(listener);
	}

	private correctnessEnsurer(inputElement: HTMLInputElement | undefined, event: Event): void {
		if (inputElement == undefined)
			return;

		let result = null;

		for (const listener of this.listeners) {
			result = listener(inputElement, event);

			if (result != null)
				break;
		}

		if (result != null)
			this.setProblem(result);
		else
			this.unsetProblem();
	}

	private mandatoryEnsurer(): string | null {
		if (this.wrapper != undefined && this.input != undefined && this.mandatory) {
			if (this.input.value == "") {
				return `${this.readableName} is mandatory.`;
			}
			else if (this.wrapper.classList.contains(problemClass)) {
				return null;
			}
		}

		return null;
	}

	public setProblem(problem: string | null = null): void {
		if (this.problemActive)
			return;

		if (this.wrapper != undefined)
			this.wrapper.classList.add(problemClass);

		if (this.loadButton != undefined)
			this.loadButton.disabled = true;

		if (this.problemDescriptionDiv != undefined) {
			this.problemDescriptionDiv.textContent = problem;

			if (problem != null && problem != "")
				this.problemDescriptionDiv.classList.remove("hidden");
		}

		this.problemActive = true;
	}

	public unsetProblem(): void {
		if (!this.problemActive)
			return;

		if (this.wrapper != undefined)
			this.wrapper.classList.remove(problemClass);

		if (this.loadButton != undefined)
			this.loadButton.disabled = false;

		if (this.problemDescriptionDiv != undefined) {
			this.problemDescriptionDiv.textContent = null;
			this.problemDescriptionDiv.classList.add("hidden");
		}

		this.problemActive = false;
	}

	public onClear(): void {
		this.label = undefined;
		this.input = undefined;
		this.problemDescriptionDiv = undefined;

		this.wrapper = undefined;

		this.loadButton = undefined;
	}

	public getValue(): string {
		if (this.input == undefined) {
			return this.initialValue;
		}

		return this.input.value;
	}

	public getValueMandatory(): string {
		if (!this.mandatory)
			throw new MandatoryError(this.machineName);

		let value = this.getValue();

		if (value == "")
			value = this.initialValue;

		return value;
	}

	protected getInputId(): string {
		return "input_preset_parameter_" + this.machineName;
	}
}