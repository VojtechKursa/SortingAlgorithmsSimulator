import { ColorSet } from "../ColorSet"
import { StepDescriptionController, StepDescriptionKind } from "../controllers/StepDescriptionController";
import { SimulatorOutputElements } from "../htmlElementCollections/SimulatorOutputElements";
import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";



export abstract class FullStepResult extends StepResult {
    protected constructor(
        public readonly final: boolean = false,
        text: string = "",
        public readonly isLastSubstep: boolean,
        public readonly codeStepResult: CodeStepResult = new CodeStepResult()
    ) {
        super(text);
    }

    public display(outputElements: SimulatorOutputElements, colorSet: ColorSet): void {
        outputElements.stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, this.text);

        this.codeStepResult.display(outputElements);

        this.draw(outputElements.renderer, colorSet);
    }

    protected abstract draw(parent: SVGSVGElement, colorSet: ColorSet): void;
    public abstract redraw(parent: SVGSVGElement, colorSet: ColorSet): void;
}