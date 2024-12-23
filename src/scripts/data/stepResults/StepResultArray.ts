import { ColorSet } from "../../visualization/ColorSet";
import { IndexedNumber } from "../IndexedNumber";
import { CodeStepResult } from "./CodeStepResult";
import { FullStepResult } from "./FullStepResult";
import { RendererHighlights } from "../../visualization/Highlights";



export class StepResultArray extends FullStepResult {
    public readonly array: IndexedNumber[];
    public readonly highlights: RendererHighlights | null;

    public constructor(
        final: boolean,
        text: string,
        isLastSubstep: boolean,
        codeStepResult: CodeStepResult,
        array: IndexedNumber[],
        highlights: RendererHighlights | null
    ) {
        super(final, text, isLastSubstep, codeStepResult);

        this.array = array.slice();
        this.highlights = highlights;
    }
}