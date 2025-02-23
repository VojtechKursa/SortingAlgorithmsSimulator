import { Highlights } from "../../visualization/Highlights";
import { IndexedNumber } from "../IndexedNumber";
import { CodeStepResult } from "./CodeStepResult";
import { FullStepResult } from "./FullStepResult";



/**
 * Represents a FullStepResult of a sorting algorithm that uses an array of numbers as it's internal data structure.
 */
export class StepResultArray extends FullStepResult {
	/**
	 * The array of numbers that represents the state of the internal data structure of the sorting algorithm at the time of this step.
	 */
	public readonly array: readonly IndexedNumber[];

	/**
	 * The highlighted elements of the array.
	 */
	public readonly highlights: Highlights | null;

	/**
	 * Creates an instance of StepResultArray.
	 * @param final - Whether the step is the final step of the algorithm.
	 * @param text - The textual description of the step.
	 * @param isLastSubstep - Whether the step is the last sub-step of a full step of the algorithm.
	 * @param codeStepResult - The code step result that corresponds to the full step.
	 * @param array - The array of numbers that represents the state of the internal data structure of the sorting algorithm at the time of this step.
	 * @param highlights - The highlighted elements of the array.
	 */
	public constructor(
		final: boolean,
		text: string,
		isLastSubstep: boolean,
		codeStepResult: CodeStepResult,
		array: IndexedNumber[],
		highlights: Highlights | null
	) {
		super(final, text, isLastSubstep, codeStepResult);

		this.array = array.slice();
		this.highlights = highlights;
	}
}