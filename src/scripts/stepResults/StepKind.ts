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

	public static getHierarchicalIndex(value: StepKind | StepResult): number {
		let kind = value instanceof StepResult ? StepKindHelper.getStepKind(value) : value;

		switch (kind) {
			case StepKind.Code: return 0;
			case StepKind.Sub: return 1;
			case StepKind.Full: return 2;
		}
	}
}