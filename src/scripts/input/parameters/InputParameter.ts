import { problemInputClass, problemDescriptionDivClass, inputWrapperClass } from "../../visualization/css/GenericClasses";
import { inputPresetDivClass } from "../../visualization/css/InputDialogClasses";
import { NotMandatoryError } from "../../errors/NotMandatoryError";

export const nullInputErrorMessage: string = "Attempted to get value from PresetParameter that doesn't have associated input.";

export type InputCorrectnessListener = (inputElement: HTMLInputElement, event: Event, parameter: InputParameter) => void;

export class InputParameter {
	protected listeners: Array<InputCorrectnessListener> = [];

	protected wrapper: HTMLDivElement | undefined;
	protected label: HTMLLabelElement | undefined;
	protected input: HTMLInputElement | undefined;
	protected problemDescriptionDiv: HTMLDivElement | undefined;

	private loadButton: HTMLButtonElement | undefined;

	private problems: string[] = [];
	private problemCheckOngoing: boolean = false;

	public constructor(
		public readonly machineName: string,
		public readonly readableName: string,
		public readonly initialValue: string,
		private mandatory: boolean
	) {
		this.listeners.push((input, event, parameter) => this.mandatoryEnsurer(input, event, parameter));
	}

	public set Mandatory(value: boolean) {
		this.mandatory = value;

		if (value) {
			if (this.input?.value == "") {
				this.setProblemDescription(`${this.readableName} is mandatory.`);
			}
		} else {
			if (this.wrapper?.classList.contains(problemInputClass)) {
				this.unsetProblem();
			}
		}
	}
	public get Mandatory(): boolean {
		return this.mandatory;
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
		this.input.addEventListener("input", (event) => this.startProblemCheck(event));

		let inputWrapper = document.createElement("div");
		inputWrapper.classList.add(inputWrapperClass);

		inputWrapper.appendChild(this.label);
		inputWrapper.appendChild(this.input);


		this.problemDescriptionDiv = document.createElement("div");
		this.problemDescriptionDiv.classList.add(problemDescriptionDivClass);

		this.wrapper = document.createElement("div");
		this.wrapper.classList.add(inputPresetDivClass);

		this.wrapper.appendChild(inputWrapper);
		this.wrapper.appendChild(this.problemDescriptionDiv);

		parametersDiv.appendChild(this.wrapper);
	}

	public addInputListener(listener: InputCorrectnessListener): void {
		this.listeners.push(listener);
	}

	private correctnessEnsurer(event: Event): void {
		if (this.input == undefined)
			return;

		for (const listener of this.listeners) {
			listener(this.input, event, this);
		}

		this.resolveProblemCheck();
	}

	private mandatoryEnsurer(input: HTMLInputElement, _: Event, parameter: InputParameter): void {
		if (this.mandatory) {
			if (input.value == "") {
				parameter.addProblem(`${this.readableName} is mandatory.`);
			}
		}
	}

	public addProblem(problem: string): void {
		if (!this.problems.includes(problem))
			this.problems.push(problem);
	}

	public startProblemCheck(event: Event): void {
		if (!this.problemCheckOngoing) {
			this.problemCheckOngoing = true;
			this.correctnessEnsurer(event);
		}
	}

	private resolveProblemCheck(): void {
		if (this.problems.length > 0) {
			this.setProblemDescription(this.problems.join("<br />"));
			this.problems = [];
		}
		else {
			this.unsetProblem();
		}

		this.problemCheckOngoing = false;
	}

	private setProblemDescription(problem: string): void {
		if (this.wrapper != undefined)
			this.wrapper.classList.add(problemInputClass);

		if (this.loadButton != undefined)
			this.loadButton.disabled = true;

		if (this.problemDescriptionDiv != undefined) {
			this.problemDescriptionDiv.innerHTML = problem;
		}
	}

	private unsetProblem(): void {
		if (this.wrapper != undefined)
			this.wrapper.classList.remove(problemInputClass);

		if (this.loadButton != undefined)
			this.loadButton.disabled = false;

		if (this.problemDescriptionDiv != undefined)
			this.problemDescriptionDiv.textContent = null;
	}

	public onClear(): void {
		this.label = undefined;
		this.input = undefined;
		this.problemDescriptionDiv = undefined;

		this.wrapper = undefined;

		this.loadButton = undefined;

		this.problems = [];
	}

	public getValue(): string {
		if (this.input == undefined)
			return this.initialValue;

		return this.input.value;
	}

	public getValueMandatory(): string {
		if (!this.mandatory)
			throw new NotMandatoryError(this.machineName);

		let value = this.getValue();

		if (value == "")
			value = this.initialValue;

		return value;
	}

	protected getInputId(): string {
		return "input_parameter_" + this.machineName;
	}
}