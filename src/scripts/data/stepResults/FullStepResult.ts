import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";



/**
 * Represents a step that may change visualization of the internal data structure of a sorting algorithm.
 */
export abstract class FullStepResult extends StepResult {
	/**
	 * @param final - Whether the step is the final step of the algorithm.
	 * @param text - The textual description of the step.
	 * @param isLastSubstep - Whether the step is the last sub-step of a full step of the algorithm.
	 * @param codeStepResult - The code step result that corresponds to the full step.
	 * @see {@link CodeStepResult}
	 */
	protected constructor(
		public readonly final: boolean = false,
		text: string = "",
		public readonly isLastSubstep: boolean,
		public readonly codeStepResult: CodeStepResult = new CodeStepResult()
	) {
		super(text);
	}
}