import { StepResult } from "./StepResult";

/**
 * Represents a kind of a step in a sorting algorithm.
 */
export const enum StepKind {
	Algorithmic,
	Significant,
	Code
}

/**
 * Represents a description of a kind of a step in a sorting algorithm.
 */
export class StepKindDescription {
	public constructor(
		public readonly machineName: string,
		public readonly displayName: string
	) { }
}

/**
 * Provides helper methods for working with StepKind.
 * @see {@link StepKind}
 */
export class StepKindHelper {
	/**
	 * A map of StepKinds and the corresponding StepKindDescriptions.
	 */
	private static readonly stepKindsMap = new Map<StepKind, StepKindDescription>([
		[StepKind.Code, new StepKindDescription("code", "Code step")],
		[StepKind.Significant, new StepKindDescription("significant", "Significant step")],
		[StepKind.Algorithmic, new StepKindDescription("algorithmic", "Algorithmic step")]
	]);

	/**
	 * Gets the hierarchical index of a given step kind.
	 * If StepResult is passed, the kind is taken from the step kind of the step.
	 * @see {@link StepResult.stepKind}
	 *
	 * @param value - The step or step kind to get the hierarchical index of.
	 *
	 * @returns The hierarchical index of the given step or step kind
	 */
	public static getHierarchicalIndex(value: StepKind | StepResult): number {
		let kind = value instanceof StepResult ? value.stepKind : value;

		switch (kind) {
			case StepKind.Code: return 0;
			case StepKind.Significant: return 1;
			case StepKind.Algorithmic: return 2;
		}
	}

	/**
	 * Gets a step kind by its hierarchical index.
	 * @param index - The hierarchical index of the step kind to get.
	 * @returns The step kind with the given hierarchical index or undefined if no step kind with the given index exists.
	 */
	public static getByHierarchicalIndex(index: number): StepKind | undefined {
		switch (index) {
			case 0: return StepKind.Code;
			case 1: return StepKind.Significant;
			case 2: return StepKind.Algorithmic;
			default: return undefined;
		}
	}

	/**
	 * Gets an array of descriptions of all step kinds.
	 * The array is generated, so modifications to it won't affect the data in the {@link StepKindHelper}.
	 * @returns An array of descriptions of all step kinds.
	 * @see {@link StepKindDescription}
	 */
	public static getStepKindsStrings(): StepKindDescription[] {
		let set = new Set<StepKind>();
		let result = new Array<StepKindDescription>();

		for (const keyPair of this.stepKindsMap) {
			if (!set.has(keyPair[0])) {
				set.add(keyPair[0]);
				result.push(keyPair[1]);
			}
		}

		return result;
	}

	/**
	 * Gets a step kind corresponding to a given machine name.
	 * @param text - The machine name of the step kind to get.
	 * @returns The step kind which corresponds to the given machine name or undefined if no step kind corresponding to the given machine name exists.
	 * @see {@link StepKindDescription.machineName}
	 */
	public static fromString(text: string | null | undefined): StepKind | undefined {
		if (text == null || text == undefined)
			return undefined;

		for (const keyPair of this.stepKindsMap) {
			if (keyPair[1].machineName == text)
				return keyPair[0];
		}

		return undefined;
	}

	/**
	 * Gets a description corresponding to a given step kind.
	 * @param kind - The step kind whose description to get.
	 * @returns The description of the given step kind.
	 * @see {@link StepKindDescription}
	 */
	public static toString(kind: StepKind): StepKindDescription {
		let result = this.stepKindsMap.get(kind);

		if (result == undefined)
			throw new Error("StepKind without toString implementation");

		return result;
	}

	/**
	 * Gets the step kind that is next or previous in relation to the step kind given by the referenceKind parameter.
	 * Which step kind is considered next or previous is determined by the step kind's hierarchical index.
	 * @see {@link StepKindHelper.getHierarchicalIndex}
	 *
	 * @param referenceKind - The step kind to use as a reference for the operation.
	 * @param next - Whether to get the next step kind or the previous step kind relative to the reference kind.
	 * @param wrapAround - Whether to wrap around the step kinds if requesting the previous kind relative to the first one or the next kind relative to the last one.
	 * @returns The step kind that is relatively next or previous to the given referenceKind.
	 * 			Null if wrapAround is set to false and requesting previous step kind of the first step kind or next step kind of the last step kind.
	 * @throws Error if StepKindHelper has an invalid map and a wrapAround is requested. (in case wrap around is set to false, the method will return null instead)
	 */
	public static getRelativeKind(referenceKind: StepKind, next: boolean, wrapAround: true): StepKind;
	public static getRelativeKind(referenceKind: StepKind, next: boolean, wrapAround: false): StepKind | null;
	public static getRelativeKind(referenceKind: StepKind, next: boolean, wrapAround: boolean): StepKind | null {
		let targetIndex = this.getHierarchicalIndex(referenceKind) + (next ? 1 : -1);

		if (wrapAround) {
			if (next)
				targetIndex = targetIndex % this.stepKindsMap.size;
			else {
				if (targetIndex < 0)
					targetIndex = this.stepKindsMap.size - 1;
			}

			const result = this.getByHierarchicalIndex(targetIndex);
			if (result == undefined)
				throw new Error("StepKindHelper has invalid map");

			return result;
		} else {
			const result = this.getByHierarchicalIndex(targetIndex);

			return result ?? null;
		}
	}
}