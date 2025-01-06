import { StepResult } from "../data/stepResults/StepResult";
import { StepResultArray } from "../data/stepResults/StepResultArray";
import { HighlightState, SortingAlgorithm } from "./SortingAlgorithm";
import { CodeStepResult } from "../data/stepResults/CodeStepResult";
import { FullStepResult } from "../data/stepResults/FullStepResult";
import { Variable } from "../data/Variable";
import { IndexedNumber } from "../data/IndexedNumber";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";

export class InsertionSort extends SortingAlgorithm {
	protected i?: number;
	protected x?: number;
	protected j?: number;

	public constructor(input: number[]) {
		super(input);
	}

	protected makeFullStepResult(final: boolean, text: string, lastSubstep: boolean, highlightState: HighlightState | undefined, highlightedLines: number[] | number, additionalHighlights?: Highlights): StepResult {
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
			if (this.j != undefined) {
				if (highlightState == HighlightState.Selected) {
					highlights.set(this.j - 1, SymbolicColor.Element_Highlight_1);
					highlights.set(this.j, SymbolicColor.Element_Highlight_2);
				}
				else if (highlightState == HighlightState.OrderCorrect) {
					highlights.set(this.j - 1, SymbolicColor.Element_OrderCorrect);
					highlights.set(this.j, SymbolicColor.Element_OrderCorrect);
				}
				else if (highlightState == HighlightState.OrderSwapped) {
					highlights.set(this.j - 1, SymbolicColor.Element_OrderIncorrect);
					highlights.set(this.j, SymbolicColor.Element_OrderIncorrect);
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

		return new StepResultArray(final, text, lastSubstep, this.makeCodeStepResult(highlightedLines, undefined), this.current, highlights);
	}

	protected makeCodeStepResult(highlightedLines: number[] | number, text: string | undefined = undefined): CodeStepResult {
		if (typeof highlightedLines == "number")
			highlightedLines = [highlightedLines];

		let highlights = new Map<number, SymbolicColor>();
		highlightedLines.forEach(line => highlights.set(line, SymbolicColor.Code_ActiveLine));

		let variables = new Array<Variable>();
		if (this.i != undefined)
			variables.push(new Variable("i", this.i, SymbolicColor.Variable_1));
		if (this.x != undefined)
			variables.push(new Variable("x", this.x, undefined));
		if (this.j != undefined)
			variables.push(new Variable("j", this.j, SymbolicColor.Variable_2));

		return new CodeStepResult(text != undefined ? text : "", highlights, variables);
	}

	protected * stepForwardInternal(): Generator<StepResult> {
		let xIndexed: IndexedNumber;
		let enteredOuterWhile = false;

		this.i = 1;
		yield this.makeCodeStepResult(1);

		if (!(this.i < this.current.length))
			yield this.makeCodeStepResult(2);

		while (this.i < this.current.length) {
			enteredOuterWhile = true;

			yield this.makeCodeStepResult(2);

			xIndexed = this.current[this.i];
			this.x = xIndexed.value;
			yield this.makeCodeStepResult(3);

			this.j = this.i;
			yield this.makeCodeStepResult(4);

			if (!(this.j > 0 && this.current[this.j - 1].value > this.x))
				yield this.makeFullStepResult(false, `Compare index ${this.j - 1} and ${this.j}`, false, HighlightState.Selected, 5);

			let enteredInnerWhile = false;

			while (this.j > 0 && this.current[this.j - 1].value > this.x) {
				enteredInnerWhile = true;

				yield this.makeFullStepResult(false, `Compare index ${this.j - 1} and ${this.j}`, false, HighlightState.Selected, 5);

				this.swapCurrent(this.j, this.j - 1);
				yield this.makeFullStepResult(false, `Compare index ${this.j - 1} and ${this.j}: Order is incorrect, swap them`, true, HighlightState.OrderSwapped, 6);

				this.j--;
				yield this.makeCodeStepResult(7);
			}

			if (this.j > 0) {
				if (enteredInnerWhile)
					yield this.makeFullStepResult(false, `Compare index ${this.j - 1} and ${this.j}`, false, HighlightState.Selected, 5);

				yield this.makeFullStepResult(false, `Compare index ${this.j - 1} and ${this.j}: Order is correct`, true, HighlightState.OrderCorrect, 8);
			}
			else {
				yield this.makeFullStepResult(false, `Reached the beginning of the list`, true, HighlightState.OrderCorrect, 5);
				yield this.makeCodeStepResult(8);
			}

			this.current[this.j] = xIndexed;
			yield this.makeCodeStepResult(9);

			this.i++;
			yield this.makeCodeStepResult(10);
		}

		if (enteredOuterWhile)
			yield this.makeCodeStepResult(2);

		yield this.makeCodeStepResult(11);

		yield this.makeCodeStepResult(12);

		yield this.makeFullStepResult(true, "Array is sorted.", true, undefined, [this.getPseudocode().length - 1]);
	}

	protected resetInternal(): void {
		this.i = undefined;
		this.j = undefined;
		this.x = undefined;
	}

	public getInitialStepResult(): FullStepResult {
		return new StepResultArray(this.current.length <= 1, "", true, new CodeStepResult(), this.current, null);
	}

	public getPseudocode(): string[] {
		return [
			"function insertionSort(A: list)",
			"\ti := 1",
			"\twhile i < length(A)",
			"\t\tx := A[i]",
			"\t\tj := i",
			"\t\twhile j > 0 and A[j-1] > x",
			"\t\t\tA[j] := A[j-1]",
			"\t\t\tj := j - 1",
			"\t\tend while",
			"\t\tA[j] := x",
			"\t\ti := i + 1",
			"\tend while",
			"end function"
		];
	}
}