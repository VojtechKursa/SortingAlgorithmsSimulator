import { StepResultArray } from "../data/stepResults/StepResultArray";
import { Variable } from "../data/Variable";
import { IndexedNumber } from "../data/IndexedNumber";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { SortingAlgorithmArray } from "./SortingAlgorithmArray";
import { StepKind } from "../data/stepResults/StepKind";
import { SortProperties } from "../../sortsConfigs/definitions/SortProperties";
import { InsertSortProperties } from "../../sortsConfigs/sorts/InsertSortProperties";

const enum HighlightStateInsertionSort {
	Selected,
	OrderCorrect,
	OrderSwapped,
	Inserted
}

export class InsertionSort extends SortingAlgorithmArray {
	protected i?: number;
	protected x?: number;
	protected j?: number;

	public get properties(): SortProperties {
		return InsertSortProperties;
	}

	public constructor(input: number[]) {
		super(input);
	}

	protected makeFullStepResult(
		stepKind: StepKind.Algorithmic | StepKind.Significant,
		description: string,
		highlightState: HighlightStateInsertionSort | undefined,
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
			if (this.j != undefined) {
				switch (highlightState) {
					case HighlightStateInsertionSort.Selected:
						highlights.set(this.j - 1, SymbolicColor.Element_Highlight_1);
						highlights.set(this.j, SymbolicColor.Element_Highlight_2);
						break;
					case HighlightStateInsertionSort.OrderCorrect:
						highlights.set(this.j - 1, SymbolicColor.Element_OrderCorrect);
						highlights.set(this.j, SymbolicColor.Element_OrderCorrect);
						break;
					case HighlightStateInsertionSort.OrderSwapped:
						highlights.set(this.j - 1, SymbolicColor.Element_OrderIncorrect);
						highlights.set(this.j, SymbolicColor.Element_OrderIncorrect);
						break;
					case HighlightStateInsertionSort.Inserted:
						highlights.set(this.j, SymbolicColor.Element_Highlight_3);
						break;
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

		return new StepResultArray(stepKind, this.current, highlights, description, highlightedLines, this.getVariables(), final);
	}

	protected override makeCodeStepResult(highlightedLines: number[] | number, description: string | undefined = undefined): StepResultArray {
		return super.makeCodeStepResult(highlightedLines, description, this.getVariables());
	}

	protected override * stepForwardArray(): Generator<StepResultArray> {
		let xIndexed: IndexedNumber;

		for (this.i = 1; this.i < this.current.length; this.i++) {
			yield this.makeCodeStepResult(1);

			xIndexed = this.current[this.i];
			this.x = xIndexed.value;
			yield this.makeCodeStepResult(2);

			this.j = this.i;
			yield this.makeCodeStepResult(3);

			while (this.j > 0 && this.current[this.j - 1].value > this.x) {
				yield this.makeFullStepResult(StepKind.Significant, `Compare index ${this.j - 1} and ${this.j}`, HighlightStateInsertionSort.Selected, 4);

				let picked = this.current[this.j - 1];
				this.current[this.j] = picked;
				this.current[this.j - 1] = picked.duplicate();
				yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.j - 1} and ${this.j}: Order is incorrect, shift lower element up`, HighlightStateInsertionSort.OrderSwapped, 5);

				this.j--;
				yield this.makeCodeStepResult(6);
				yield this.makeCodeStepResult(7);
			}

			yield this.makeFullStepResult(StepKind.Significant, `Compare index ${this.j - 1} and ${this.j}`, HighlightStateInsertionSort.Selected, 4);

			if (this.j > 0) {
				yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.j - 1} and ${this.j}: Order is correct`, HighlightStateInsertionSort.OrderCorrect, 7);
			}
			else {
				yield this.makeFullStepResult(StepKind.Significant, `Reached the beginning of the list`, HighlightStateInsertionSort.Selected, 7);
			}

			this.current[this.j] = xIndexed;
			yield this.makeFullStepResult(StepKind.Algorithmic, `Insert x into index ${this.j}`, HighlightStateInsertionSort.Inserted, 8);

			yield this.makeCodeStepResult(9);
		}

		yield this.makeCodeStepResult(1);
		yield this.makeCodeStepResult(9);

		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted.", undefined, this.getPseudocode().length - 1, true);
	}

	protected resetInternal(): void {
		this.i = undefined;
		this.j = undefined;
		this.x = undefined;
	}

	protected getVariables(): Array<Variable> {
		let variables = new Array<Variable>();

		if (this.i != undefined)
			variables.push(new Variable("i", this.i, SymbolicColor.Variable_1));
		if (this.x != undefined)
			variables.push(new Variable("x", this.x, undefined));
		if (this.j != undefined)
			variables.push(new Variable("j", this.j, SymbolicColor.Variable_2));

		return variables;
	}

	public override getInitialStepResultArray(): StepResultArray {
		return new StepResultArray(StepKind.Algorithmic, this.current, null, undefined, undefined, undefined, this.current.length <= 1);
	}

	public getPseudocode(): string[] {
		return [
			"function insertionSort(A: array)",
			"\tfor i := 1 to length(A)-1 do",
			"\t\tx := A[i]",
			"\t\tj := i",
			"\t\twhile j > 0 and A[j-1] > x",
			"\t\t\tA[j] := A[j-1]",
			"\t\t\tj := j - 1",
			"\t\tend while",
			"\t\tA[j] := x",
			"\tend for",
			"end function"
		];
	}
}