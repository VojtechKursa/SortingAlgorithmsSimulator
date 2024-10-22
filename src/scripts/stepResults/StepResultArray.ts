import { ColorSet } from "../ColorSet";
import { CssRendererClass, CssVariables } from "../CssInterface";
import { VisualizationElement } from "../ElementDefinitions";
import { Highlights } from "../Highlights";
import { CodeStepResult } from "./CodeStepResult";
import { FullStepResult } from "./FullStepResult";



export class StepResultArray extends FullStepResult {
    public readonly array: number[];
    public readonly highlights: Highlights | null;

    public constructor(final: boolean, text: string, codeStepResult: CodeStepResult, array: number[], highlights: Highlights | null) {
        super(final, text, codeStepResult);

        this.array = array.slice();
        this.highlights = highlights;
    }

    public draw(parent: VisualizationElement, colorSet: ColorSet): void {
        parent.innerText = "";
        
        parent.style.setProperty(CssVariables.RendererDivMaxWidth, `${(100 / this.array.length).toString()}%`);

        for (let i = 0; i < this.array.length; i++) {
            let div = document.createElement("div");
            div.classList.add(CssRendererClass.Element);
            div.textContent = this.array[i].toString();

            parent.appendChild(div);
        }
    }
}