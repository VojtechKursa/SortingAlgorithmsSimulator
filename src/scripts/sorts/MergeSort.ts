import { SortingAlgorithm } from "./SortingAlgorithm";
import { Variable } from "../data/Variable";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { CallStack } from "../data/CallStack";
import { StepKind } from "../data/stepResults/StepKind";
import { AnnotatedArray, StepResultMultiArray } from "../data/stepResults/StepResultMultiArray";
import { IndexedNumber } from "../data/IndexedNumber";
import { EmptyQueueError } from "../errors/EmptyQueueError";
import { Highlights } from "../visualization/Highlights";

const enum MergeSortState {
	CompareQueueHeads,
	SwappedFromLeft,
	SwappedFromRight,
}

export class MergeSort extends SortingAlgorithm {
	protected callStack: CallStack = new CallStack();

	protected lastFullStep: StepResultMultiArray;

	protected array: IndexedNumber[];

	protected leftQueue?: IndexedNumber[];
	protected rightQueue?: IndexedNumber[];

	protected begin?: number;
	protected mid?: number;
	protected end?: number;

	protected k?: number;

	protected mainArrayName: string = "A";
	protected leftQueueName: string = "L";
	protected rightQueueName: string = "R";

	public constructor(input: number[]) {
		super(input);

		this.array = this.input.slice();

		this.lastFullStep = this.getInitialStepResult();
	}

	protected static setDuplicatesAsUnimportant(array: IndexedNumber[], highlights: Highlights) {
		for (let i = 0; i < array.length; i++) {
			if (array[i].duplicated) {
				highlights.set(i, SymbolicColor.Element_Unimportant);
			}
		}
	}

	protected makeFullStepResult(
		stepKind: StepKind.Algorithmic | StepKind.Significant,
		description: string,
		state: MergeSortState | undefined,
		highlightedLines: number[] | number,
		final: boolean = false,
	): StepResultMultiArray {
		const mainHighlights = new Map<number, SymbolicColor>();
		const arrays: AnnotatedArray[] = [new AnnotatedArray(this.array, mainHighlights, this.getVariables(), final ? undefined : this.mainArrayName)];
		MergeSort.setDuplicatesAsUnimportant(this.array, mainHighlights);

		if (final) {
			for (let i = 0; i < this.input.length; i++) {
				mainHighlights.set(i, SymbolicColor.Element_Sorted);
			}
		}
		else {
			let leftHighlights: Highlights | undefined;
			if (this.leftQueue != undefined) {
				leftHighlights = new Map<number, SymbolicColor>();
				arrays.push(new AnnotatedArray(this.leftQueue, leftHighlights, [], this.leftQueueName));
				MergeSort.setDuplicatesAsUnimportant(this.leftQueue, leftHighlights);
			}
			let rightHighlights: Highlights | undefined;
			if (this.rightQueue != undefined) {
				rightHighlights = new Map<number, SymbolicColor>();
				arrays.push(new AnnotatedArray(this.rightQueue, rightHighlights, [], this.rightQueueName));
				MergeSort.setDuplicatesAsUnimportant(this.rightQueue, rightHighlights);
			}

			if (state != undefined) {
				switch (state) {
					case MergeSortState.CompareQueueHeads:
						if (leftHighlights != undefined && rightHighlights != undefined) {
							leftHighlights.set(0, SymbolicColor.Element_Highlight_1);
							rightHighlights.set(0, SymbolicColor.Element_Highlight_2);
						}
						break;
					case MergeSortState.SwappedFromLeft:
					case MergeSortState.SwappedFromRight:
						if (this.k != undefined)
							mainHighlights.set(this.k, SymbolicColor.Element_OrderCorrect);
						break;
				}
			}
		}

		const result = new StepResultMultiArray(stepKind, final, description, highlightedLines, arrays, undefined, this.callStack);
		this.lastFullStep = result;
		return result;
	}

	protected makeCodeStepResult(highlightedLines: number[] | number, text: string | undefined = undefined): StepResultMultiArray {
		const arrays = [new AnnotatedArray(this.array, this.lastFullStep.arrays[0].step.arrayHighlights, this.getVariables(), this.mainArrayName)];
		if (this.leftQueue != undefined) {
			const highlights = this.lastFullStep.arrays.length >= 2 ? this.lastFullStep.arrays[1].step.arrayHighlights : null;
			arrays.push(new AnnotatedArray(this.leftQueue, highlights, [], this.leftQueueName));
		}
		if (this.rightQueue != undefined) {
			const highlights = this.lastFullStep.arrays.length >= 3 ? this.lastFullStep.arrays[2].step.arrayHighlights : null;
			arrays.push(new AnnotatedArray(this.rightQueue, highlights, [], this.rightQueueName));
		}

		return new StepResultMultiArray(StepKind.Code, false, text, highlightedLines, arrays, undefined, this.callStack);
	}

	protected override * stepForwardInternal(): Generator<StepResultMultiArray> {
		this.callStack.currentFunctionName = "mergeSort";
		yield this.makeFullStepResult(StepKind.Significant, "Initial call to the recursive function", undefined, 1);
		const mergeCall = this.splitMerge(0, this.array.length);
		this.beforeCall("splitMerge");
		for (const step of mergeCall) {
			yield step;
		}
		this.returnFromFunction();
		yield this.makeCodeStepResult(1, "Return from initial call of recursive function");

		this.callStack.currentFunctionName = undefined;
		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted", undefined, 2, true);
	}

	protected * splitMerge(begin: number, end: number): Generator<StepResultMultiArray> {
		this.begin = begin;
		this.end = end;

		yield this.makeCodeStepResult(5, "Check recursion base case");
		if (this.end - this.begin <= 1) {
			yield this.makeCodeStepResult(6, "Reached base case of this recursive branch");
			return;
		} else {
			yield this.makeCodeStepResult(7, "Base case not reached yet");
		}

		this.mid = Math.floor((this.begin + this.end) / 2);
		yield this.makeCodeStepResult(8, "Calculate mid point");

		yield this.makeFullStepResult(StepKind.Significant, "Recursively call splitMerge function on left half", undefined, 9);
		const leftSplit = this.splitMerge(this.begin, this.mid);
		this.beforeCall("splitMerge");
		for (const step of leftSplit) {
			yield step;
		}
		this.returnFromFunction();
		yield this.makeCodeStepResult(9, "Return from recursive call");

		yield this.makeFullStepResult(StepKind.Significant, "Recursively call splitMerge function on right half", undefined, 10);
		const rightSplit = this.splitMerge(this.mid, this.end);
		this.beforeCall("splitMerge");
		for (const step of rightSplit) {
			yield step;
		}
		this.returnFromFunction();
		yield this.makeCodeStepResult(10, "Return from recursive call");

		yield this.makeFullStepResult(StepKind.Algorithmic, "Merge the sorted halves", undefined, 11);
		const mergeCall = this.merge(this.begin, this.mid, this.end)
		this.beforeCall("merge");
		for (const step of mergeCall) {
			yield step;
		}
		this.returnFromFunction();
		yield this.makeCodeStepResult(11, "Return from merge function");

		yield this.makeCodeStepResult(12, "Finish this recursive function");
	}

	protected * merge(begin: number, mid: number, end: number): Generator<StepResultMultiArray> {
		this.begin = begin;
		this.mid = mid;
		this.end = end;

		this.leftQueue = [];
		this.rightQueue = [];
		for (let i = begin; i < end; i++) {
			const original = this.array[i];
			const duplicate = original.duplicate();

			if (i < mid) {
				this.leftQueue.push(original);
			} else {
				this.rightQueue.push(original);
			}

			this.array[i] = duplicate;
		}
		yield this.makeCodeStepResult([15, 16], "Initialize queues");

		this.k = this.begin;
		yield this.makeCodeStepResult(17, "Initialize destination pointer");

		while (this.leftQueue.length > 0 && this.rightQueue.length > 0) {
			yield this.makeCodeStepResult(18, "Check if either queue is empty");

			yield this.makeFullStepResult(StepKind.Significant, "Compare first elements in queues", MergeSortState.CompareQueueHeads, 19);

			if (this.leftQueue[0] <= this.rightQueue[0]) {
				this.array[this.k] = MergeSort.getNumberFromQueue(this.leftQueue);
				yield this.makeFullStepResult(StepKind.Algorithmic, "Left queue contains smaller element", MergeSortState.SwappedFromLeft, 20);
			} else {
				yield this.makeCodeStepResult(21);

				this.array[this.k] = MergeSort.getNumberFromQueue(this.rightQueue);
				yield this.makeFullStepResult(StepKind.Algorithmic, "Right queue contains smaller element", MergeSortState.SwappedFromRight, 22);
			}
			yield this.makeCodeStepResult(23);

			this.k++;
			yield this.makeCodeStepResult(24, "Update destination pointer");
		}
		yield this.makeCodeStepResult(18, "Check if either queue is empty");
		yield this.makeCodeStepResult(25, "One of the queues is empty, merge the other one");


		while (this.leftQueue.length > 0) {
			yield this.makeCodeStepResult(26, "Check if left queue is empty");

			this.array[this.k] = MergeSort.getNumberFromQueue(this.leftQueue);
			yield this.makeFullStepResult(StepKind.Algorithmic, "Pop number from left queue into the array", MergeSortState.SwappedFromLeft, 27);

			this.k++;
			yield this.makeCodeStepResult(28, "Update destination pointer");
		}
		yield this.makeCodeStepResult(26, "Check if left queue is empty");
		yield this.makeCodeStepResult(29, "Left queue is empty");

		while (this.rightQueue.length > 0) {
			yield this.makeCodeStepResult(30, "Check if right queue is empty");

			this.array[this.k] = MergeSort.getNumberFromQueue(this.rightQueue);
			yield this.makeFullStepResult(StepKind.Algorithmic, "Pop number from right queue into the array", MergeSortState.SwappedFromRight, 31);

			this.k++;
			yield this.makeCodeStepResult(32, "Update destination pointer");
		}
		yield this.makeCodeStepResult(30, "Check if right queue is empty");
		yield this.makeCodeStepResult(33, "Right queue is empty");

		yield this.makeCodeStepResult(34, "Merge complete");
	}

	protected static getNumberFromQueue(queue: IndexedNumber[]): IndexedNumber {
		const element = queue.shift();
		if (element == undefined)
			throw new EmptyQueueError();

		return element;
	}

	protected getVariables(): Variable[] {
		const variables: Variable[] = [];

		if (this.k != undefined)
			variables.push(new Variable("k", this.k, SymbolicColor.Variable_2));
		if (this.begin != undefined)
			variables.push(new Variable("begin", this.begin, SymbolicColor.Variable_3));
		if (this.mid != undefined)
			variables.push(new Variable("mid", this.mid, SymbolicColor.Variable_4));
		if (this.end != undefined)
			variables.push(new Variable("end", this.end, SymbolicColor.Variable_3));

		return variables;
	}

	protected resetInternal(): void {
		this.resetVariables();

		this.callStack = new CallStack();
		this.array = this.input.slice();

		this.lastFullStep = this.getInitialStepResult();
	}

	protected resetVariables(): void {
		this.begin = undefined;
		this.mid = undefined;
		this.end = undefined;

		this.k = undefined;

		this.leftQueue = undefined;
		this.rightQueue = undefined;
	}

	protected beforeCall(nextFunctionName: string): void {
		this.callStack.push(this.getVariables(), nextFunctionName);
		this.resetVariables();
	}

	protected returnFromFunction(): void {
		const level = this.callStack.pop();

		if (level == undefined)
			throw new Error("Failed to return from function, presumably the call stack is empty");

		this.resetVariables();

		level.variables.forEach(variable => {
			switch (variable.name) {
				case "begin": this.begin = variable.value; break;
				case "mid": this.mid = variable.value; break;
				case "end": this.end = variable.value; break;
				case "k": this.k = variable.value; break;
			}
		});
	}

	public override getInitialStepResult(): StepResultMultiArray {
		return new StepResultMultiArray(StepKind.Algorithmic, this.array.length <= 1, undefined, undefined, [new AnnotatedArray(this.array)], undefined, this.callStack);
	}

	public getPseudocode(): string[] {
		return [
			"function mergeSort(A: array)",
			"\tsplitMerge(A, 0, len(A))",
			"end function",
			"",
			"function splitMerge(A: array, begin: int, end: int)",
			"\tif end - begin <= 1",
			"\t\treturn",
			"\tend if",
			"\tmid := floor((begin + end) / 2)",
			"\tsplitMerge(A, begin, mid)",
			"\tsplitMerge(A, mid, end)",
			"\tmerge(A, begin, mid, end)",
			"end function",
			"",
			"function merge(A: array, begin: int, mid: int, end: int)",
			"\tleft := init_queue(A, begin, mid)",
			"\tright := init_queue(A, mid, end)",
			"\tk := begin",
			"\twhile (not empty(left)) and (not empty(right))",
			"\t\tif head(left) <= head(right)",
			"\t\t\tA[k] := pop(left)",
			"\t\telse",
			"\t\t\tA[k] := pop(right)",
			"\t\tend if",
			"\t\tk := k + 1",
			"\tend while",
			"\twhile not empty(left)",
			"\t\tA[k] := pop(left)",
			"\t\tk := k + 1",
			"\tend while",
			"\twhile not empty(right)",
			"\t\tA[k] := pop(right)",
			"\t\tk := k + 1",
			"\tend while",
			"end function",
		]
	}
}