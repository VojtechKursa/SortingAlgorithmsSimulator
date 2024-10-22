import { StepDescriptionController, StepDescriptionKind } from "../controllers/StepDescriptionController";
import { DebuggerElement, VariableWatchElement } from "../ElementDefinitions";
import { Highlights } from "../Highlights";
import { StepResult } from "./StepResult";



export class CodeStepResult extends StepResult {
	public readonly codeHighlights: Highlights;
	public readonly variables: Map<string, any>;

	public constructor(text: string, codeHighlights: Highlights, variables: Map<string, any>) {
		super(text);

		this.codeHighlights = codeHighlights;
		this.variables = variables;
	}

	public display(debuggerElement: DebuggerElement, variableWatchElement: VariableWatchElement, stepDescriptionController: StepDescriptionController) {
		const debuggerLines = debuggerElement.children;
		debuggerElement.querySelectorAll(`.${this.highlightClass}`).forEach(element => element.classList.remove(this.highlightClass));

		this.codeHighlights.forEach((_, key) => debuggerLines[key].classList.add(this.highlightClass));
		
        stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, this.text);
	}
}