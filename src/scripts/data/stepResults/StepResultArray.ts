import { ReadOnlyHighlights } from "../../visualization/Highlights";
import { CallStack, CallStackFrozen } from "../CallStack";
import { IndexedNumber } from "../IndexedNumber";
import { Variable } from "../Variable";
import { StepKind } from "./StepKind";
import { StepResult } from "./StepResult";



/**
 * Represents a StepResult of a sorting algorithm that uses a single array of numbers as it's internal data structure.
 */
export class StepResultArray extends StepResult {
	/**
	 * The array of numbers that represents the state of the internal data structure of the sorting algorithm at the time of this step.
	 */
	private _array: readonly IndexedNumber[];

	/**
	 * The highlighted elements in the array.
	 */
	private _arrayHighlights: ReadOnlyHighlights | null;

	/**
	 * @param stepKind - The kind of the step.
	 * @param array - The array of numbers that represents the state of the internal data structure of the sorting algorithm at the time of this step.
	 * @param arrayHighlights - The highlighted elements of the array.
	 * @param description - The textual description of the step.
	 * @param highlightedCodeLines - The lines of code to highlight in the debugger.
	 * @param variables - The state of variables in the algorithm.
	 * @param final - Whether the step is the final step of the algorithm.
	 * @param stack - A call stack of the algorithm, if any.
	 */
	public constructor(
		stepKind: StepKind,
		array: readonly IndexedNumber[],
		arrayHighlights: ReadOnlyHighlights | null = null,
		description: string = "",
		highlightedCodeLines?: ReadOnlyHighlights | number | readonly number[],
		variables?: readonly Variable[],
		final?: boolean,
		stack?: CallStack | CallStackFrozen,
	) {
		super(stepKind, final, description, highlightedCodeLines, variables, stack);

		this._array = array.slice();
		this._arrayHighlights = arrayHighlights;
	}

	/**
	 * The array of numbers that represents the state of the internal data structure of the sorting algorithm at the time of this step.
	 */
	public get array(): readonly IndexedNumber[] {
		return this._array;
	}
	protected set array(value: readonly IndexedNumber[]) {
		this._array = value;
	}

	/**
	 * The highlighted elements in the array.
	 */
	public get arrayHighlights(): ReadOnlyHighlights | null {
		return this._arrayHighlights;
	}
	protected set arrayHighlights(value: ReadOnlyHighlights | null) {
		this._arrayHighlights = value;
	}

	public override acceptEqualStepData(step: StepResult): void {
		super.acceptEqualStepData(step);

		if (step instanceof StepResultArray) {
			let arrayEquals = true;

			if (step.array != this.array) {
				if (step.array.length == this.array.length) {
					for (let i = 0; i < step.array.length; i++) {
						if (!IndexedNumber.equals(step.array[i], this.array[i])) {
							arrayEquals = false;
							break;
						}
					}

					if (arrayEquals) {
						this.array = step.array;
					}
				}
				else {
					arrayEquals = false;
				}
			}

			if (step.arrayHighlights != this.arrayHighlights && arrayEquals && step.arrayHighlights != null && this.arrayHighlights != null && step.arrayHighlights.size == this.arrayHighlights.size) {
				let highlightsEqual = true;

				for (const highlight of this.arrayHighlights) {
					const remoteValue = step.arrayHighlights.get(highlight[0]);
					if (remoteValue !== highlight[1]) {
						highlightsEqual = false;
						break;
					}
				}

				if (highlightsEqual) {
					this.arrayHighlights = step.arrayHighlights;
				}
			}
		}
	}
}