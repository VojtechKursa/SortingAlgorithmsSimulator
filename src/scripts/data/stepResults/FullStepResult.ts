import { ColorSet } from "../../visualization/ColorSet"
import { StepDescriptionController, StepDescriptionKind } from "../../controllers/StepDescriptionController";
import { SimulatorOutputElements } from "../collections/htmlElementCollections/SimulatorOutputElements";
import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";
import { RenderingVisitor } from "../../visualization/rendering/RenderingVisitor";



export abstract class FullStepResult extends StepResult {
    protected constructor(
        public readonly final: boolean = false,
        text: string = "",
        public readonly isLastSubstep: boolean,
        public readonly codeStepResult: CodeStepResult = new CodeStepResult()
    ) {
        super(text);
    }

    public display(outputElements: SimulatorOutputElements, renderer: RenderingVisitor): void {
        outputElements.stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, this.text);

        renderer.handleFullStepDraw(this, outputElements);

        this.codeStepResult.display(outputElements, renderer);
    }

    public redraw(outputElements: SimulatorOutputElements, renderer: RenderingVisitor): void {
        renderer.handleFullStepRedraw(this, outputElements);

        this.codeStepResult.redraw(outputElements, renderer);
    }
}