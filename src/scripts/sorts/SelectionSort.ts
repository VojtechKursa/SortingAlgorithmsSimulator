import { StepResult } from "../data/stepResults/StepResult";
import { StepResultArray } from "../data/stepResults/StepResultArray";
import { HighlightState, SortingAlgorithm } from "./SortingAlgorithm";
import { CodeStepResult } from "../data/stepResults/CodeStepResult";
import { FullStepResult } from "../data/stepResults/FullStepResult";
import { Variable } from "../data/Variable";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";

export class SelectionSort extends SortingAlgorithm {
	protected i?: number;
	protected j?: number;

	private _lastMin?: number;
	private get lastMin(): number | undefined {
		return this._lastMin;
	}
	private set lastMin(value: number | undefined) {
		this._lastMin = value;
	}

	private _min?: number;
	protected get min(): number | undefined {
		return this._min;
	}
	protected set min(value: number | undefined) {
		this.lastMin = this.min;
		this._min = value;
	}


	public constructor(input: number[]) {
		super(input);
	}

	protected makeFullStepResult(final: boolean, text: string, lastSubstep: boolean, swapping: boolean, highlightState: HighlightState | undefined, highlightedLines: number[] | number, additionalHighlights?: Highlights): StepResult {
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
			if (this.i != undefined) {
				for (let x = 0; x < this.i; x++) {
					highlights.set(x, SymbolicColor.Element_Sorted);
				}
			}


			if (swapping) {
				if (this.min != undefined && this.i != undefined) {
					if (highlightState == HighlightState.Selected) {
						highlights.set(this.i, SymbolicColor.Element_Highlight_1);
						highlights.set(this.min, SymbolicColor.Element_Highlight_2);
					}
					else if (highlightState == HighlightState.OrderSwapped) {
						highlights.set(this.i, SymbolicColor.Element_OrderCorrect);
						highlights.set(this.min, SymbolicColor.Element_OrderCorrect);
					}
				}
			}
			else {
				if (this.j != undefined) {
					if (highlightState == HighlightState.Selected && this.min != undefined) {
						highlights.set(this.j, SymbolicColor.Element_Highlight_1);
						highlights.set(this.min, SymbolicColor.Element_Highlight_2);
					}
					else if (highlightState == HighlightState.OrderCorrect && this.min != undefined) {
						highlights.set(this.min, SymbolicColor.Element_OrderCorrect);
						highlights.set(this.j, SymbolicColor.Element_OrderCorrect);
					}
					else if (highlightState == HighlightState.OrderSwapped && this.lastMin != undefined) {
						highlights.set(this.lastMin, SymbolicColor.Element_OrderIncorrect);
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

		return new StepResultArray(final, text, lastSubstep, this.makeCodeStepResult(highlightedLines, undefined, final), this.current, highlights);
	}

	protected makeCodeStepResult(highlightedLines: number[] | number, text: string | undefined = undefined, final?: boolean): CodeStepResult {
		if (typeof highlightedLines == "number")
			highlightedLines = [highlightedLines];

		let highlights = new Map<number, SymbolicColor>();
		highlightedLines.forEach(line => highlights.set(line, SymbolicColor.Code_ActiveLine));

		let variables = new Array<Variable>();
		if (this.i != null)
			variables.push(new Variable("i", this.i, final ? undefined : SymbolicColor.Variable_3));
		if (this.min != null)
			variables.push(new Variable("min", this.min, final ? undefined : SymbolicColor.Variable_2));
		if (this.j != null)
			variables.push(new Variable("j", this.j, final ? undefined : SymbolicColor.Variable_1));

		return new CodeStepResult(text != undefined ? text : "", highlights, variables);
	}

	protected * stepForwardInternal(): Generator<StepResult> {
		this.i = 0;
		yield this.makeCodeStepResult(1);

		let stop = this.current.length - 1;
		let enteredOuterWhile = false;

		if (!(this.i < stop))
			yield this.makeCodeStepResult(2);

		while (this.i < stop) {
			enteredOuterWhile = true;
			yield this.makeCodeStepResult(2);

			this.j = this.i + 1;
			yield this.makeCodeStepResult(3);

			this.min = this.j;
			yield this.makeCodeStepResult(4);

			if (!(this.j < this.current.length))
				yield this.makeCodeStepResult(5);

			let enteredInnerWhile = false;
			while (this.j < this.current.length) {
				enteredInnerWhile = true;
				yield this.makeCodeStepResult(5);

				yield this.makeFullStepResult(false, `Compare index ${this.min} and ${this.j}`, false, false, HighlightState.Selected, 6);
				if (this.current[this.j].value < this.current[this.min].value) {
					this.min = this.j;
					yield this.makeFullStepResult(false, `Compare index ${this.lastMin} and ${this.j}: Mark new minimum`, true, false, HighlightState.OrderSwapped, 7);
					yield this.makeCodeStepResult(8);
				}
				else {
					yield this.makeFullStepResult(false, `Compare index ${this.min} and ${this.j}: Order is correct`, true, false, HighlightState.OrderCorrect, 8);
				}

				this.j++;
				yield this.makeCodeStepResult(9);
			}

			if (enteredInnerWhile)
				yield this.makeCodeStepResult(5);

			yield this.makeCodeStepResult(10);

			yield this.makeFullStepResult(false, `Swap minimum on index ${this.min} with element on index i (${this.i})`, false, true, HighlightState.Selected, 11);
			this.swapCurrent(this.i, this.min);
			yield this.makeFullStepResult(false, `Swap minimum on index ${this.min} with element on index i (${this.i})`, true, true, HighlightState.OrderSwapped, 11);

			this.i++;
			yield this.makeCodeStepResult(12);
		}

		if (enteredOuterWhile)
			yield this.makeCodeStepResult(2);

		yield this.makeCodeStepResult(13);
		yield this.makeFullStepResult(true, "Array sorted", true, false, undefined, 14);
	}

	protected resetInternal(): void {
		this.i = undefined;
		this.j = undefined;
		this.min = undefined;
	}

	public getInitialStepResult(): FullStepResult {
		return new StepResultArray(this.current.length <= 1, "", true, new CodeStepResult(), this.current, null);
	}

	public getPseudocode(): string[] {
		return [
			"function selectSort(a: list)",
			"\ti := 0",
			"\twhile i < (length(a) - 1)",
			"\t\tj := i + 1",
			"\t\tmin := j",
			"\t\twhile j < length(a)",
			"\t\t\tif a[j] < a[min]",
			"\t\t\t\tmin := j",
			"\t\t\tend if",
			"\t\t\tj := j + 1",
			"\t\tend while",
			"\t\tswap(i, min)",
			"\t\ti := i + 1",
			"\tend while",
			"end function"
		];
	}
}