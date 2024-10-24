import { StepDescriptionController, StepDescriptionKind } from "../controllers/StepDescriptionController";
import { CodeHighlight, codeHighlightClass, VariableWatchClasses } from "../CssInterface";
import { CodeHighlights } from "../Highlights";
import { Variable } from "../Variable";
import { StepResult } from "./StepResult";



export class CodeStepResult extends StepResult {
	public constructor(
		text: string = "",
		public readonly codeHighlights: CodeHighlights = new Map<number, CodeHighlight>(),
		public readonly variables: Variable[] = []
	) {
		super(text);
	}

	public display(debuggerElement: HTMLDivElement, variableWatchElement: HTMLDivElement, stepDescriptionController: StepDescriptionController) {
		const debuggerLines = debuggerElement.children;
		debuggerElement.querySelectorAll(`.${codeHighlightClass}`).forEach(element => element.classList.remove(codeHighlightClass));

		this.codeHighlights.forEach((_, key) => debuggerLines[key].classList.add(codeHighlightClass));

		stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, this.text);
		
		variableWatchElement.innerText = "";

		this.variables.forEach(variable => {
			let row = document.createElement("tr");
			row.classList.add(VariableWatchClasses.row);
			variableWatchElement.appendChild(row);

			let variableNameColumn = document.createElement("td");
			variableNameColumn.classList.add(VariableWatchClasses.nameColumn);
			variableNameColumn.innerText = variable.name;
			row.appendChild(variableNameColumn);

			let variableValueColumn = document.createElement("td");
			variableValueColumn.classList.add(VariableWatchClasses.valueColumn);
			variableValueColumn.innerText = variable.value;
			row.appendChild(variableValueColumn);
		});
	}
}