import { CssVariables, firstClass, lastClass, RendererClasses, RendererHighlightCssHelper } from "../CssInterface";
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

    public draw(parent: HTMLDivElement): void {
        parent.querySelectorAll(`.${RendererClasses.elementClass}`).forEach(div => parent.removeChild(div));

        let borderWidth = Number.parseFloat(getComputedStyle(parent).getPropertyValue(CssVariables.RendererElementBorderWidth));
        parent.style.setProperty(CssVariables.RendererDivMaxWidth, `${((parent.clientWidth - borderWidth) / this.array.length).toString()}px`);

        for (let i = 0; i < this.array.length; i++) {
            let div = document.createElement("div");
            div.classList.add(RendererClasses.elementClass);

            if(i == 0)
                div.classList.add(firstClass);
            if(i == this.array.length - 1)
                div.classList.add(lastClass);

            let highlight = this.highlights?.get(i);
            if (highlight != undefined)
                div.classList.add(RendererHighlightCssHelper.getCssClass(highlight));

            div.textContent = this.array[i].toString();

            parent.appendChild(div);
        }
    }
}