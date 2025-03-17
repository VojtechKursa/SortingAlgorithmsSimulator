import { StepResultArray } from "../data/stepResults/StepResultArray";
import { Variable } from "../data/Variable";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { StepKind } from "../data/stepResults/StepKind";
import { SortingAlgorithmArray } from "./SortingAlgorithmArray";

const enum HighlightStateSelectionSort {
	Selected,
	OrderCorrect,
	OrderSwapped,
	MinSwap
}

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
		highlightState: HighlightStateSelectionSort | undefined,
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

			switch (highlightState) {
				case HighlightStateSelectionSort.Selected:
					if (this.j != undefined && this.min != undefined) {
						arrayHighlights.set(this.j, SymbolicColor.Element_Highlight_1);
						arrayHighlights.set(this.min, SymbolicColor.Element_Highlight_2);
					}
					break;
				case HighlightStateSelectionSort.OrderCorrect:
					if (this.j != undefined && this.min != undefined) {
						arrayHighlights.set(this.j, SymbolicColor.Element_OrderCorrect);
						arrayHighlights.set(this.min, SymbolicColor.Element_OrderCorrect);
					}
					break;
				case HighlightStateSelectionSort.OrderSwapped:
					if (this.j != undefined && this.lastMin != undefined) {
						arrayHighlights.set(this.j, SymbolicColor.Element_OrderIncorrect);
						arrayHighlights.set(this.lastMin, SymbolicColor.Element_OrderIncorrect);
					}
					break;
				case HighlightStateSelectionSort.MinSwap:
					if (this.i != undefined && this.min != undefined) {
						if (this.i == this.min) {
							arrayHighlights.set(this.i, SymbolicColor.Element_OrderCorrect)
						}
						else {
							arrayHighlights.set(this.i, SymbolicColor.Element_OrderIncorrect);
							arrayHighlights.set(this.min, SymbolicColor.Element_OrderIncorrect);
						}
					}
					break;
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

		if (this.i != undefined)
			variables.push(new Variable("i", this.i, SymbolicColor.Variable_3));
		if (this.min != undefined)
			variables.push(new Variable("min", this.min, SymbolicColor.Variable_2));
		if (this.j != undefined)
			variables.push(new Variable("j", this.j, SymbolicColor.Variable_1));

		return variables;
	}

	protected override * stepForwardArray(): Generator<StepResultArray> {
		for (this.i = 0; this.i < this.current.length - 1; this.i++) {
			yield this.makeCodeStepResult(1);

			this.min = this.i;
			yield this.makeCodeStepResult(2);

			for (this.j = this.min + 1; this.j < this.current.length; this.j++) {
				yield this.makeCodeStepResult(3);

				yield this.makeFullStepResult(StepKind.Significant, `Compare index ${this.min} and ${this.j}`, HighlightStateSelectionSort.Selected, 4);
				if (this.current[this.j].value < this.current[this.min].value) {
					this.min = this.j;
					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.lastMin} and ${this.j}: Mark new minimum`, HighlightStateSelectionSort.OrderSwapped, 5);
					yield this.makeCodeStepResult(6);
				}
				else {
					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.min} and ${this.j}: Order is correct`, HighlightStateSelectionSort.OrderCorrect, 6);
				}

				yield this.makeCodeStepResult(7);
			}

			yield this.makeCodeStepResult(3);
			yield this.makeCodeStepResult(7);

			this.swapCurrent(this.i, this.min);
			yield this.makeFullStepResult(StepKind.Algorithmic, `Swap minimum on index ${this.min} with element on index i (${this.i})`, HighlightStateSelectionSort.MinSwap, 8);

			yield this.makeCodeStepResult(9);
		}

		yield this.makeCodeStepResult(1);
		yield this.makeCodeStepResult(9);

		yield this.makeFullStepResult(StepKind.Algorithmic, "Array sorted", undefined, this.getPseudocode().length - 1, true);
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
			"function selectSort(a: array)",
			"\tfor i := 0 to length(a)-2 do",
			"\t\tmin := i",
			"\t\tfor j := min+1 to length(a)-1 do",
			"\t\t\tif a[j] < a[min]",
			"\t\t\t\tmin := j",
			"\t\t\tend if",
			"\t\tend for",
			"\t\tswap(i, min)",
			"\tend for",
			"end function"
		];
	}
}