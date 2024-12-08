import { CssVariables, firstClass, lastClass, RendererClasses, RendererHighlightCssHelper } from "../CssInterface";
import { RendererHighlights } from "../Highlights";
import { IndexedNumber } from "../IndexedNumber";
import { CodeStepResult } from "./CodeStepResult";
import { FullStepResult } from "./FullStepResult";



export class StepResultArray extends FullStepResult {
    public readonly array: IndexedNumber[];
    public readonly highlights: RendererHighlights | null;

    public constructor(final: boolean, text: string, codeStepResult: CodeStepResult, array: IndexedNumber[], highlights: RendererHighlights | null) {
        super(final, text, codeStepResult);

        this.array = array.slice();
        this.highlights = highlights;
    }

    public draw(parent: HTMLDivElement): void {
        parent.querySelectorAll(`.${RendererClasses.elementClass}`).forEach(div => parent.removeChild(div));

        let borderWidth = Number.parseFloat(getComputedStyle(parent).getPropertyValue(CssVariables.RendererElementBorderWidth));
        parent.style.setProperty(CssVariables.RendererDivMaxWidth, `${((parent.clientWidth - borderWidth) / this.array.length).toString()}px`);

        for (let i = 0; i < this.array.length; i++) {
            const number = this.array[i];
            const div = document.createElement("div");
            div.classList.add(RendererClasses.elementClass);

            if (i == 0)
                div.classList.add(firstClass);
            if (i == this.array.length - 1)
                div.classList.add(lastClass);

            let highlight = this.highlights?.get(i);
            if (highlight != undefined)
                div.classList.add(RendererHighlightCssHelper.getCssClass(highlight));

            const valueElement = document.createElement("div");
            valueElement.classList.add(RendererClasses.elementValueClass);
            valueElement.textContent = number.value.toString();
            div.appendChild(valueElement);

            if (number.index != null) {
                const indexElement = document.createElement("div");
                indexElement.classList.add(RendererClasses.elementIndexClass);
                indexElement.textContent = number.index.toString();

                div.appendChild(indexElement);
            }

            parent.appendChild(div);
        }
    }
}