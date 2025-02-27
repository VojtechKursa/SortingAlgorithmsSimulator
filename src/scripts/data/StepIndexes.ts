import { StepKind } from "./stepResults/StepKind";

/**
 * Represents the indexes of a step.
 */
export class StepIndexes {
	/**
	 * @param algorithmic - The algorithmic step index of a step.
	 * @param significant - The significant step index of a step.
	 * @param code - The code step index of a step.
	 */
	public constructor(
		public readonly algorithmic: number,
		public readonly significant: number,
		public readonly code: number
	) { }

	public getIndex(kind: StepKind): number {
		switch(kind) {
			case StepKind.Algorithmic: return this.algorithmic;
			case StepKind.Significant: return this.significant;
			case StepKind.Code: return this.code;
		}
	}
}