import { StepResult } from "../stepResults/StepResult";
import { StepResultArray } from "../stepResults/StepResultArray";
import { SortingAlgorithm } from "./SortingAlgorithm";
import { CodeStepResult } from "../stepResults/CodeStepResult";
import { FullStepResult } from "../stepResults/FullStepResult";
import { CodeHighlight, RendererHighlight, RendererHighlights } from "../Highlights";
import { Variable } from "../Variable";
import { IndexedNumber } from "../IndexedNumber";
import { HighlightState } from "../HighlightState";

export class InsertionSort extends SortingAlgorithm {
	protected i?: number;
	protected x?: number;
	protected j?: number;

	public constructor(input: number[]) {
		super(input);
	}

	protected makeFullStepResult(final: boolean, text: string, lastSubstep: boolean, highlightState: HighlightState | undefined, highlightedLines: number[] | number, additionalHighlights?: RendererHighlights): StepResult {
		let highlights: RendererHighlights = new Map<number, RendererHighlight>();

		if (typeof highlightedLines == "number") {
			highlightedLines = [highlightedLines];
		}

		if (final) {
			for (let i = 0; i < this.current.length; i++) {
				highlights.set(i, RendererHighlight.Sorted);
			}
		}
		else {
			if (this.j != undefined) {
				if (highlightState == HighlightState.Selected) {
					highlights.set(this.j - 1, RendererHighlight.Highlight_1);
					highlights.set(this.j, RendererHighlight.Highlight_2);
				}
				else if (highlightState == HighlightState.OrderCorrect) {
					highlights.set(this.j - 1, RendererHighlight.ElementOrderCorrect);
					highlights.set(this.j, RendererHighlight.ElementOrderCorrect);
				}
				else if (highlightState == HighlightState.OrderSwapped) {
					highlights.set(this.j - 1, RendererHighlight.ElementOrderSwapped);
					highlights.set(this.j, RendererHighlight.ElementOrderSwapped);
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

		return new StepResultArray(final, text, lastSubstep, this.makeCodeStepResult(highlightedLines, undefined, final), this.current, highlights);
	}

	protected makeCodeStepResult(highlightedLines: number[] | number, text: string | undefined = undefined, final?: boolean): CodeStepResult {
		if (typeof highlightedLines == "number")
			highlightedLines = [highlightedLines];

		let highlights = new Map<number, CodeHighlight>();
		highlightedLines.forEach(line => highlights.set(line, CodeHighlight.ActiveLine));

		let variables = new Array<Variable>();
		if (this.i != null)
			variables.push(new Variable("i", this.i, !final));
		if (this.x != null)
			variables.push(new Variable("x", this.x, false));
		if (this.j != null)
			variables.push(new Variable("j", this.j, !final));

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