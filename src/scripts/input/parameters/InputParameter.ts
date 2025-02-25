import { problemInputClass, problemDescriptionDivClass, inputWrapperClass } from "../../visualization/css/GenericClasses";
import { inputPresetDivClass } from "../../visualization/css/InputDialogClasses";
import { NotMandatoryError } from "../../errors/NotMandatoryError";

/**
 * An error message for when a value is attempted to be retrieved from a PresetParameter that hasn't been initialized (doesn't have an associated input).
 */
export const nullInputErrorMessage: string = "Attempted to get value from PresetParameter that doesn't have associated input.";

/**
 * A function representing a listener to be called for checking the correctness of an input.
 *
 * @param inputElement - The input element containing the input to check.
 * @param event - The event that triggered the check.
 * @param parameter - The input parameter associated with the check. Used as a callback to the parameter for adding validation problems.
 *
 * @see InputParameter
 */
export type InputCorrectnessListener = (inputElement: HTMLInputElement, event: Event, parameter: InputParameter) => void;

/**
 * A class representing an input parameter.
 *
 * It's purpose is to simplify common operations on input, like generating the input form elements,
 * 	performing basic validation or displaying validation problems.
 */
export class InputParameter {
	/**
	 * The listeners to be called for checking the correctness of the input.
	 */
	protected listeners: Array<InputCorrectnessListener> = [];

	/**
	 * The div element containing the input form elements.
	 */
	protected wrapper: HTMLDivElement | undefined;

	/**
	 * The label element that labels the input.
	 */
	protected label: HTMLLabelElement | undefined;

	/**
	 * The input element containing the input for the parameter.
	 */
	protected input: HTMLInputElement | undefined;

	/**
	 * The div element containing the descriptions of all potential validation problems.
	 */
	protected problemDescriptionDiv: HTMLDivElement | undefined;

	/**
	 * The button for finally loading the input of the parameter.
	 *
	 * This button is to be disabled when there are validation problems with the input.
	 */
	private loadButton: HTMLButtonElement | undefined;

	/**
	 * The list of current validation problems.
	 */
	private problems: string[] = [];

	/**
	 * A flag indicating whether a validation problem check is ongoing (whether any InputCorrectnessListener calls are in progress).
	 */
	private problemCheckOngoing: boolean = false;

	/**
	 * Creates an instance of InputParameter.
	 *
	 * @param machineName - The machine name of the parameter.
	 * @param readableName - The human-readable name of the parameter.
	 * @param initialValue - The initial value of the parameter.
	 * @param mandatory - A flag indicating whether the parameter is mandatory.
	 */
	public constructor(
		public readonly machineName: string,
		public readonly readableName: string,
		public readonly initialValue: string,
		private mandatory: boolean
	) {
		this.listeners.push((input, event, parameter) => this.mandatoryEnsurer(input, event, parameter));
	}

	/**
	 * Sets the mandatory flag of the parameter.
	 *
	 * The problems related to whether the parameter is mandatory or not are updated immediately.
	 */
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

	/**
	 * Retrieves the mandatory flag of the parameter.
	 */
	public get Mandatory(): boolean {
		return this.mandatory;
	}

	/**
	 * Generate the input form for this input parameter.
	 *
	 * @param parametersDiv The div element into which the input form is to be generated. (The input form wrapper)
	 * @param loadButton The button for finally loading the input, to be disabled when there are validation problems.
	 */
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

	/**
	 * Adds a listener to be called when checking the correctness of the input.
	 *
	 * @param listener - The listener to add.
	 */
	public addInputListener(listener: InputCorrectnessListener): void {
		this.listeners.push(listener);
	}

	/**
	 * Calls all listeners for checking the correctness of the input.
	 *
	 * @param event - The event that triggered the check.
	 */
	private correctnessEnsurer(event: Event): void {
		if (this.input == undefined)
			return;

		for (const listener of this.listeners) {
			listener(this.input, event, this);
		}

		this.resolveProblemCheck();
	}

	/**
	 * An InputCorrectnessListener that checks whether an input marked as mandatory is non-empty and if not, adds a problem to the input parameter.
	 *
	 * @see InputCorrectnessListener - for definition of the method's parameters.
	 */
	private mandatoryEnsurer(input: HTMLInputElement, _: Event, parameter: InputParameter): void {
		if (this.mandatory) {
			if (input.value == "") {
				parameter.addProblem(`${this.readableName} is mandatory.`);
			}
		}
	}

	/**
	 * Adds a problem to the input parameter.
	 *
	 * @param problem - The textual description of a problem to add.
	 */
	public addProblem(problem: string): void {
		if (!this.problems.includes(problem))
			this.problems.push(problem);
	}

	/**
	 * Starts an input validation problem check on the input parameter.
	 *
	 * @param event - The event that triggered the check.
	 */
	public startProblemCheck(event: Event): void {
		if (!this.problemCheckOngoing) {
			this.problemCheckOngoing = true;
			this.correctnessEnsurer(event);
		}
	}

	/**
	 * Finishes an input validation problem check.
	 */
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

	/**
	 * Updates the input parameter elements to display a given validation problem.
	 *
	 * @param problem - The textual description of a validation problem (or multiple, joined together).
	 */
	private setProblemDescription(problem: string): void {
		if (this.wrapper != undefined)
			this.wrapper.classList.add(problemInputClass);

		if (this.loadButton != undefined)
			this.loadButton.disabled = true;

		if (this.problemDescriptionDiv != undefined) {
			this.problemDescriptionDiv.innerHTML = problem;
		}
	}

	/**
	 * Clears any validation problems from the UI of the input parameter.
	 */
	private unsetProblem(): void {
		if (this.wrapper != undefined)
			this.wrapper.classList.remove(problemInputClass);

		if (this.loadButton != undefined)
			this.loadButton.disabled = false;

		if (this.problemDescriptionDiv != undefined)
			this.problemDescriptionDiv.textContent = null;
	}

	/**
	 * Resets the internal state of the input parameter.
	 *
	 * Call this when unloading the input parameter..
	 */
	public onClear(): void {
		this.label = undefined;
		this.input = undefined;
		this.problemDescriptionDiv = undefined;

		this.wrapper = undefined;

		this.loadButton = undefined;

		this.problems = [];
	}

	/**
	 * Retrieves the value of the input parameter.
	 *
	 * @returns The value of the input parameter.
	 */
	public getValue(): string {
		if (this.input == undefined)
			return this.initialValue;

		return this.input.value;
	}

	/**
	 * Retrieves the value from a mandatory the input parameter.
	 *
	 * @returns The value of the input parameter.
	 * @throws NotMandatoryError - If the parameter is not mandatory.
	 */
	public getValueMandatory(): string {
		if (!this.mandatory)
			throw new NotMandatoryError(this.machineName);

		let value = this.getValue();

		if (value == "")
			value = this.initialValue;

		return value;
	}

	/**
	 * Retrieves the id of the input element of this input parameter.
	 *
	 * @returns The id of the input element.
	 */
	protected getInputId(): string {
		return "input_parameter_" + this.machineName;
	}
}