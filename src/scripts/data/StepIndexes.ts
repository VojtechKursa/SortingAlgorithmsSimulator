/**
 * Represents the indexes of a step.
 */
export class StepIndexes {
	/**
	 * Creates an instance of StepIndexes.
	 * @param full - The full step index of a step.
	 * @param sub - The sub-step index of a step.
	 * @param code - The code step index of a step.
	 */
	public constructor(
		public readonly full: number,
		public readonly sub: number,
		public readonly code: number
	) { }
}