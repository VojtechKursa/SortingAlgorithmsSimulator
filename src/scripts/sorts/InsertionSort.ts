import { Variable } from "../data/Variable";
import { IndexedNumber } from "../data/IndexedNumber";
import { Highlights } from "../visualization/Highlights";
import { SymbolicColor } from "../visualization/colors/SymbolicColor";
import { StepKind } from "../data/stepResults/StepKind";
import { SortProperties } from "../../sortsConfigs/definitions/SortProperties";
import { InsertSortProperties } from "../../sortsConfigs/sorts/InsertSortProperties";
import { SortingAlgorithm } from "./SortingAlgorithm";
import { AnnotatedArray, StepResultMultiArray } from "../data/stepResults/StepResultMultiArray";

const enum HighlightStateInsertionSort {
	Selected,
	OrderCorrect,
	OrderSwapped,
	TakenOut,
	Inserted
}

export class InsertionSort extends SortingAlgorithm {
	protected current: IndexedNumber[];

	protected lastFullStep: StepResultMultiArray;

	protected i?: number;
	protected x?: IndexedNumber;
	protected j?: number;

	private mainArrayName: string | undefined = undefined;
	private sideArrayName: string | undefined = "x";

	public get properties(): SortProperties {
		return InsertSortProperties;
	}

	public constructor(input: number[]) {
		super(input);

		this.current = this.input.slice();
		this.lastFullStep = this.getInitialStepResult();
	}

	protected makeFullStepResult(
		stepKind: StepKind.Algorithmic | StepKind.Significant,
		description: string,
		highlightState: HighlightStateInsertionSort | undefined,
		highlightedLines: number[] | number,
		final: boolean = false,
		additionalHighlights?: Highlights
	): StepResultMultiArray {
		const mainHighlights: Highlights = new Map<number, SymbolicColor>();
		const arrays = [new AnnotatedArray(this.current, mainHighlights, this.getVariables(), this.mainArrayName)];

		const sideHighlights: Highlights = new Map<number, SymbolicColor>();
		if (this.x != undefined && !final) {
			arrays.push(new AnnotatedArray([this.x], sideHighlights, undefined, this.sideArrayName))
		}

		if (final) {
			for (let i = 0; i < this.current.length; i++) {
				mainHighlights.set(i, SymbolicColor.Element_Sorted);
			}
		}
		else {
			if (this.j != undefined) {
				switch (highlightState) {
					case HighlightStateInsertionSort.Selected:
						mainHighlights.set(this.j - 1, SymbolicColor.Element_Highlight_2);
						sideHighlights.set(0, SymbolicColor.Element_Highlight_1);
						break;
					case HighlightStateInsertionSort.OrderCorrect:
						mainHighlights.set(this.j - 1, SymbolicColor.Element_OrderCorrect);
						sideHighlights.set(0, SymbolicColor.Element_OrderCorrect);
						break;
					case HighlightStateInsertionSort.OrderSwapped:
						mainHighlights.set(this.j - 1, SymbolicColor.Element_OrderIncorrect);
						mainHighlights.set(this.j, SymbolicColor.Element_OrderIncorrect);
						break;
					case HighlightStateInsertionSort.TakenOut:
						mainHighlights.set(this.j, SymbolicColor.Element_Highlight_3);
						sideHighlights.set(0, SymbolicColor.Element_Highlight_3);
						break;
					case HighlightStateInsertionSort.Inserted:
						mainHighlights.set(this.j, SymbolicColor.Element_Highlight_3);
						sideHighlights.set(0, SymbolicColor.Element_Highlight_3);
						break;
				}
			}
		}

		if (additionalHighlights) {
			for (const key of additionalHighlights.keys()) {
				let value = additionalHighlights.get(key);

				if (value)
					mainHighlights.set(key, value);
			}
		}

		return new StepResultMultiArray(stepKind, final, description, highlightedLines, arrays);
	}

	protected makeCodeStepResult(highlightedLines: number[] | number, description: string | undefined = undefined): StepResultMultiArray {
		const arrays = [new AnnotatedArray(this.current, this.lastFullStep.arrays[0].step.arrayHighlights, this.getVariables())];

		if (this.x != undefined) {
			const highlights = this.lastFullStep.arrays.length < 2 ? null : this.lastFullStep.arrays[1].step.arrayHighlights;
			arrays.push(new AnnotatedArray([this.x], highlights, undefined, this.sideArrayName));
		}

		return new StepResultMultiArray(StepKind.Code, false, description, highlightedLines, arrays);
	}

	protected override * stepForwardInternal(): Generator<StepResultMultiArray> {
		const compareStepDescription = "Compare value at index j-1 and X";

		for (this.i = 1; this.i < this.current.length; this.i++) {
			yield this.makeCodeStepResult(1);

			this.x = this.current[this.i];
			this.current[this.i] = this.x.duplicate();
			this.j = this.i;
			yield this.makeFullStepResult(StepKind.Algorithmic, "Create a copy of value at index i", HighlightStateInsertionSort.TakenOut, [2, 3]);

			while (this.j > 0 && this.current[this.j - 1] > this.x) {
				yield this.makeFullStepResult(StepKind.Significant, compareStepDescription, HighlightStateInsertionSort.Selected, 4);

				let picked = this.current[this.j - 1];
				this.current[this.j] = picked;
				this.current[this.j - 1] = picked.duplicate();
				yield this.makeFullStepResult(StepKind.Algorithmic, `${compareStepDescription}: Order is incorrect, shift lower element up`, HighlightStateInsertionSort.OrderSwapped, 5);

				this.j--;
				yield this.makeCodeStepResult(6);
				yield this.makeCodeStepResult(7);
			}

			yield this.makeFullStepResult(StepKind.Significant, compareStepDescription, HighlightStateInsertionSort.Selected, 4);

			if (this.j > 0) {
				yield this.makeFullStepResult(StepKind.Algorithmic, `${compareStepDescription}: Order is correct`, HighlightStateInsertionSort.OrderCorrect, 7);
			}
			else {
				yield this.makeFullStepResult(StepKind.Significant, `Reached the beginning of the list`, HighlightStateInsertionSort.Selected, 7);
			}

			this.current[this.j] = this.x;
			this.x = this.x.duplicate();	// prevent duplication of X
			yield this.makeFullStepResult(StepKind.Algorithmic, `Insert X into index j`, HighlightStateInsertionSort.Inserted, 8);

			yield this.makeCodeStepResult(9);
		}

		yield this.makeCodeStepResult(1);
		yield this.makeCodeStepResult(9);

		yield this.makeFullStepResult(StepKind.Algorithmic, "Array is sorted.", undefined, this.getPseudocode().length - 1, true);
	}

	protected resetInternal(): void {
		this.resetVariables();

		this.current = this.input.slice();
		this.lastFullStep = this.getInitialStepResult();
	}

	protected resetVariables(): void {
		this.i = undefined;
		this.j = undefined;
		this.x = undefined;
	}

	protected getVariables(): Array<Variable> {
		let variables = new Array<Variable>();

		if (this.i != undefined)
			variables.push(new Variable("i", this.i, SymbolicColor.Variable_1));
		if (this.x != undefined)
			variables.push(new Variable("x", this.x.value, undefined));
		if (this.j != undefined)
			variables.push(new Variable("j", this.j, SymbolicColor.Variable_2));

		return variables;
	}

	public override getInitialStepResult(): StepResultMultiArray {
		return new StepResultMultiArray(StepKind.Algorithmic, this.current.length <= 1, undefined, undefined, [new AnnotatedArray(this.current)]);
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