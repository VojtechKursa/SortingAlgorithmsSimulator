import { StepResultArray } from "../data/stepResults/StepResultArray";
import { HighlightState } from "./SortingAlgorithm";
import { Variable } from "../data/Variable";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { StepKind } from "../data/stepResults/StepKind";
import { SortingAlgorithmArray } from "./SortingAlgorithmArray";

export class SelectionSort extends SortingAlgorithmArray {
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

	protected makeFullStepResult(
		stepKind: StepKind.Algorithmic | StepKind.Significant,
		description: string,
		swapping: boolean,
		highlightState: HighlightState | undefined,
		highlightedLines: number[] | number,
		final: boolean = false,
		additionalHighlights?: Highlights
	): StepResultArray {
		let arrayHighlights: Highlights = new Map<number, SymbolicColor>();

		if (final) {
			for (let i = 0; i < this.current.length; i++) {
				arrayHighlights.set(i, SymbolicColor.Element_Sorted);
			}
		}
		else {
			if (this.i != undefined) {
				for (let x = 0; x < this.i; x++) {
					arrayHighlights.set(x, SymbolicColor.Element_Sorted);
				}
			}


			if (swapping) {
				if (this.min != undefined && this.i != undefined) {
					if (highlightState == HighlightState.Selected) {
						arrayHighlights.set(this.i, SymbolicColor.Element_Highlight_1);
						arrayHighlights.set(this.min, SymbolicColor.Element_Highlight_2);
					}
					else if (highlightState == HighlightState.OrderSwapped) {
						arrayHighlights.set(this.i, SymbolicColor.Element_OrderCorrect);
						arrayHighlights.set(this.min, SymbolicColor.Element_OrderCorrect);
					}
				}
			}
			else {
				if (this.j != undefined) {
					if (highlightState == HighlightState.Selected && this.min != undefined) {
						arrayHighlights.set(this.j, SymbolicColor.Element_Highlight_1);
						arrayHighlights.set(this.min, SymbolicColor.Element_Highlight_2);
					}
					else if (highlightState == HighlightState.OrderCorrect && this.min != undefined) {
						arrayHighlights.set(this.min, SymbolicColor.Element_OrderCorrect);
						arrayHighlights.set(this.j, SymbolicColor.Element_OrderCorrect);
					}
					else if (highlightState == HighlightState.OrderSwapped && this.lastMin != undefined) {
						arrayHighlights.set(this.lastMin, SymbolicColor.Element_OrderIncorrect);
						arrayHighlights.set(this.j, SymbolicColor.Element_OrderIncorrect);
					}
				}
			}
		}

		if (additionalHighlights) {
			for (const key of additionalHighlights.keys()) {
				let value = additionalHighlights.get(key);

				if (value)
					arrayHighlights.set(key, value);
			}
		}

		return new StepResultArray(stepKind, this.current, arrayHighlights, description, highlightedLines, this.getVariables(), final);
	}

	protected override makeCodeStepResult(highlightedLines: number[] | number, description: string | undefined = undefined): StepResultArray {
		return super.makeCodeStepResult(highlightedLines, description, this.getVariables());
	}

	private getVariables(): Array<Variable> {
		let variables = new Array<Variable>();

		if (this.i != null)
			variables.push(new Variable("i", this.i, SymbolicColor.Variable_3));
		if (this.min != null)
			variables.push(new Variable("min", this.min, SymbolicColor.Variable_2));
		if (this.j != null)
			variables.push(new Variable("j", this.j, SymbolicColor.Variable_1));

		return variables;
	}

	protected override * stepForwardArray(): Generator<StepResultArray> {
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

				yield this.makeFullStepResult(StepKind.Significant, `Compare index ${this.min} and ${this.j}`, false, HighlightState.Selected, 6);
				if (this.current[this.j].value < this.current[this.min].value) {
					this.min = this.j;
					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.lastMin} and ${this.j}: Mark new minimum`, true, HighlightState.OrderSwapped, 7);
					yield this.makeCodeStepResult(8);
				}
				else {
					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.min} and ${this.j}: Order is correct`, true, HighlightState.OrderCorrect, 8);
				}

				this.j++;
				yield this.makeCodeStepResult(9);
			}

			if (enteredInnerWhile)
				yield this.makeCodeStepResult(5);

			yield this.makeCodeStepResult(10);

			yield this.makeFullStepResult(StepKind.Significant, `Swap minimum on index ${this.min} with element on index i (${this.i})`, false, HighlightState.Selected, 11);
			this.swapCurrent(this.i, this.min);
			yield this.makeFullStepResult(StepKind.Algorithmic, `Swap minimum on index ${this.min} with element on index i (${this.i})`, true, HighlightState.OrderSwapped, 11);

			this.i++;
			yield this.makeCodeStepResult(12);
		}

		if (enteredOuterWhile)
			yield this.makeCodeStepResult(2);

		yield this.makeCodeStepResult(13);
		yield this.makeFullStepResult(StepKind.Algorithmic, "Array sorted", false, undefined, 14, true);
	}

	public override getInitialStepResultArray(): StepResultArray {
		return new StepResultArray(StepKind.Algorithmic, this.current, undefined, undefined, undefined, undefined, this.current.length <= 1);
	}

	protected resetInternal(): void {
		this.i = undefined;
		this.j = undefined;
		this.min = undefined;
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