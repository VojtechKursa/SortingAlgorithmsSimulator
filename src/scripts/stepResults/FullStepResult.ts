import { ColorSet } from "../ColorSet"
import { CodeStepResult, DebuggerElement, VariableWatchElement } from "./CodeStepResult";
import { StepResult } from "./StepResult";



export type VisualizationElement = SVGSVGElement;

export abstract class FullStepResult extends StepResult {
    public readonly final: boolean;
    public readonly codeStepResult: CodeStepResult;

    protected constructor(final: boolean, text: string, codeStepResult: CodeStepResult) {
		super(text);

        this.final = final;
        this.codeStepResult = codeStepResult;
    }

    public display(visualizationElement: VisualizationElement, colorSet: ColorSet, debuggerElement: DebuggerElement, variableWatchElement: VariableWatchElement) {
        this.codeStepResult.display(debuggerElement, variableWatchElement);

        this.draw(visualizationElement, colorSet);
    }

    protected abstract draw(parent: VisualizationElement, colorSet: ColorSet): void;
    public abstract redraw(parent: VisualizationElement, colorSet: ColorSet): void;
}