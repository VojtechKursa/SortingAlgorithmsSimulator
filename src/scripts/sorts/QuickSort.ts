import { StepResultArray } from "../data/stepResults/StepResultArray";
import { HighlightState } from "./SortingAlgorithm";
import { Variable } from "../data/Variable";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { CallStack } from "../data/CallStack";
import { SortingAlgorithmArray } from "./SortingAlgorithmArray";
import { StepKind } from "../data/stepResults/StepKind";

class PartitionResult {
	public p?: number;
}

class Pivot {
	public constructor(
		public readonly index: number,
		public readonly value: number
	) { }
}

export class QuickSort extends SortingAlgorithmArray {
	protected callStack: CallStack = new CallStack();
	protected l?: number;
	protected r?: number;
	protected i?: number;
	protected j?: number;
	protected pivot?: Pivot;
	protected p?: number;

	protected sorted = new Set<number>();

	public constructor(input: number[]) {
		super(input);
	}

	protected makeFullStepResult(
		stepKind: StepKind.Algorithmic | StepKind.Significant,
		description: string,
		pivotSwap: boolean,
		highlightState: HighlightState | undefined,
		highlightedLines: number[] | number,
		final: boolean = false,
		additionalHighlights?: Highlights
	): StepResultArray {
		let highlights: Highlights = new Map<number, SymbolicColor>();

		if (final) {
			for (let i = 0; i < this.current.length; i++) {
				highlights.set(i, SymbolicColor.Element_Sorted);
			}
		}
		else {
			for (const index of this.sorted) {
				highlights.set(index, SymbolicColor.Element_Sorted);
			}

			if (pivotSwap) {
				if (this.pivot != undefined && this.i != undefined) {
					if (highlightState == HighlightState.Selected) {
						highlights.set(this.i, SymbolicColor.Element_Highlight_1);
						highlights.set(this.pivot.index, SymbolicColor.Element_Highlight_2);
					}
					else {
						highlights.set(this.i, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.pivot.index, SymbolicColor.Element_OrderIncorrect);
					}
				}
			}
			else {
				if (highlightState == HighlightState.Selected) {
					if (this.j != undefined && this.pivot != undefined) {
						highlights.set(this.j, SymbolicColor.Element_Highlight_1);
						highlights.set(this.pivot.index, SymbolicColor.Element_Highlight_2);
					}
				}
				else if (highlightState == HighlightState.OrderCorrect) {
					if (this.j != undefined && this.pivot != undefined) {
						highlights.set(this.j, SymbolicColor.Element_OrderCorrect);
						highlights.set(this.pivot.index, SymbolicColor.Element_OrderCorrect);
					}
				}
				else if (highlightState == HighlightState.OrderSwapped) {
					if (this.i != undefined && this.j != undefined) {
						highlights.set(this.i, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.j, SymbolicColor.Element_OrderIncorrect);
					}
				}
			}
		}

		if (additionalHighlights) {
			for (const key of additionalHighlights.keys()) {
				let value = additionalHighlights.get(key);

				if (value)
					highlights.set(key, value);
			}
		}

		return new StepResultArray(stepKind, this.current, highlights, description, highlightedLines, this.getVariables(), final, this.callStack);
	}

	protected override makeCodeStepResult(highlightedLines: number[] | number, text: string | undefined = undefined): StepResultArray {
		return super.makeCodeStepResult(highlightedLines, text, this.getVariables(), this.callStack);
	}


	protected override * stepForwardArray(): Generator<StepResultArray> {
		this.callStack.currentFunctionName = "quickSort";
		yield this.makeCodeStepResult(0, "Enter the facade function");

		yield this.makeCodeStepResult(1, "Call the recursive function with the entire list");

		this.beforeCall("quickSortR", 0, this.current.length - 1);
		for (const result of this.quickSortRecursive()) {
			yield result;
		}
		this.returnFromFunction();

		yield this.makeCodeStepResult(1, "Return from initial recursive call");

		this.callStack.currentFunctionName = undefined;
		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted", false, undefined, 2, true);
	}

	protected * quickSortRecursive(): Generator<StepResultArray> {
		if (this.l == undefined || this.r == undefined)
			throw new Error("Invalid quickSortRecursive call");

		yield this.makeCodeStepResult(4);

		yield this.makeCodeStepResult(5, "Check recursion end condition");

		if (this.l >= this.r || this.l < 0) {
			yield this.makeFullStepResult(StepKind.Significant, "End recursion", false, undefined, 6);
			return;
		}

		yield this.makeCodeStepResult(7);
		yield this.makeFullStepResult(StepKind.Significant, "Partition the list", false, undefined, 8);

		const partitionResult = new PartitionResult();
		this.beforeCall("partition", this.l, this.r)
		for (const result of this.partition(partitionResult)) {
			yield result;
		}
		this.returnFromFunction();

		if (partitionResult.p == undefined)
			throw new Error("Partition function didn't return a valid result");

		this.p = partitionResult.p;

		yield this.makeFullStepResult(StepKind.Significant, "Assign the result of partition function to p", false, undefined, 8);

		yield this.makeFullStepResult(StepKind.Significant, "Recursively call quicksort on the left part of the list", false, undefined, 9);

		this.beforeCall("quickSortR", this.l, this.p - 1);
		for (const result of this.quickSortRecursive()) {
			yield result;
		}
		this.returnFromFunction();

		for (let i = this.l; i <= this.p - 1; i++) {
			this.sorted.add(i);
		}

		yield this.makeFullStepResult(StepKind.Significant, "Return from recursive call on the left part of the list", false, undefined, 9);

		yield this.makeFullStepResult(StepKind.Significant, "Recursively call quicksort on the right part of the list", false, undefined, 10);

		this.beforeCall("quickSortR", this.p + 1, this.r);
		for (const result of this.quickSortRecursive()) {
			yield result;
		}
		this.returnFromFunction();

		for (let i = this.p + 1; i <= this.r; i++) {
			this.sorted.add(i);
		}

		yield this.makeFullStepResult(StepKind.Significant, "Return from recursive call on the right part of the list", false, undefined, 10);

		yield this.makeCodeStepResult(11);
	}

	protected * partition(result: PartitionResult): Generator<StepResultArray> {
		if (this.l == undefined || this.r == undefined)
			throw new Error("Invalid partition call");

		yield this.makeCodeStepResult(13);

		this.pivot = new Pivot(this.r, this.current[this.r].value);
		yield this.makeCodeStepResult(14, "Define pivot as r");

		this.i = this.l;
		yield this.makeCodeStepResult(15, "Define i (position to swap elements lower than pivot to) as l");

		for (this.j = this.l; this.j < this.r; this.j++) {
			yield this.makeCodeStepResult(17, "Check if we're at the end of the assigned section");

			const compareText = `Compare element on index ${this.j} with pivot`;
			yield this.makeFullStepResult(StepKind.Significant, compareText, false, HighlightState.Selected, 18);

			if (this.current[this.j].value <= this.pivot.value) {
				this.swapCurrent(this.i, this.j);
				yield this.makeFullStepResult(
					StepKind.Algorithmic,
					compareText + ": Element is lower or equal, swap it to the end of the lower section",
					false,
					HighlightState.OrderSwapped,
					19
				);

				this.i++;
				yield this.makeCodeStepResult(20, "Shift the end of the lower section");

				yield this.makeCodeStepResult(21);
			}
			else {
				yield this.makeFullStepResult(
					StepKind.Algorithmic,
					compareText + ": Element is higher, don't swap",
					false,
					HighlightState.OrderCorrect,
					21
				);
			}

			yield this.makeCodeStepResult(22);
		}

		yield this.makeCodeStepResult(18, "Check if we're at the end of the assigned section");
		yield this.makeCodeStepResult(22, "Went through the entire assigned section");

		this.swapCurrent(this.i, this.pivot.index);
		yield this.makeFullStepResult(StepKind.Algorithmic, "Swap the pivot to the end of the lower section", true, HighlightState.OrderSwapped, 24);

		result.p = this.i;
		this.sorted.add(this.i);

		yield this.makeCodeStepResult(25, "Return the new pivot point");
	}

	protected getVariables(): Variable[] {
		let variables = new Array<Variable>();

		if (this.l != undefined)
			variables.push(new Variable("l", this.l, SymbolicColor.Variable_1));
		if (this.r != undefined)
			variables.push(new Variable("r", this.r, SymbolicColor.Variable_2));
		if (this.i != undefined)
			variables.push(new Variable("i", this.i, SymbolicColor.Variable_3));
		if (this.j != undefined)
			variables.push(new Variable("j", this.j, SymbolicColor.Variable_4));
		if (this.pivot != undefined)
			variables.push(new Variable("pivot", this.pivot.value, SymbolicColor.Variable_2, this.pivot.index));
		if (this.p != undefined)
			variables.push(new Variable("p", this.p, SymbolicColor.Variable_3));

		return variables;
	}

	protected resetInternal(): void {
		this.resetVariables();

		this.callStack = new CallStack();
		this.sorted.clear();
	}

	protected resetVariables(): void {
		this.l = undefined;
		this.r = undefined;
		this.i = undefined;
		this.j = undefined;
		this.pivot = undefined;
		this.p = undefined;
	}

	protected beforeCall(nextFunctionName: string, l: number, r: number): void {
		this.callStack.push(this.getVariables(), nextFunctionName);
		this.resetVariables();
		this.l = l;
		this.r = r;
	}

	protected returnFromFunction(): void {
		let level = this.callStack.pop();

		if (level == undefined)
			throw new Error("Failed to return from function, presumably the call stack is empty");

		this.resetVariables();

		level.variables.forEach(variable => {
			switch (variable.name) {
				case "l": this.l = variable.value; break;
				case "r": this.r = variable.value; break;
				case "i": this.i = variable.value; break;
				case "j": this.j = variable.value; break;
				case "p": this.p = variable.value; break;
				case "pivot":
					if (variable.drawAtIndex == null)
						throw new Error("Attempted to reassign invalid pivot");
					this.pivot = new Pivot(variable.drawAtIndex, variable.value);
					break;
			}
		});
	}

	public override getInitialStepResultArray(): StepResultArray {
		return new StepResultArray(StepKind.Algorithmic, this.current, null, undefined, undefined, undefined, this.current.length <= 1, this.callStack);
	}

	public getPseudocode(): string[] {
		return [
			"function quicksort(A: array)",
			"\tquicksortR(A, 0, len(A) - 1)",
			"end function",
			"",
			"function quicksortR(A: array, l: int, r: int)",
			"\tif l >= r || l < 0",
			"\t\treturn",
			"\tend if",
			"\tp := partition(A, l, r)",
			"\tquicksortR(A, l, p - 1)",
			"\tquicksortR(A, p + 1, r)",
			"end function",
			"",
			"function partition(A: array, l: int, r: int)",
			"\tpivot := A[r]",
			"\ti := l",
			"",
			"\tfor j := l to r-1 do",
			"\t\tif A[j] <= pivot",
			"\t\t\tswap(A[i], A[j])",
			"\t\t\ti := i + 1",
			"\t\tend if",
			"\tend for",
			"",
			"\tswap(A[i], A[r])",
			"\treturn i",
			"end function"
		];
	}
}