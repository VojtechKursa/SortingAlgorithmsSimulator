import { StepDescriptionController, StepDescriptionKind } from "../controllers/StepDescriptionController";
import { CodeHighlight, codeHighlightClass } from "../CssInterface";
import { CodeHighlights } from "../Highlights";
import { StepResult } from "./StepResult";



export class CodeStepResult extends StepResult {
	public constructor(
		text: string = "",
		public readonly codeHighlights: CodeHighlights = new Map<number, CodeHighlight>(),
		public readonly variables: Map<string, any>
	) {
		super(text);
	}

	public display(debuggerElement: HTMLDivElement, variableWatchElement: HTMLDivElement, stepDescriptionController: StepDescriptionController) {
		const debuggerLines = debuggerElement.children;
		debuggerElement.querySelectorAll(`.${codeHighlightClass}`).forEach(element => element.classList.remove(codeHighlightClass));

		this.codeHighlights.forEach((_, key) => debuggerLines[key].classList.add(codeHighlightClass));

		stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, this.text);
	}
}