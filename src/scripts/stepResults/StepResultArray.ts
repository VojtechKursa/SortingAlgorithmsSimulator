import { ColorSet } from "../ColorSet";
import { Highlights } from "../Highlights";
import { OutputElement, StepResult } from "./StepResult";



export class StepResultArray extends StepResult {
    public readonly array: number[];
    public readonly highlights: Highlights

    public constructor(final: boolean, text: string, codeHighlights: Highlights, array: number[], highlights: Highlights) {
        super(final, text, codeHighlights);

        this.array = array;
        this.highlights = highlights;
    }

    public draw(parent: OutputElement, colorSet: ColorSet): boolean {
        let boxSize = Math.min(parent.clientWidth, parent.clientHeight) / this.array.length;
        let y = (parent.clientHeight - boxSize) / 2;

        let resultBuilder = new Array<string>;

        for(let i = 0; i < this.array.length; i++) {
            resultBuilder.push(`<rect x="${i*boxSize}" y="${y}" width="${boxSize}" height="${boxSize}" stroke="black" stroke-width="2px" fill="${colorSet.get(this.highlights.get(i))}" />`);
            resultBuilder.push(`<text x="${(i + 0.5) * boxSize}" y="${y + (boxSize / 2)}" color="black" alignment-baseline="central" text-anchor="middle">${this.array[i]}</text>`)
        }

        parent.innerHTML = resultBuilder.join("\n");

        return true;
    }
}