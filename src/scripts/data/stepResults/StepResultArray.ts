import { Highlights } from "../../visualization/Highlights";
import { IndexedNumber } from "../IndexedNumber";
import { CodeStepResult } from "./CodeStepResult";
import { FullStepResult } from "./FullStepResult";



export class StepResultArray extends FullStepResult {
	public readonly array: readonly IndexedNumber[];
	public readonly highlights: Highlights | null;

	public constructor(
		final: boolean,
		text: string,
		isLastSubstep: boolean,
		codeStepResult: CodeStepResult,
		array: IndexedNumber[],
		highlights: Highlights | null
	) {
		super(final, text, isLastSubstep, codeStepResult);

		this.array = array.slice();
		this.highlights = highlights;
	}
}