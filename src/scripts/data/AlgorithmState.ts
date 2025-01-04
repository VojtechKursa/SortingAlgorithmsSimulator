import { StepIndexes } from "./StepIndexes";
import { CodeStepResult } from "./stepResults/CodeStepResult";
import { FullStepResult } from "./stepResults/FullStepResult";
import { StepKind } from "./stepResults/StepKind";

export class AlgorithmState {
	public constructor(
		public readonly codeStepResult: CodeStepResult,
		public readonly fullStepResult: FullStepResult,
		public readonly stepKind: StepKind,
		public readonly stepsIndex: StepIndexes
	) { }
}