import { ColorSet } from "../ColorSet";
import { Highlights } from "../Highlights";
import { OutputElement, StepResult } from "./StepResult";



export class StepResultArray extends StepResult {
    public readonly array: number[];
    public readonly highlights: Highlights | null

    public constructor(final: boolean, text: string, codeHighlights: Highlights | null, array: number[], highlights: Highlights | null) {
        super(final, text, codeHighlights);

        this.array = array.slice();
        this.highlights = highlights;
    }

    public draw(parent: OutputElement, colorSet: ColorSet): boolean {
        let borderWidth = 2;

        let boxSize = Math.min((parent.clientWidth / this.array.length) - borderWidth, parent.clientHeight - borderWidth);
        let y = (parent.clientHeight - boxSize) / 2;
        let leftOffset = (parent.clientWidth - this.array.length * boxSize) / 2;

        let resultBuilder = new Array<string>;

        for(let i = 0; i < this.array.length; i++) {
            resultBuilder.push(`<rect x="${leftOffset + i*boxSize}" y="${y}" width="${boxSize}" height="${boxSize}" stroke="black" stroke-width="${borderWidth}px" fill="${colorSet.get(this.highlights != null ? this.highlights.get(i) : undefined)}" />`);
            resultBuilder.push(`<text x="${leftOffset + (i + 0.5) * boxSize}" y="${y + (boxSize / 2)}" color="black" alignment-baseline="central" text-anchor="middle">${this.array[i]}</text>`)
        }

        parent.innerHTML = resultBuilder.join("\n");

        return true;
    }
}