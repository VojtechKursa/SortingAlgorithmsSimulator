import { ColorSet } from "../ColorSet"
import { StepDescriptionController, StepDescriptionKind } from "../controllers/StepDescriptionController";
import { DebuggerElement, VariableWatchElement, VisualizationElement } from "../ElementDefinitions";
import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";



export abstract class FullStepResult extends StepResult {
    public readonly final: boolean;
    public readonly codeStepResult: CodeStepResult;

    protected constructor(final: boolean, text: string, codeStepResult: CodeStepResult) {
        super(text);

        this.final = final;
        this.codeStepResult = codeStepResult;
    }

    public display(visualizationElement: VisualizationElement, colorSet: ColorSet, debuggerElement: DebuggerElement, variableWatchElement: VariableWatchElement, stepDescriptionController: StepDescriptionController) {
        this.codeStepResult.display(debuggerElement, variableWatchElement, stepDescriptionController);

        this.draw(visualizationElement, colorSet);

        stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, this.text);
    }

    protected abstract draw(parent: VisualizationElement, colorSet: ColorSet): void;
    public abstract redraw(parent: VisualizationElement, colorSet: ColorSet): void;
}