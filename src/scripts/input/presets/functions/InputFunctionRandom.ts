import { NumberParameter, RoundBehavior } from "../parameters/NumberParameter";
import { InputFunction } from "./InputFunction";

export class InputFunctionRandom extends InputFunction {
	protected readonly minParameter: NumberParameter;
	protected readonly maxParameter: NumberParameter;

	public constructor() {
		super("Random");

		this.minParameter = new NumberParameter("min", "Minimum", 0, true);
		this.maxParameter = new NumberParameter("max", "Maximum", 50, true);

		this.minParameter.addInputListener(this.minMaxCorrectnessEnsurer);
		this.maxParameter.addInputListener(this.minMaxCorrectnessEnsurer);

		this.parameters.push(this.minParameter);
		this.parameters.push(this.maxParameter);
	}

	private minMaxCorrectnessEnsurer(): string | null {
		const min = this.minParameter.getValueNumberMandatory();
		const max = this.maxParameter.getValueNumberMandatory();

		if (min <= max)
			return null;
		else {
			const problemString = `${this.minParameter.readableName} must be less or equal to ${this.maxParameter.readableName}.`;

			this.minParameter.setProblem(problemString);
			this.maxParameter.setProblem(problemString);

			return problemString;
		}
	}

	public getArray(): number[] {
		const length = this.lengthParameter.getValueNumberMandatory();
		const min = this.minParameter.getValueNumberMandatory();
		const max = this.maxParameter.getValueNumberMandatory();

		const diff = max - min;

		let result = new Array(length);

		for (let i = 0; i < result.length; i++) {
			result[i] = Math.floor(Math.random() * diff + min);
		}

		return result;
	}
}