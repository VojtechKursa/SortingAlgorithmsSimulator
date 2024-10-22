import { StepDescriptionController, StepDescriptionKind } from "../controllers/StepDescriptionController";
import { codeHighlightClass } from "../CssInterface";
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
		debuggerElement.querySelectorAll(`.${codeHighlightClass}`).forEach(element => element.classList.remove(codeHighlightClass));

		this.codeHighlights.forEach((_, key) => debuggerLines[key].classList.add(codeHighlightClass));
		
        stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, this.text);
	}
}