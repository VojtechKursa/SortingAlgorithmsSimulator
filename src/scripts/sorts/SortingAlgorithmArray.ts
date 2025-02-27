import { CallStack } from "../data/CallStack";
import { IndexedNumber } from "../data/IndexedNumber";
import { StepKind } from "../data/stepResults/StepKind";
import { StepResult } from "../data/stepResults/StepResult";
import { StepResultArray } from "../data/stepResults/StepResultArray";
import { Variable } from "../data/Variable";
import { UnsupportedStepResultError } from "../errors/UnsupportedStepResultError";
import { ReadOnlyHighlights } from "../visualization/Highlights";
import { SortingAlgorithm } from "./SortingAlgorithm";

export abstract class SortingAlgorithmArray extends SortingAlgorithm {
	/**
	 * The current working version of the input array of the algorithm.
	 */
	protected _current: Array<IndexedNumber>;

	/**
	 * The last highlights of the array.
	 */
	private lastArrayHighlights: ReadOnlyHighlights | null = null;

	/**
	 * The generator for generating the algorithm's steps.
	 */
	private arrayGenerator: Generator<StepResultArray>;



	protected constructor(input: number[]) {
		super(input);

		this._current = this.input.slice();
		this.arrayGenerator = this.stepForwardArray();
	}



	/**
	 * The current working version of the input array of the algorithm.
	 */
	protected get current(): Array<IndexedNumber> {
		return this._current;
	}
	private set current(value: Array<IndexedNumber>) {
		this._current = value;
	}



	public override reset(): StepResultArray {
		this.current = this.input.slice();
		this.arrayGenerator = this.stepForwardArray();

		const result = super.reset();
		if (result instanceof StepResultArray)
			return result;
		else
			throw new Error();
	}

	/**
	 * Creates a new code step result of the algorithm.
	 * Simplifies common operations made by child sorting algorithm implementations.
	 *
	 * @param highlightedLines - The lines of code to highlight in the debugger.
	 * @param description - The textual description of the step.
	 * @param variables - The state of variables in the algorithm.
	 * @param callStack - The call stack of the algorithm.
	 *
	 * @returns The new code step result.
	 */
	protected makeCodeStepResult(highlightedLines: number[] | number, description?: string, variables?: Variable[], callStack?: CallStack): StepResultArray {
		return new StepResultArray(StepKind.Code, this.current, this.lastArrayHighlights, description, highlightedLines, variables, false, callStack);
	}

	/**
	 * Swaps two elements in the current array.
	 *
	 * @param indexA - The index of the first element to swap.
	 * @param indexB - The index of the second element to swap.
	 */
	protected swapCurrent(indexA: number, indexB: number): void {
		let tmp = this.current[indexA];
		this.current[indexA] = this.current[indexB];
		this.current[indexB] = tmp;
	}

	/**
	 * The internal implementation of stepping the algorithm forward.
	 * This method should be overridden by the algorithm implementation.
	 *
	 * @returns A generator for generating the steps of the algorithm.
	 *
	 * @see {@link StepResultArray}
	 */
	protected abstract stepForwardArray(): Generator<StepResultArray>;
	protected *stepForwardInternal(): Generator<StepResult> {
		let result = this.arrayGenerator.next();
		if (result.done ?? false) {
			if (result.value instanceof StepResult)
				yield result.value;
			return;
		}

		let step: StepResultArray;

		while (true) {
			if (!(result.value instanceof StepResultArray)) {
				throw new UnsupportedStepResultError(["StepResultArray"]);
			}

			step = result.value;

			this.lastArrayHighlights = step.arrayHighlights;

			yield step;

			if (result.done ?? false)
				return;

			result = this.arrayGenerator.next();
		}
	}

	/**
	 * Retrieves the initial array step result of the algorithm.
	 *
	 * @returns The initial array step result of the algorithm.
	 */
	public abstract getInitialStepResultArray(): StepResultArray;
	public getInitialStepResult(): StepResult {
		return this.getInitialStepResultArray();
	}
}