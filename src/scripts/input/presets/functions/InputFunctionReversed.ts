import { InputFunction } from "./InputFunction";

/**
 * An input generating function for generating an array of numbers in descending order.
 *
 * The numbers are generated as [length, length - 1, ..., 1].
 */
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