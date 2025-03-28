import { ReadOnlyHighlights } from "../../visualization/Highlights";
import { CallStack, CallStackFrozen } from "../CallStack";
import { IndexedNumber } from "../IndexedNumber";
import { Variable } from "../Variable";
import { StepKind } from "./StepKind";
import { StepResultArray } from "./StepResultArray";



/**
 * Represents a StepResult of HeapSort.
 */
export class StepResultArrayHeapSort extends StepResultArray {
	public constructor(
		public readonly endOfHeap: number,
		public readonly drawHeap: boolean,
		public readonly drawArray: boolean,
		stepKind: StepKind,
		array: readonly IndexedNumber[],
		arrayHighlights: ReadOnlyHighlights | null = null,
		description: string = "",
		highlightedCodeLines?: ReadOnlyHighlights | number | number[],
		variables?: readonly Variable[],
		final?: boolean,
		stack?: CallStack | CallStackFrozen,
	) {
		super(stepKind, array, arrayHighlights, description, highlightedCodeLines, variables, final, stack)
	}

	public static fromStepResultArray(stepResult: StepResultArray, endOfHeap: number, drawHeap: boolean, drawArray: boolean): StepResultArrayHeapSort {
		return new StepResultArrayHeapSort(endOfHeap, drawHeap, drawArray, stepResult.stepKind, stepResult.array, stepResult.arrayHighlights, stepResult.description, stepResult.highlightedCodeLines, stepResult.variables, stepResult.final, stepResult.callStack);
	}
}