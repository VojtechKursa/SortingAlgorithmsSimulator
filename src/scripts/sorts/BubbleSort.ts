import { StepResultArray } from "../data/stepResults/StepResultArray";
import { HighlightState } from "./SortingAlgorithm";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { Variable } from "../data/Variable";
import { SortingAlgorithmArray } from "./SortingAlgorithmArray";
import { StepKind } from "../data/stepResults/StepKind";

export class BubbleSort extends SortingAlgorithmArray {
	protected k?: number;
	protected swapped?: boolean;

	public constructor(input: number[]) {
		super(input);
	}

	protected makeFullStepResult(
		stepKind: StepKind.Algorithmic | StepKind.Significant,
		description: string,
		highlightState: HighlightState | undefined,
		highlightedLines: number[] | number,
		final: boolean = false,
		l?: number,
		additionalHighlights?: Highlights
	): StepResultArray {
		let highlights: Highlights = new Map<number, SymbolicColor>();

		if (final) {
			for (let i = 0; i < this.current.length; i++) {
				highlights.set(i, SymbolicColor.Element_Sorted);
			}
		}
		else {
			if (this.k != undefined) {
				if (highlightState == HighlightState.Selected) {
					highlights.set(this.k, SymbolicColor.Element_Highlight_1);
					highlights.set(this.k + 1, SymbolicColor.Element_Highlight_2);
				}
				else if (highlightState == HighlightState.OrderCorrect) {
					highlights.set(this.k, SymbolicColor.Element_OrderCorrect);
					highlights.set(this.k + 1, SymbolicColor.Element_OrderCorrect);
				}
				else if (highlightState == HighlightState.OrderSwapped) {
					highlights.set(this.k, SymbolicColor.Element_OrderIncorrect);
					highlights.set(this.k + 1, SymbolicColor.Element_OrderIncorrect);
				}
			}

			if (l != undefined) {
				for (let i = l; i < this.current.length; i++) {
					highlights.set(i, SymbolicColor.Element_Sorted);
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
		yield this.makeCodeStepResult(1);

		do {
			this.swapped = false;

			yield this.makeCodeStepResult(2);

			yield this.makeCodeStepResult(4);

			for (this.k = 0; this.k < this.current.length - 1; this.k++) {
				yield this.makeFullStepResult(StepKind.Significant, `Compare index ${this.k} and ${this.k + 1}`, HighlightState.Selected, 5);

				if (this.current[this.k] > this.current[this.k + 1]) {
					this.swapCurrent(this.k, this.k + 1);
					this.swapped = true;

					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.k} and ${this.k + 1}: Element on index ${this.k} is larger, elements will be swapped.`, HighlightState.OrderSwapped, [6, 7]);

					yield this.makeCodeStepResult(8);
				}
				else {
					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare index ${this.k} and ${this.k + 1}: Elements are in correct order.`, HighlightState.OrderCorrect, 8);
				}

				yield this.makeCodeStepResult(4);
			}

			yield this.makeCodeStepResult(9);
			yield this.makeCodeStepResult(10);
		} while (this.swapped)

		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted.", undefined, [this.getPseudocode().length - 1], true);
	}

	protected resetInternal(): void {
		this.k = undefined;
		this.swapped = undefined;
	}

	protected getVariables(): Array<Variable> {
		let result: Variable[] = [];

		if (this.k != undefined)
			result.push(new Variable("k", this.k, SymbolicColor.Variable_1));
		if (this.swapped != undefined)
			result.push(new Variable("swapped", this.swapped));

		return result;
	}

	public override getInitialStepResultArray(): StepResultArray {
		return new StepResultArray(StepKind.Algorithmic, this.current, null, undefined, undefined, undefined, this.current.length <= 1);
	}

	public getPseudocode(): string[] {
		return [
			"function bubbleSort(a: array)",
			"\tdo",
			"\t\tswapped := false",
			"\t\t",
			"\t\tfor k := 0 to length(a)-1 do",
			"\t\t\tif a[k] > a[k+1]",
			"\t\t\t\tswap(a[k], a[k+1])",
			"\t\t\t\tswapped := true",
			"\t\t\tend if",
			"\t\tend for",
			"\twhile swapped",
			"end function"
		];
	}
}