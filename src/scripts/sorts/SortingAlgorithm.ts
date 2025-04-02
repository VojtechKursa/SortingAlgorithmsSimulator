import { IndexedNumber } from "../data/IndexedNumber";
import { StepKind, StepKindHelper } from "../data/stepResults/StepKind";
import { StepResult } from "../data/stepResults/StepResult";

/**
 * A class representing a result of indexing an array of numbers into an array of {@link IndexedNumber}
 *
 * @see IndexedNumber
 */
class IndexingResult {
	public constructor(
		public readonly indexedArray: IndexedNumber[],
		public readonly minValue: number | undefined,
		public readonly maxValue: number | undefined,
	) { }
}

/**
 * A class for storing temporary data during indexing of an array of numbers into an array of IndexedNumbers.
 *
 * @see {@link IndexedNumber}
 */
class MutableIndexedNumber extends IndexedNumber {
	public override get index(): number | null {
		return this._index;
	}
	public override set index(value: number | null) {
		this._index = value;
	}

	/**
	 * Freezes the mutable indexed number into an IndexedNumber instance.
	 *
	 * @returns The IndexedNumber instance created from this mutable indexed number.
	 *
	 * @see {@link IndexedNumber}
	 */
	public freeze(): IndexedNumber {
		return new IndexedNumber(this.id, this.value, this.index);
	}
}

/**
 * A class for storing indexing data during the indexing of an array of numbers into an array of IndexedNumbers.
 * This class is used to index values in the array that have the same value and index them in the context of other same-value elements.
 *
 * @see {@link IndexedNumber}
 */
class IndexingData {
	/**
	 * @param lastUsedIndex - The last used index for an associated value.
	 * @param firstNumber - The first number with the associated value, for backward assigning of index when a number with the same value is found.
	 */
	public constructor(
		public lastUsedIndex: number,
		public readonly firstNumber: MutableIndexedNumber
	) { }
}



/**
 * A state of highlight of an element in an array.
 */
export const enum HighlightState {
	Selected,
	OrderCorrect,
	OrderSwapped
};



/**
 * A class representing a sorting algorithm.
 */
export abstract class SortingAlgorithm {
	/**
	 * The input array of the algorithm.
	 */
	private _input: readonly IndexedNumber[];

	/**
	 * The input array of the algorithm.
	 */
	protected get input(): readonly IndexedNumber[] {
		return this._input;
	}
	private set input(value: readonly IndexedNumber[]) {
		this._input = value;
	}

	/**
	 * The minimum of the input array
	*/
	private minValue: number | undefined;

	/**
	 * The maximum of the input array
	 */
	private maxValue: number | undefined;

	/**
	 * Gets the range of values in the input array
	 */
	public get rangeOfValues(): [number | undefined, number | undefined] {
		return [this.minValue, this.maxValue];
	}



	/**
	 * The final step result of the algorithm.
	 */
	private finalStepResult: StepResult | null;

	/**
	 * The generator for generating the algorithm's steps.
	 */
	private generator: Generator<StepResult>;

	/**
	 * @param input - The input array for the algorithm.
	 */
	protected constructor(input: readonly number[]) {
		const indexingResult = SortingAlgorithm.indexInput(input);

		this._input = indexingResult.indexedArray;
		this.minValue = indexingResult.minValue;
		this.maxValue = indexingResult.maxValue;

		this.finalStepResult = null;

		this.generator = this.stepForwardInternal();
	}

	/**
	 * Checks if the algorithm has completed.
	 *
	 * @returns True if the algorithm has completed, false otherwise.
	 */
	public get completed(): boolean {
		return this.finalStepResult != null;
	}

	/**
	 * Sets the input array for the algorithm.
	 *
	 * @param input - The input array for the algorithm.
	 */
	public setInput(input: readonly number[]): void {
		const indexingResult = SortingAlgorithm.indexInput(input);

		this.input = indexingResult.indexedArray;
		this.minValue = indexingResult.minValue;
		this.maxValue = indexingResult.maxValue;

		this.reset();
	}

	/**
	 * Indexes an array of numbers.
	 *
	 * @param input - The input array to index.
	 *
	 * @returns The input array, indexed as an array of IndexedNumber along with the minimum and maximum values in the array.
	 *
	 * @see {@link IndexedNumber}
	 */
	private static indexInput(input: readonly number[]): IndexingResult {
		let indexes = new Map<number, IndexingData>();
		let result = new Array<MutableIndexedNumber>();
		let idCounter = 0;
		let min: number | undefined = undefined;
		let max: number | undefined = undefined;

		for (const num of input) {
			let indexData = indexes.get(num);
			let indexedNumber: MutableIndexedNumber;

			if (min == undefined || num < min) {
				min = num;
			}
			if (max == undefined || num > max) {
				max = num;
			}

			if (indexData == undefined) {
				indexedNumber = new MutableIndexedNumber(idCounter, num, null);
				indexes.set(num, new IndexingData(1, indexedNumber));
			} else {
				if (indexData.lastUsedIndex == 1) {
					indexData.firstNumber.index = 1;
				}

				indexData.lastUsedIndex++;

				indexedNumber = new MutableIndexedNumber(idCounter, num, indexData.lastUsedIndex);
			}

			result.push(indexedNumber);
			idCounter++;
		}

		return new IndexingResult(result.map(value => value.freeze()), min, max);
	}

	/**
	 * Resets the algorithm.
	 *
	 * @returns The initial step of the algorithm.
	 */
	public reset(): StepResult {
		this.finalStepResult = null;

		this.resetInternal();

		this.generator = this.stepForwardInternal();

		return this.getInitialStepResult();
	}

	/**
	 * Steps the algorithm forward by one step.
	 * Equivalent to calling stepForward(StepKind.Code).
	 *
	 * @returns The step result generated by the step of the algorithm.
	 */
	public stepForward(): StepResult;
	/**
	 * Steps the algorithm forward by one code step.
	 *
	 * @returns The step result generated by the step of the algorithm.
	 */
	public stepForward(kind: StepKind.Code): StepResult;
	/**
	 * Steps the algorithm forward by one algorithmic or significant step.
	 *
	 * @param kind - The kind of step to take.
	 *
	 * @returns The step results generated by the steps of the algorithm until the first step of the desired kind was reached.
	 *
	 * @see {@link StepKind}
	 */
	public stepForward(kind: StepKind.Significant | StepKind.Algorithmic): StepResult[];
	/**
	 * Steps the algorithm forward by one step.
	 *
	 * @param kind - The kind of step to take. Defaults to StepKind.Code.
	 *
	 * @returns The step results generated by the steps of the algorithm until the first step of the desired kind was reached.
	 * 			If the desired kind is StepKind.Code, only one step is always taken anyway so only that one step is returned.
	 *
	 * @see {@link StepKind}
	 * @see {@link StepResult}
	 */
	public stepForward(kind: StepKind = StepKind.Code): StepResult | StepResult[] {
		if (this.finalStepResult != null)
			return kind == StepKind.Code ? this.finalStepResult : [this.finalStepResult];

		let targetIndex = StepKindHelper.getHierarchicalIndex(kind);
		let results = new Array<StepResult>();
		let lastResult: StepResult | undefined;
		let generatorResult: IteratorResult<StepResult, any>;

		do {
			generatorResult = this.generator.next();
			if (generatorResult.value instanceof StepResult)
				lastResult = generatorResult.value;

			if (lastResult == undefined) {
				if (generatorResult.done ?? false) {
					throw new Error("Step generation ended before final result.");
				} else {
					throw new Error("Step generator returned invalid result");
				}
			}

			results.push(lastResult);
		} while (StepKindHelper.getHierarchicalIndex(lastResult) < targetIndex);

		if (lastResult.final)
			this.finalStepResult = lastResult;

		if (kind == StepKind.Code) {
			if (results.length > 1)
				throw new Error("Code step returned more than 1 StepResult");

			return lastResult;
		}

		return results;
	}



	/**
	 * The internal implementation of stepping the algorithm forward.
	 * This method should be overridden by the algorithm implementation.
	 *
	 * @returns A generator for generating the steps of the algorithm.
	 *
	 * @see {@link StepResult}
	 */
	protected abstract stepForwardInternal(): Generator<StepResult>;

	/**
	 * The internal implementation of resetting the algorithm.
	 * This method should be overridden by the algorithm implementation and is called after the parent SortingAlgorithm finishes it's reset.
	 */
	protected abstract resetInternal(): void;



	/**
	 * Retrieves the initial step result of the algorithm.
	 *
	 * @returns The initial step result of the algorithm.
	 */
	public abstract getInitialStepResult(): StepResult;

	/**
	 * Retrieves the pseudocode of the algorithm.
	 *
	 * @returns The pseudocode of the algorithm.
	 */
	public abstract getPseudocode(): string[];
}