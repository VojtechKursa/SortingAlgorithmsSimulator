import { StepResult } from "../data/stepResults/StepResult";
import { StepResultArray } from "../data/stepResults/StepResultArray";
import { HighlightState, SortingAlgorithm } from "./SortingAlgorithm";
import { FullStepResult } from "../data/stepResults/FullStepResult";
import { Variable } from "../data/Variable";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { CallStack, CallStackLevel } from "../data/CallStack";
import { CodeStepResult } from "../data/stepResults/CodeStepResult";

class PartitionResult {
	public p?: number;
}

export class QuickSort extends SortingAlgorithm {
	protected callStack: CallStack = new CallStack();
	protected l?: number;
	protected r?: number;
	protected i?: number;
	protected j?: number;
	protected pivot?: number;
	protected p?: number;

	public constructor(input: number[]) {
		super(input);
	}

	protected makeFullStepResult(final: boolean, text: string, lastSubstep: boolean, pivotSwap: boolean, highlightState: HighlightState | undefined, highlightedLines: number[] | number, codeResultText?: string, additionalHighlights?: Highlights): StepResult {
		let highlights: Highlights = new Map<number, SymbolicColor>();

		if (typeof highlightedLines == "number") {
			highlightedLines = [highlightedLines];
		}

		if (final) {
			for (let i = 0; i < this.current.length; i++) {
				highlights.set(i, SymbolicColor.Element_Sorted);
			}
		}
		else {
			if (pivotSwap) {
				if (this.pivot != undefined && this.i != undefined) {
					if (highlightState == HighlightState.Selected) {
						highlights.set(this.i, SymbolicColor.Element_Highlight_1);
						highlights.set(this.pivot, SymbolicColor.Element_Highlight_2);
					}
					else {
						highlights.set(this.i, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.pivot, SymbolicColor.Element_OrderIncorrect);
					}
				}
			}
			else {
				if (highlightState == HighlightState.Selected) {
					if (this.j != undefined && this.pivot != undefined) {
						highlights.set(this.j, SymbolicColor.Element_Highlight_1);
						highlights.set(this.pivot, SymbolicColor.Element_Highlight_2);
					}
				}
				else {
					if (this.i != undefined && this.j != undefined) {
						if (highlightState == HighlightState.OrderCorrect) {
							highlights.set(this.i, SymbolicColor.Element_OrderCorrect);
							highlights.set(this.j, SymbolicColor.Element_OrderCorrect);
						}
						else if (highlightState == HighlightState.OrderSwapped) {
							highlights.set(this.i, SymbolicColor.Element_OrderIncorrect);
							highlights.set(this.j, SymbolicColor.Element_OrderIncorrect);
						}
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

		return new StepResultArray(final, text, lastSubstep, this.makeCodeStepResult(highlightedLines, codeResultText), this.current, highlights);
	}

	protected makeCodeStepResult(highlightedLines: number[] | number, text: string | undefined = undefined): CodeStepResult {
		if (typeof highlightedLines == "number")
			highlightedLines = [highlightedLines];

		let highlights = new Map<number, SymbolicColor>();
		highlightedLines.forEach(line => highlights.set(line, SymbolicColor.Code_ActiveLine));

		return new CodeStepResult(text != undefined ? text : "", highlights, this.getVariables(), this.callStack);
	}

	protected * stepForwardInternal(): Generator<StepResult> {
		yield this.makeCodeStepResult(0, "Enter the facade function");

		yield this.makeCodeStepResult(1, "Call the recursive function with the entire list");

		this.beforeCall("quickSort", 0, this.current.length - 1);
		for (const result of this.quickSortRecursive()) {
			yield result;
		}
		this.returnFromFunction();

		yield this.makeCodeStepResult(1, "Return from initial recursive call");

		yield this.makeFullStepResult(true, "Array is sorted", true, false, undefined, 2);
	}

	protected * quickSortRecursive(): Generator<StepResult> {
		if (this.l == undefined || this.r == undefined)
			throw new Error("Invalid quickSortRecursive call");

		yield this.makeCodeStepResult(4);

		yield this.makeCodeStepResult(5, "Check recursion end condition");

		if (this.l >= this.r || this.l < 0) {
			yield this.makeCodeStepResult(6, "End recursion");
			return;
		}

		yield this.makeCodeStepResult(7, "Partition the list");

		const partitionResult = new PartitionResult();
		this.beforeCall("quickSortR", this.l, this.r)
		for (const result of this.partition(partitionResult)) {
			yield result;
		}
		this.returnFromFunction();

		if (partitionResult.p == undefined)
			throw new Error("Partition function didn't return a valid result");

		this.p = partitionResult.p;

		yield this.makeCodeStepResult(7, "Assign the result of partition function to p");

		yield this.makeCodeStepResult(8, "Recursively call quicksort on the left part of the list");

		this.beforeCall("quickSortR", this.l, this.p - 1);
		for (const result of this.quickSortRecursive()) {
			yield result;
		}
		this.returnFromFunction();

		yield this.makeCodeStepResult(8, "Return from recursive call on the left part of the list");

		yield this.makeCodeStepResult(9, "Recursively call quicksort on the right part of the list");

		this.beforeCall("quickSortR", this.p + 1, this.r);
		for (const result of this.quickSortRecursive()) {
			yield result;
		}
		this.returnFromFunction();

		yield this.makeCodeStepResult(9, "Return from recursive call on the right part of the list");

		yield this.makeCodeStepResult(10);
	}

	protected * partition(result: PartitionResult): Generator<StepResult> {
		if (this.l == undefined || this.r == undefined)
			throw new Error("Invalid partition call");

		const whileCheckText = "See if we're at the end of the assigned section";
		const indexIncrementText = "Increment the index counter";

		yield this.makeCodeStepResult(12);

		this.pivot = this.r;
		yield this.makeCodeStepResult(13, "Define pivot as r");

		this.i = this.l;
		yield this.makeCodeStepResult(14, "Define i (position to swap elements lower than pivot to) as l");

		this.j = this.l;
		yield this.makeCodeStepResult(16);

		let enteredWhile = false;

		if (!(this.j < this.r))
			yield this.makeCodeStepResult(17, whileCheckText);

		while (this.j < this.r) {
			enteredWhile = true;
			yield this.makeCodeStepResult(17, whileCheckText);

			yield this.makeFullStepResult(false, "Check if the current element is lower or equal to pivot", false, false, HighlightState.Selected, 18);

			if (this.current[this.j] <= this.current[this.pivot]) {
				this.swapCurrent(this.i, this.j);
				yield this.makeFullStepResult(
					false,
					"Check if the current element is lower or equal to pivot: Element is lower or equal, swap it to the end of the lower section",
					true,
					false,
					HighlightState.OrderSwapped,
					19
				);

				this.i++;
				yield this.makeCodeStepResult(20, "Shift the end of the lower section");

				this.j++;
				yield this.makeCodeStepResult(21, indexIncrementText);
			}
			else {
				this.j++;
				yield this.makeFullStepResult(
					false,
					"Check if the current element is lower or equal to pivot: Element is higher, don't swap.",
					true,
					false,
					HighlightState.OrderCorrect,
					21,
					indexIncrementText
				);
			}
		}

		if (enteredWhile)
			yield this.makeCodeStepResult(17, whileCheckText);

		yield this.makeCodeStepResult(22, "Went through the entire assigned section");

		yield this.makeFullStepResult(false, "Swap the pivot to the end of the lower section", false, true, HighlightState.Selected, 24);
		yield this.makeFullStepResult(false, "Swap the pivot to the end of the lower section", true, true, HighlightState.OrderSwapped, 24);

		result.p = this.i;

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
			variables.push(new Variable("pivot", this.pivot, SymbolicColor.Variable_2));
		if (this.p != undefined)
			variables.push(new Variable("p", this.p, SymbolicColor.Variable_3));

		return variables;
	}

	protected resetInternal(): void {
		this.l = undefined;
		this.r = undefined;
		this.i = undefined;
		this.j = undefined;
		this.pivot = undefined;
		this.p = undefined;
	}

	protected beforeCall(currentFunctionName: string, l: number, r: number): void {
		this.callStack.push(new CallStackLevel(currentFunctionName, this.getVariables()));
		this.resetInternal();
		this.l = l;
		this.r = r;
	}

	protected returnFromFunction(): void {
		let level = this.callStack.pop();

		if (level == undefined)
			throw new Error("Failed to return from function, presumably the call stack is empty");

		this.resetInternal();

		level.variables.forEach(variable => {
			switch (variable.name) {
				case "l": this.l = variable.value; break;
				case "r": this.r = variable.value; break;
				case "i": this.i = variable.value; break;
				case "j": this.j = variable.value; break;
				case "pivot": this.pivot = variable.value; break;
				case "p": this.p = variable.value; break;
			}
		});
	}

	public getInitialStepResult(): FullStepResult {
		return new StepResultArray(this.current.length <= 1, "", true, new CodeStepResult(undefined, undefined, undefined, this.callStack), this.current, null);
	}

	public getPseudocode(): string[] {
		return [
			"function quicksort(A: list)",
			"\tquicksortR(A, 0, len(A) - 1)",
			"end function",
			"",
			"function quicksortR(A: list, l: int, r: int)",
			"\tif l >= r || l < 0",
			"\t\treturn",
			"\tp := partition(A, l, r)",
			"\tquicksortR(A, l, p - 1)",
			"\tquicksortR(A, p + 1, r)",
			"end function",
			"",
			"function partition(A: list, l: int, r: int)",
			"\tpivot := r",
			"\ti := l",
			"",
			"\tj := l",
			"\twhile j < r",
			"\t\tif A[j] <= A[pivot]",
			"\t\t\tswap(A[i], A[j])",
			"\t\t\ti := i + 1",
			"\t\tj := j + 1",
			"\tend while",
			"",
			"\tswap(A[i], A[pivot])",
			"\treturn i",
			"end function"
		];
	}
}