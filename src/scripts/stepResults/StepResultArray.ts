import { ColorSet } from "../ColorSet";
import { IndexedNumber } from "../IndexedNumber";
import { CodeStepResult } from "./CodeStepResult";
import { FullStepResult } from "./FullStepResult";
import { RendererHighlights } from "../Highlights";



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

    public draw(parent: SVGSVGElement, colorSet: ColorSet): void {
        let borderWidth = 2;

        let boxSize = Math.min((parent.clientWidth / this.array.length) - borderWidth, parent.clientHeight - borderWidth);
        let y = (parent.clientHeight - boxSize) / 2;
        let leftOffset = (parent.clientWidth - this.array.length * boxSize) / 2;

        let resultBuilder = new Array<string>;

        for (let i = 0; i < this.array.length; i++) {
            resultBuilder.push(`<rect x="${leftOffset + i * boxSize}" y="${y}" width="${boxSize}" height="${boxSize}" stroke="black" stroke-width="${borderWidth}px" fill="${colorSet.get(this.highlights != null ? this.highlights.get(i) : undefined)}" />`);
            resultBuilder.push(`<text x="${leftOffset + (i + 0.5) * boxSize}" y="${y + (boxSize / 2)}" color="black" alignment-baseline="central" text-anchor="middle">${this.array[i].value}</text>`)
        }

        parent.innerHTML = resultBuilder.join("\n");
    }

    public redraw(parent: SVGSVGElement, colorSet: ColorSet): void {
        this.draw(parent, colorSet);
    }
}