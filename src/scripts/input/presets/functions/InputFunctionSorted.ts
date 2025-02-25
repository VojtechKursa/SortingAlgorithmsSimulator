import { InputFunction } from "./InputFunction";

/**
 * An input generating function for generating an array of numbers in ascending order.
 *
 * The numbers are generated as [1, 2, ..., length].
 */
export class InputFunctionSorted extends InputFunction {
	public constructor() {
		super("Sorted");
	}

	public getArray(): number[] {
		const length = this.lengthParameter.getValueNumberMandatory();
		const startValue = 1;

		let result = new Array(length);

		for (let i = 0; i < result.length; i++) {
			result[i] = i + startValue;
		}

		return result;
	}
}