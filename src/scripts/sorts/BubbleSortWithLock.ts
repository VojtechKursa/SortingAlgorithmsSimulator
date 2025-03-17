import { StepKind } from "../data/stepResults/StepKind";
import { StepResultArray } from "../data/stepResults/StepResultArray";
import { Variable } from "../data/Variable";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { BubbleSort } from "./BubbleSort";
import { HighlightState } from "./SortingAlgorithm";

export class BubbleSortWithLock extends BubbleSort {
	protected l?: number;
	protected next_l?: number;

	public constructor(input: number[]) {
		super(input);
	}

	protected override * stepForwardArray(): Generator<StepResultArray> {
		this.next_l = this.current.length;
		yield this.makeCodeStepResult(1);

		while (this.next_l >= 2) {
			yield this.makeCodeStepResult(3);

			this.l = this.next_l;
			this.next_l = 0;
			yield this.makeCodeStepResult([4, 5]);

			for (this.k = 0; this.k < this.l - 1; this.k++) {
				if (this.k == 0) {
					yield this.makeFullStepResult(StepKind.Significant, "Enter a new bubbling loop", undefined, 7, false, this.l);
				}
				else {
					yield this.makeCodeStepResult(7);
				}

				yield this.makeFullStepResult(StepKind.Significant, `Compare elements on indexes ${this.k} and ${this.k + 1}`, HighlightState.Selected, 8, false, this.l);
				if (this.current[this.k] > this.current[this.k + 1]) {
					this.swapCurrent(this.k, this.k + 1);
					this.next_l = this.k + 1;

					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare elements on indexes ${this.k} and ${this.k + 1}: Elements are in incorrect order`, HighlightState.OrderSwapped, [9, 10], false, this.l);
					yield this.makeCodeStepResult(11);
				}
				else {
					yield this.makeFullStepResult(StepKind.Algorithmic, `Compare elements on indexes ${this.k} and ${this.k + 1}: Elements are in correct order`, HighlightState.OrderCorrect, 11, false, this.l);
				}
			}

			yield this.makeCodeStepResult(7);
			yield this.makeCodeStepResult(12);
		}

		yield this.makeCodeStepResult(3);
		yield this.makeCodeStepResult(13);

		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted", undefined, this.getPseudocode().length - 1, true);
	}

	protected override getVariables(): Array<Variable> {
		let result = super.getVariables();

		if (this.next_l != undefined)
			result.push(new Variable("next_l", this.next_l, SymbolicColor.Variable_2));
		if (this.l != undefined)
			result.push(new Variable("l", this.l, SymbolicColor.Variable_3));

		return result;
	}

	protected override resetInternal(): void {
		super.resetInternal();

		this.l = undefined;
		this.next_l = undefined;
	}

	public override getPseudocode(): string[] {
		return [
			"function bubbleSort(a: array)",
			"\tnext_l := length(a)",
			"\t",
			"\twhile next_l >= 2",
			"\t\tl := next_l",
			"\t\tnext_l := 0",
			"\t\t",
			"\t\tfor k := 0 to l-2 do",
			"\t\t\tif a[k] > a[k+1]",
			"\t\t\t\tswap(a[k], a[k+1])",
			"\t\t\t\tnext_l := k + 1",
			"\t\t\tend if",
			"\t\tend for",
			"\tend while",
			"end function"
		];
	}
}