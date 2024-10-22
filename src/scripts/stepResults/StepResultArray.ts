import { CssVariables, rendererElementClass, RendererHighlightCssHelper } from "../CssInterface";
import { VisualizationElement } from "../ElementDefinitions";
import { RendererHighlights } from "../Highlights";
import { CodeStepResult } from "./CodeStepResult";
import { FullStepResult } from "./FullStepResult";



export class StepResultArray extends FullStepResult {
    public readonly array: number[];
    public readonly highlights: RendererHighlights | null;

    public constructor(final: boolean, text: string, codeStepResult: CodeStepResult, array: number[], highlights: RendererHighlights | null) {
        super(final, text, codeStepResult);

        this.array = array.slice();
        this.highlights = highlights;
    }

    public draw(parent: VisualizationElement): void {
        parent.innerText = "";

        parent.style.setProperty(CssVariables.RendererDivMaxWidth, `${(100 / this.array.length).toString()}%`);

        for (let i = 0; i < this.array.length; i++) {
            let div = document.createElement("div");
            div.classList.add(rendererElementClass);

            let highlight = this.highlights?.get(i);
            if (highlight != undefined)
                div.classList.add(RendererHighlightCssHelper.getCssClass(highlight));

            div.textContent = this.array[i].toString();

            parent.appendChild(div);
        }
    }
}