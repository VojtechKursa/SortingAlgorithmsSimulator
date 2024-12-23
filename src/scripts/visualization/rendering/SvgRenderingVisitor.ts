import { StepDescriptionKind } from "../../controllers/StepDescriptionController";
import { SimulatorOutputElements } from "../../data/collections/htmlElementCollections/SimulatorOutputElements";
import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { StepResultArray } from "../../data/stepResults/StepResultArray";
import { ColorSet } from "../ColorSet";
import { codeHighlightClass, VariableWatchClasses } from "../CssInterface";
import { RenderingVisitor } from "./RenderingVisitor";

export class SvgRenderingVisitor implements RenderingVisitor {
	public constructor(
		public colorSet: ColorSet,
		public readonly output: SimulatorOutputElements
	) { }

	public handleFullStepDraw(step: FullStepResult): void {
		this.output.stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, step.text);

		if (step instanceof StepResultArray) {
			const parent = this.output.renderer;

			let borderWidth = 2;

			let boxSize = Math.min((parent.clientWidth / step.array.length) - borderWidth, parent.clientHeight - borderWidth);
			let y = (parent.clientHeight - boxSize) / 2;
			let leftOffset = (parent.clientWidth - step.array.length * boxSize) / 2;
	
			let resultBuilder = new Array<string>();
	
			for (let i = 0; i < step.array.length; i++) {
				resultBuilder.push(`<rect x="${leftOffset + i * boxSize}" y="${y}" width="${boxSize}" height="${boxSize}" stroke="black" stroke-width="${borderWidth}px" fill="${this.colorSet.get(step.highlights != null ? step.highlights.get(i) : undefined)}" />`);
				resultBuilder.push(`<text x="${leftOffset + (i + 0.5) * boxSize}" y="${y + (boxSize / 2)}" color="black" alignment-baseline="central" text-anchor="middle">${step.array[i].value}</text>`)
			}
	
			parent.innerHTML = resultBuilder.join("\n");
		}
		else
			throw new Error("Renderer not written for this step result.");

		step.codeStepResult.display(this);
	}

	public handleFullStepRedraw(step: FullStepResult): void {
		this.handleFullStepDraw(step);

        step.codeStepResult.redraw(this);
	}

	public handleCodeStepDraw(step: CodeStepResult): void {
		this.codeStep_handleDebuggerHighlights(step);
		this.codeStep_handleVariableWatchUpdate(step);
		this.codeStep_drawVariables(step);

		this.output.stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, step.text);
	}

	public handleCodeStepRedraw(step: CodeStepResult): void {
		this.handleCodeStepDraw(step);
	}

	protected codeStep_handleDebuggerHighlights(step: CodeStepResult): void {
		const debuggerElement = this.output.debuggerElement;

		const debuggerLines = debuggerElement.children;
		debuggerElement.querySelectorAll(`.${codeHighlightClass}`).forEach(element => element.classList.remove(codeHighlightClass));

		step.codeHighlights.forEach((_, key) => debuggerLines[key].classList.add(codeHighlightClass));
	}

	protected codeStep_handleVariableWatchUpdate(step: CodeStepResult) {
		const variableWatchElement = this.output.variableWatch;

		variableWatchElement.innerText = "";

		step.variables.forEach(variable => {
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

	protected codeStep_drawVariables(step: CodeStepResult) {
		const variableRenderer = this.output.renderer;
		//variableRenderer.querySelectorAll(`.${RendererClasses.variableClass}`).forEach(child => variableRenderer.removeChild(child));

		step.variables.filter(variable => variable.draw).forEach(variable => {
			let div = document.createElement("div");
			//div.classList.add(RendererClasses.variableClass);
			div.style.gridColumn = variable.value + 1;
			div.textContent = variable.name;

			variableRenderer.appendChild(div);
		});
	}
}