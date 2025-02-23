import { CodeStepResult } from "./stepResults/CodeStepResult";
import { FullStepResult } from "./stepResults/FullStepResult";

export class StepMemory<T extends FullStepResult> {
	public constructor(
		public fullStep?: T,
		public codeStep?: CodeStepResult,
	) { }
}
