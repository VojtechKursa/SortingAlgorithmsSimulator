import { IndexedNumber } from "../data/IndexedNumber";
import { FullStepResult } from "../data/stepResults/FullStepResult";
import { StepKind, StepKindHelper } from "../data/stepResults/StepKind";
import { StepResult } from "../data/stepResults/StepResult";

class TemporaryIndexedNumber {
	public constructor(
		public readonly value: number,
		public index: number | null
	) { }

	public freeze(): IndexedNumber {
		return new IndexedNumber(this.value, this.index);
	}
};

class IndexingData {
	public constructor(
		public lastUsedIndex: number,
		public readonly firstNumber: TemporaryIndexedNumber
	) { }
}



export enum HighlightState {
	Selected,
	OrderCorrect,
	OrderSwapped
};

export abstract class SortingAlgorithm {
	private input: Array<IndexedNumber>;
	protected current: Array<IndexedNumber>;
	private finalStepResult: FullStepResult | null;
	private generator: Generator<StepResult>;

	protected constructor(input: number[]) {
		this.input = this.indexInput(input);
		this.current = this.input.slice();
		this.finalStepResult = null;

		this.generator = this.stepForwardInternal();
	}

	public setInput(input: number[]): void {
		this.input = this.indexInput(input);

		this.reset();
	}

	private indexInput(input: number[]): IndexedNumber[] {
		let indexes = new Map<number, IndexingData>();
		let result = new Array<TemporaryIndexedNumber>();

		for (const num of input) {
			let indexData = indexes.get(num);
			let indexedNumber;

			if (indexData == undefined) {
				indexedNumber = new TemporaryIndexedNumber(num, null);
				indexes.set(num, new IndexingData(1, indexedNumber));
			} else {
				if (indexData.lastUsedIndex == 1) {
					indexData.firstNumber.index = 1;
				}

				indexData.lastUsedIndex++;

				indexedNumber = new TemporaryIndexedNumber(num, indexData.lastUsedIndex);
			}

			result.push(indexedNumber);
		}

		return result.map(value => value.freeze());
	}

	public reset(): FullStepResult {
		this.current = this.input.slice();
		this.finalStepResult = null;

		this.resetInternal();

		this.generator = this.stepForwardInternal();

		return this.getInitialStepResult();
	}

	public isCompleted(): boolean {
		return this.finalStepResult != null;
	}

	public stepForward(): StepResult;
	public stepForward(kind: StepKind.Code): StepResult;
	public stepForward(kind: StepKind.Sub | StepKind.Full): StepResult[];
	public stepForward(kind: StepKind = StepKind.Code): StepResult | StepResult[] {
		if (this.finalStepResult != null)
			return kind == StepKind.Code ? this.finalStepResult : [this.finalStepResult];

		let targetIndex = StepKindHelper.getHierarchicalIndex(kind);
		let results = new Array<StepResult>();
		let lastResult: StepResult;

		do {
			lastResult = this.generator.next().value as StepResult;
			results.push(lastResult);
		} while (StepKindHelper.getHierarchicalIndex(lastResult) < targetIndex);

		if (lastResult instanceof FullStepResult && lastResult.final)
			this.finalStepResult = lastResult as FullStepResult;

		if (kind == StepKind.Code) {
			if (results.length > 1)
				throw new Error("Code step returned more than 1 StepResult");

			return lastResult;
		}

		return results;
	}

	protected swapCurrent(indexA: number, indexB: number): void {
		let tmp = this.current[indexA];
		this.current[indexA] = this.current[indexB];
		this.current[indexB] = tmp;
	}

	protected abstract stepForwardInternal(): Generator<StepResult>;
	protected abstract resetInternal(): void;

	public abstract getInitialStepResult(): FullStepResult;
	public abstract getPseudocode(): string[];
}