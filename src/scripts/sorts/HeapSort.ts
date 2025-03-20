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
	protected drawHeap: boolean = false;

	public constructor(input: number[]) {
		super(input);
	}

	protected get endOfHeap(): number {
		return this.last ?? this.current.length;
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
						highlights.set(this.child, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.root, SymbolicColor.Element_OrderIncorrect);
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
						highlights.set(this.child, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.child + 1, SymbolicColor.Element_OrderIncorrect);
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

	protected override * stepForwardArray(): Generator<StepResultArrayHeapSort> {
		this.callStack.currentFunctionName = "heapSort";
		yield this.makeCodeStepResult(0, "Enter facade function");

		const count = this.current.length;
		this.count = count;
		yield this.makeCodeStepResult(1);

		yield this.makeFullStepResult(StepKind.Significant, "Start processing input array into a heap", 2);
		this.drawHeap = true;
		this.beforeCall("makeHeap");
		for (const step of this.makeHeap(count)) {
			yield step;
		}
		this.returnFromFunction();
		yield this.makeFullStepResult(StepKind.Significant, "Input array is now a heap", 2);

		this.last = count - 1;
		yield this.makeCodeStepResult(3);

		while (this.last > 0) {
			yield this.makeCodeStepResult(4, "Check if the algorithm is finished");

			yield this.makeFullStepResult(StepKind.Algorithmic, "Swap root to the end of the heap", 5, HeapSortContext.SwapLastToRoot, HighlightState.OrderSwapped);

			yield this.makeFullStepResult(StepKind.Significant, "Move current root to correct position", 6);
			const siftDown = this.siftDown(0, this.last);
			this.beforeCall("siftDown");
			for (const step of siftDown) {
				yield step;
			}
			this.returnFromFunction();
			yield this.makeFullStepResult(StepKind.Significant, "New root has been moved to the correct position", 6);

			this.last--;
			yield this.makeCodeStepResult(7, `Element on index ${this.last} is now in it's sorted position`);
			yield this.makeCodeStepResult(8);
		}

		yield this.makeCodeStepResult(4, "Check if the algorithm is finished");
		yield this.makeCodeStepResult(8, "Algorithm is finished");

		this.drawHeap = false;
		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted", 9, undefined, undefined, true);
	}

	protected parent(index: number): [StepResultArrayHeapSort, number] {
		return [this.makeCodeStepResult(11, `Calculate parent of element on index ${index}`), Math.floor((index - 1) / 2)];
	}

	protected left(index: number): [StepResultArrayHeapSort, number] {
		return [this.makeCodeStepResult(12, `Calculate left child of element on index ${index}`), 2 * index + 1];
	}

	protected * makeHeap(count: number): Generator<StepResultArrayHeapSort> {
		this.count = count;

		yield this.makeCodeStepResult(15);
		const parentResult = this.parent(this.count - 1);
		yield parentResult[0];
		this.start = parentResult[1];
		yield this.makeCodeStepResult(15);

		while (this.start >= 0) {
			yield this.makeCodeStepResult(16);

			yield this.makeFullStepResult(StepKind.Significant, `Move element on index ${this.start} to it's correct position in heap`, 17);
			const siftDown = this.siftDown(this.start, this.count);
			this.beforeCall("siftDown");
			for (const step of siftDown) {
				yield step;
			}
			this.returnFromFunction();
			yield this.makeFullStepResult(StepKind.Significant, `Element is now in correct position in the heap`, 17);

			this.start--;
			yield this.makeCodeStepResult(18);
			yield this.makeCodeStepResult(19);
		}

		yield this.makeCodeStepResult(16);
		yield this.makeCodeStepResult(19, "Array is now a heap");
		yield this.makeCodeStepResult(20);
	}

	protected * siftDown(root: number, last: number): Generator<StepResultArrayHeapSort> {
		this.root = root;
		this.last = last;

		let left: [StepResultArrayHeapSort, number];
		while ((left = (this.left(this.root)))[1] < this.last) {
			yield this.makeCodeStepResult(23);
			yield left[0];
			this.child = left[1];
			yield this.makeCodeStepResult(23);

			yield this.makeFullStepResult(StepKind.Significant, "Find bigger child node", 24, HeapSortContext.CompareChildren, HighlightState.Selected);

			if (((this.child + 1) < this.last) && (this.current[this.child] < this.current[this.child + 1])) {
				yield this.makeFullStepResult(StepKind.Algorithmic, "Right child node is bigger, select it", 25, HeapSortContext.CompareChildren, HighlightState.OrderSwapped);
				yield this.makeCodeStepResult(26);
			}
			else {
				yield this.makeFullStepResult(StepKind.Algorithmic, "Left child node is bigger", 26, HeapSortContext.CompareChildren, HighlightState.OrderCorrect);
			}

			yield this.makeFullStepResult(StepKind.Significant, "Compare the selected child node with it's parent", 27, HeapSortContext.CompareChildAndParent, HighlightState.Selected);

			if (this.current[this.root] < this.current[this.child]) {
				this.swapCurrent(this.root, this.child);
				this.root = this.child;
				yield this.makeFullStepResult(StepKind.Algorithmic, "Parent is smaller than it's child, swap them and descend one level", [28, 29], HeapSortContext.CompareChildAndParent, HighlightState.OrderSwapped);

				yield this.makeCodeStepResult(32);
			}
			else {
				yield this.makeCodeStepResult(30);
				yield this.makeFullStepResult(StepKind.Algorithmic, "Selected node is in correct position in the heap", 31, HeapSortContext.CompareChildAndParent, HighlightState.OrderCorrect);
				return;
			}

			yield this.makeCodeStepResult(33);
		}

		yield this.makeCodeStepResult(23);
		yield left[0];
		this.child = left[1];
		yield this.makeCodeStepResult(23);
		yield this.makeCodeStepResult(33);
		yield this.makeCodeStepResult(35);
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
			variables.push(new Variable("root", this.root, SymbolicColor.Variable_1));
		if (this.child != undefined)
			variables.push(new Variable("child", this.child, SymbolicColor.Variable_2));

		return variables;
	}

	protected resetInternal(): void {
		this.resetVariables();

		this.callStack = new CallStack();
		this.drawArray = true;
		this.drawHeap = false;
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
			"    count = len(A)",
			"    makeHeap(A, count)",
			"    last := count - 1",
			"    while last > 0",
			"        swap(A[last], A[0])",
			"        siftDown(A, 0, last)",
			"        last := last - 1",
			"    end while",
			"end function",
			"",
			"function parent(i: int) = floor((i-1) / 2)",
			"function left(i: int) = 2 * i + 1",
			"",
			"function makeHeap(A: array, count: int)",
			"    start := parent(count - 1)",
			"    while start >= 0",
			"        siftDown(A, start, count)",
			"        start := start - 1",
			"    end while",
			"end function",
			"",
			"function siftDown(A: array, root: int, last: int)",
			"    while (child := left(root)) < last",
			"        if (child + 1 < last) and (A[child] < A[child + 1])",
			"            child := child + 1",
			"        end if",
			"        if A[root] < A[child]",
			"            swap(A[root], A[child])",
			"            root := child",
			"        else",
			"            return",
			"        end if",
			"    end while",
			"end function",
		];
	}
}