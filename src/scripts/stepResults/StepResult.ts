import { Highlights } from "../Highlights"
import { ColorSet } from "../ColorSet"



export type OutputElement = HTMLElement;

export abstract class StepResult {
    public readonly final: boolean;
    public readonly text: string;
    public readonly codeHighlights: Highlights;

    protected constructor(final: boolean, text: string, codeHighlights: Highlights) {
        this.final = final;
        this.text = text;
        this.codeHighlights = codeHighlights;
    }

    public abstract draw(parent: OutputElement, colorSet: ColorSet): boolean;
}