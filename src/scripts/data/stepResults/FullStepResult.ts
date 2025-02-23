import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";



export abstract class FullStepResult extends StepResult {
	protected constructor(
		public readonly final: boolean = false,
		text: string = "",
		public readonly isLastSubstep: boolean,
		public readonly codeStepResult: CodeStepResult = new CodeStepResult()
	) {
		super(text);
	}
}