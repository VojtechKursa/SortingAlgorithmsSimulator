import { FullStepResult } from "./FullStepResult";
import { StepResult } from "./StepResult";

export enum StepKind {
	Full,
	Sub,
	Code
}

export class StepKindHelper {
	public static getStepKind(step: StepResult): StepKind {
		if (step instanceof FullStepResult) {
			if (step.isLastSubstep)
				return StepKind.Full;
			else
				return StepKind.Sub;
		} else {
			return StepKind.Code;
		}
	}
}