import { StepIndexes } from "./StepIndexes";
import { StepResult } from "./stepResults/StepResult";

/**
 * Represents the state of an algorithm at a specific point in time.
 */
export class AlgorithmState {
	public constructor(
		public readonly step: StepResult,
		public readonly index: StepIndexes,
	) { }
}