import { InputFunction } from "./InputFunction";

export class InputFunctionReversed extends InputFunction {
	public constructor() {
		super("Reversed");
	}

	public getArray(): number[] {
		const length = this.lengthParameter.getValueNumberMandatory();
		
		let result = new Array(length);

		for (let i = 0; i < result.length; i++) {
			result[i] = length - i;
		}

		return result;
	}
}