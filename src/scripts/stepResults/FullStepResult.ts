import { StepDescriptionController, StepDescriptionKind } from "../controllers/StepDescriptionController";
import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";



export abstract class FullStepResult extends StepResult {
    protected constructor(
        public readonly final: boolean,
        text: string,
        public readonly codeStepResult: CodeStepResult
    ) {
        super(text);
    }

    public display(visualizationElement: HTMLDivElement, debuggerElement: HTMLDivElement, variableWatchElement: HTMLDivElement, stepDescriptionController: StepDescriptionController) {
        this.codeStepResult.display(debuggerElement, variableWatchElement, stepDescriptionController);

        this.draw(visualizationElement);

        stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, this.text);
    }

    protected abstract draw(parent: HTMLDivElement): void;
    public redraw(parent: HTMLDivElement): void { }
}