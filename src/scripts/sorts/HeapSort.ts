import { StepResultArray } from "../data/stepResults/StepResultArray";
import { HighlightState } from "./SortingAlgorithm";
import { Variable } from "../data/Variable";
import { Highlights } from "../visualization/Highlights";
import { SortingAlgorithmArray } from "./SortingAlgorithmArray";
import { StepKind } from "../data/stepResults/StepKind";
import { CallStack } from "../data/CallStack";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { StepResultArrayHeapSort } from "../data/stepResults/StepResultArrayHeapSort";

export enum HeapSortContext {
	CompareChildren,
	CompareChildAndParent,
	SwapLastToRoot,
}

export class HeapSort extends SortingAlgorithmArray {
	protected callStack: CallStack = new CallStack();
	protected count: number | undefined;
	protected last: number | undefined;

	protected start: number | undefined;

	protected root: number | undefined;
	protected child: number | undefined;

	protected drawArray: boolean = true;
	protected drawHeap: boolean = true;
	protected lastIsOrdered: boolean = false;

	public constructor(input: number[]) {
		super(input);
	}

	protected get endOfHeap(): number {
		if (this.last != undefined) {
			return this.lastIsOrdered ? this.last : this.last + 1;
		} else {
			return this.current.length;
		}
	}

	protected makeFullStepResult(
		stepKind: StepKind.Algorithmic | StepKind.Significant,
		description: string,
		highlightedLines: number[] | number,
		context: HeapSortContext | undefined = undefined,
		highlightState: HighlightState | undefined = undefined,
		final: boolean = false,
		additionalHighlights: Highlights | undefined = undefined
	): StepResultArrayHeapSort {
		const highlights = new Map<number, SymbolicColor>();

		switch (context) {
			case HeapSortContext.SwapLastToRoot:
				if (this.last == undefined)
					break;
				switch (highlightState) {
					case HighlightState.Selected:
						highlights.set(0, SymbolicColor.Variable_1);
						highlights.set(this.last, SymbolicColor.Variable_2);
						break;
					case HighlightState.OrderCorrect:
						highlights.set(0, SymbolicColor.Element_OrderCorrect);
						highlights.set(this.last, SymbolicColor.Element_OrderCorrect);
						break;
					case HighlightState.OrderSwapped:
						highlights.set(0, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.last, SymbolicColor.Element_OrderIncorrect);
						break;
				}
				break;
			case HeapSortContext.CompareChildAndParent:
				if (this.child == undefined || this.root == undefined)
					break;
				switch (highlightState) {
					case HighlightState.Selected:
						highlights.set(this.child, SymbolicColor.Variable_1);
						highlights.set(this.root, SymbolicColor.Variable_2);
						break;
					case HighlightState.OrderCorrect:
						highlights.set(this.child, SymbolicColor.Element_OrderCorrect);
						highlights.set(this.root, SymbolicColor.Element_OrderCorrect);
						break;
					case HighlightState.OrderSwapped:
						highlights.set(this.root, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.parent(this.root), SymbolicColor.Element_OrderIncorrect);
						break;
				}
				break;
			case HeapSortContext.CompareChildren:
				if (this.child == undefined)
					break;
				switch (highlightState) {
					case HighlightState.Selected:
						highlights.set(this.child, SymbolicColor.Variable_1);
						highlights.set(this.child + 1, SymbolicColor.Variable_2);
						break;
					case HighlightState.OrderCorrect:
						highlights.set(this.child, SymbolicColor.Element_OrderCorrect);
						highlights.set(this.child + 1, SymbolicColor.Element_OrderCorrect);
						break;
					case HighlightState.OrderSwapped:
						highlights.set(this.child - 1, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.child, SymbolicColor.Element_OrderIncorrect);
						break;
				}
				break;
		}

		for (let i = this.endOfHeap; i < this.current.length; i++) {
			highlights.set(i, SymbolicColor.Element_Sorted);
		}

		if (additionalHighlights != undefined) {
			for (const highlight of additionalHighlights) {
				highlights.set(highlight[0], highlight[1]);
			}
		}

		return new StepResultArrayHeapSort(this.endOfHeap, this.drawHeap, this.drawArray, stepKind, this.current, highlights, description, highlightedLines, this.getVariables(), final, this.callStack);
	}

	protected override makeCodeStepResult(highlightedLines: number[] | number, text?: string): StepResultArrayHeapSort {
		return StepResultArrayHeapSort.fromStepResultArray(super.makeCodeStepResult(highlightedLines, text, this.getVariables()), this.endOfHeap, true, true);
	}

	protected parent(index: number): number {
		return Math.floor((index - 1) / 2);
	}

	protected override * stepForwardArray(): Generator<StepResultArrayHeapSort> {
		this.callStack.currentFunctionName = "heapSort";
		yield this.makeCodeStepResult(0, "Start Heap Sort");

		const count = this.current.length;
		this.count = count;
		yield this.makeCodeStepResult(1);

		yield this.makeFullStepResult(StepKind.Significant, "Start processing input array into a heap", 2);
		this.beforeCall("makeHeap");
		for (const step of this.makeHeap(count)) {
			yield step;
		}
		this.returnFromFunction();
		yield this.makeFullStepResult(StepKind.Significant, "Input array is now a heap", 2);

		for (this.last = count - 1; this.last > 0; this.last--) {
			this.lastIsOrdered = false;
			yield this.makeCodeStepResult(3, "Check if the algorithm is finished");

			this.swapCurrent(this.last, 0);
			this.lastIsOrdered = true;
			yield this.makeFullStepResult(StepKind.Algorithmic, "Swap root to the end of the heap", 4, HeapSortContext.SwapLastToRoot, HighlightState.OrderSwapped);

			yield this.makeFullStepResult(StepKind.Significant, "Move current root to correct position", 5);
			const siftDown = this.siftDown(0, this.last);
			this.beforeCall("siftDown");
			for (const step of siftDown) {
				yield step;
			}
			this.returnFromFunction();
			yield this.makeFullStepResult(StepKind.Significant, "New root has been moved to the correct position", 5);

			yield this.makeCodeStepResult(6, `Element on index ${this.last} is now in its sorted position`);
		}

		yield this.makeCodeStepResult(3, "Check if the algorithm is finished");
		yield this.makeCodeStepResult(6, "Algorithm is finished");

		this.drawHeap = false;
		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted", 7, undefined, undefined, true);
	}

	protected parentStep(index: number): [StepResultArrayHeapSort, number] {
		return [this.makeCodeStepResult(9, `Calculate parent of element on index ${index}`), this.parent(index)];
	}

	protected leftStep(index: number): [StepResultArrayHeapSort, number] {
		return [this.makeCodeStepResult(10, `Calculate left child of element on index ${index}`), 2 * index + 1];
	}

	protected * makeHeap(count: number): Generator<StepResultArrayHeapSort> {
		this.count = count;

		yield this.makeCodeStepResult(13);
		const parentResult = this.parentStep(this.count - 1);
		yield parentResult[0];

		for (this.start = parentResult[1]; this.start >= 0; this.start--) {
			yield this.makeCodeStepResult(13);

			yield this.makeFullStepResult(StepKind.Significant, `Move element on index ${this.start} to it's correct position in heap`, 14);
			const siftDown = this.siftDown(this.start, this.count);
			this.beforeCall("siftDown");
			for (const step of siftDown) {
				yield step;
			}
			this.returnFromFunction();
			yield this.makeFullStepResult(StepKind.Significant, `Element is now in correct position in the heap`, 14);

			yield this.makeCodeStepResult(15);
		}

		yield this.makeCodeStepResult(13);
		yield this.makeCodeStepResult(15, "Array is now a heap");
		yield this.makeCodeStepResult(16);
	}

	protected * siftDown(root: number, last: number): Generator<StepResultArrayHeapSort> {
		this.root = root;
		this.last = last;

		let left: [StepResultArrayHeapSort, number];
		while ((left = (this.leftStep(this.root)))[1] < this.last) {
			yield this.makeCodeStepResult(19);
			yield left[0];
			this.child = left[1];
			yield this.makeCodeStepResult(19);

			yield this.makeFullStepResult(StepKind.Significant, "Find bigger child node", 20, HeapSortContext.CompareChildren, HighlightState.Selected);

			if (((this.child + 1) < this.last) && (this.current[this.child] < this.current[this.child + 1])) {
				this.child = this.child + 1;
				yield this.makeFullStepResult(StepKind.Significant, "Right child node is bigger, select it", 21, HeapSortContext.CompareChildren, HighlightState.OrderSwapped);

				yield this.makeCodeStepResult(22);
			}
			else {
				yield this.makeFullStepResult(StepKind.Significant, "Left child node is bigger", 22, HeapSortContext.CompareChildren, HighlightState.OrderCorrect);
			}

			yield this.makeFullStepResult(StepKind.Significant, "Compare the selected child node with its parent", 23, HeapSortContext.CompareChildAndParent, HighlightState.Selected);
			if (this.current[this.root] < this.current[this.child]) {
				this.swapCurrent(this.root, this.child);
				this.root = this.child;
				yield this.makeFullStepResult(StepKind.Algorithmic, "Parent is smaller than it's child, swap them and descend one level", [24, 25], HeapSortContext.CompareChildAndParent, HighlightState.OrderSwapped);

				yield this.makeCodeStepResult(28);
			}
			else {
				yield this.makeCodeStepResult(26);
				yield this.makeFullStepResult(StepKind.Algorithmic, "Selected node is in correct position in the heap", 27, HeapSortContext.CompareChildAndParent, HighlightState.OrderCorrect);
				return;
			}

			yield this.makeCodeStepResult(29);
		}

		yield this.makeCodeStepResult(19);
		yield left[0];
		this.child = left[1];
		yield this.makeCodeStepResult(19);
		yield this.makeCodeStepResult(29);
		yield this.makeCodeStepResult(30);
	}

	protected getVariables(): Variable[] {
		let variables = new Array<Variable>();

		if (this.count != undefined)
			variables.push(new Variable("count", this.count, null));
		if (this.start != undefined)
			variables.push(new Variable("start", this.start, SymbolicColor.Variable_1));
		if (this.last != undefined)
			variables.push(new Variable("last", this.last, SymbolicColor.Variable_3));
		if (this.root != undefined)
			variables.push(new Variable("root", this.root, SymbolicColor.Variable_2));
		if (this.child != undefined)
			variables.push(new Variable("child", this.child, SymbolicColor.Variable_1));

		return variables;
	}

	protected resetInternal(): void {
		this.resetVariables();

		this.callStack = new CallStack();
		this.drawArray = true;
		this.drawHeap = true;
		this.lastIsOrdered = false;
	}

	protected resetVariables(): void {
		this.count = undefined;
		this.start = undefined;
		this.root = undefined;
		this.last = undefined;
		this.child = undefined;
	}

	public override getInitialStepResultArray(): StepResultArrayHeapSort {
		return new StepResultArrayHeapSort(this.current.length, this.drawHeap, this.drawArray, StepKind.Algorithmic, this.current, null, undefined, undefined, undefined, this.current.length <= 1, this.callStack);
	}

	protected beforeCall(nextFunctionName: string): void {
		this.callStack.push(this.getVariables(), nextFunctionName);
		this.resetVariables();
	}

	protected returnFromFunction(): void {
		let level = this.callStack.pop();

		if (level == undefined)
			throw new Error("Failed to return from function, presumably the call stack is empty");

		this.resetVariables();

		level.variables.forEach(variable => {
			switch (variable.name) {
				case "count": this.count = variable.value; break;
				case "start": this.start = variable.value; break;
				case "root": this.root = variable.value; break;
				case "last": this.last = variable.value; break;
				case "child": this.child = variable.value; break;
			}
		});
	}

	public getPseudocode(): string[] {
		return [
			"function heapSort(A: array)",
			"\tcount = len(A)",
			"\tmakeHeap(A, count)",
			"\tfor last := count-1 to 1 step -1",
			"\t\tswap(A[last], A[0])",
			"\t\tsiftDown(A, 0, last)",
			"\tend for",
			"end function",
			"",
			"function parent(i: int) = floor((i-1) / 2)",
			"function left(i: int) = 2*i + 1",
			"",
			"function makeHeap(A: array, count: int)",
			"\tfor start := parent(count - 1) to 0 step -1",
			"\t\tsiftDown(A, start, count)",
			"\tend for",
			"end function",
			"",
			"function siftDown(A: array, root: int, last: int)",
			"\twhile (child := left(root)) < last",
			"\t\tif (child + 1 < last) and (A[child] < A[child + 1])",
			"\t\t\tchild := child + 1",
			"\t\tend if",
			"\t\tif A[root] < A[child]",
			"\t\t\tswap(A[root], A[child])",
			"\t\t\troot := child",
			"\t\telse",
			"\t\t\treturn",
			"\t\tend if",
			"\tend while",
			"end function",
		];
	}
}