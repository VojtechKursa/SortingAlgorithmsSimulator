import { StepDescriptionKind } from "../../controllers/StepDescriptionController";
import { CodeHighlights, CodeHighlight } from "../../visualization/Highlights";
import { codeHighlightClass, VariableWatchClasses } from "../../visualization/CssInterface";
import { SimulatorOutputElements } from "../collections/htmlElementCollections/SimulatorOutputElements";
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

	public display(outputElements: SimulatorOutputElements): void {
		this.handleDebuggerHighlights(outputElements.debuggerElement);
		this.handleVariableWatchUpdate(outputElements.variableWatch);
		this.drawVariables(outputElements.renderer);

		outputElements.stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, this.text);
	}

	protected handleDebuggerHighlights(debuggerElement: HTMLDivElement): void {
		const debuggerLines = debuggerElement.children;
		debuggerElement.querySelectorAll(`.${codeHighlightClass}`).forEach(element => element.classList.remove(codeHighlightClass));

		this.codeHighlights.forEach((_, key) => debuggerLines[key].classList.add(codeHighlightClass));
	}

	protected handleVariableWatchUpdate(variableWatchElement: HTMLDivElement) {
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

	protected drawVariables(variableRenderer: SVGSVGElement) {
		//variableRenderer.querySelectorAll(`.${RendererClasses.variableClass}`).forEach(child => variableRenderer.removeChild(child));

		this.variables.filter(variable => variable.draw).forEach(variable => {
			let div = document.createElement("div");
			//div.classList.add(RendererClasses.variableClass);
			div.style.gridColumn = variable.value + 1;
			div.textContent = variable.name;

			variableRenderer.appendChild(div);
		});
	}
}