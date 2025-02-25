import { InputParameter } from "../../parameters/InputParameter";
import { NumberParameter } from "../../parameters/NumberParameter";
import { InputFunction } from "./InputFunction";

/**
 * An input generating function for generating an array of random numbers.
 */
export class InputFunctionRandom extends InputFunction {
	/**
	 * The minimum value of the randomly generated numbers.
	 */
	protected readonly minParameter: NumberParameter;

	/**
	 * The maximum value of the randomly generated numbers.
	 */
	protected readonly maxParameter: NumberParameter;

	public constructor() {
		super("Random");

		this.minParameter = new NumberParameter("min", "Minimum", 0, true);
		this.maxParameter = new NumberParameter("max", "Maximum", 50, true);

		this.minParameter.addInputListener((_, event, parameter) => this.minMaxCorrectnessEnsurer(event, parameter));
		this.maxParameter.addInputListener((_, event, parameter) => this.minMaxCorrectnessEnsurer(event, parameter));

		this.parameters.push(this.minParameter);
		this.parameters.push(this.maxParameter);
	}

	/**
	 * A method to be used as an InputCorrectnessListener that verifies that the minimum and maximum value for the function are valid.
	 *
	 * @param event - The event that triggered the check.
	 * @param parameter - The input parameter that triggered the check.
	 *
	 * @see {@link InputCorrectnessListener}
	 */
	private minMaxCorrectnessEnsurer(event: Event, parameter: InputParameter): void {
		const min = this.minParameter.getValueNumber();
		const max = this.maxParameter.getValueNumber();

		if (min != null && max != null && max < min) {
			const problemString = `${this.minParameter.readableName} must be less or equal to ${this.maxParameter.readableName}.`;

			this.minParameter.addProblem(problemString);
			this.maxParameter.addProblem(problemString);
		}

		if (parameter == this.minParameter)
			this.maxParameter.startProblemCheck(event);
		else if (parameter == this.maxParameter)
			this.minParameter.startProblemCheck(event);
	}

	public getArray(): number[] {
		const length = this.lengthParameter.getValueNumberMandatory();
		const min = this.minParameter.getValueNumberMandatory();
		const max = this.maxParameter.getValueNumberMandatory();

		const diff = max - min;

		let result = new Array(length);

		for (let i = 0; i < result.length; i++) {
			result[i] = Math.round(Math.random() * diff + min);
		}

		return result;
	}
}