import { CodeStepResult } from "./stepResults/CodeStepResult";
import { FullStepResult } from "./stepResults/FullStepResult";

/**
 * A memory object for storing a pair of a full step and a code step.
 * Useful i.e. for storing the last rendered step.
 */
export class StepMemory<T extends FullStepResult> {
	/**
	 * Creates an instance of StepMemory.
	 * @param fullStep - The initial full step stored in the memory.
	 * @param codeStep - The initial code step stored in the memory.
	 */
	public constructor(
		public fullStep?: T,
		public codeStep?: CodeStepResult,
	) { }
}
