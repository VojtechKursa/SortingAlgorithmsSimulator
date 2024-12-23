import { StepDescriptionKind } from "../../controllers/StepDescriptionController";
import { SimulatorOutputElements } from "../../data/collections/htmlElementCollections/SimulatorOutputElements";
import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { StepResultArray } from "../../data/stepResults/StepResultArray";
import { ColorSet } from "../ColorSet";
import { codeHighlightClass, VariableWatchClasses } from "../CssInterface";
import { RenderingVisitor } from "./RenderingVisitor";

class Rectangle {
	public constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly height: number,
		public readonly width: number
	) { }
}

export class SvgRenderingVisitor implements RenderingVisitor {
	private readonly arrayElementLocations = new Array<Rectangle>();

	public constructor(
		public colorSet: ColorSet,
		public readonly output: SimulatorOutputElements
	) { }

	public handleFullStepDraw(step: FullStepResult): void {
		this.codeStep_preFull(step.codeStepResult);

		this.output.stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, step.text);

		if (step instanceof StepResultArray) {
			const parent = this.output.renderer;

			this.arrayElementLocations.splice(0, this.arrayElementLocations.length);

			let borderWidth = 2;

			let boxSize = Math.min((parent.clientWidth / step.array.length) - borderWidth, parent.clientHeight - borderWidth);
			let y = (parent.clientHeight - boxSize) / 2;
			let leftOffset = (parent.clientWidth - step.array.length * boxSize) / 2;

			let resultBuilder = new Array<string>();

			for (let i = 0; i < step.array.length; i++) {
				const rectX = leftOffset + i * boxSize;
				
				this.arrayElementLocations.push(new Rectangle(rectX, y, boxSize, boxSize));

				resultBuilder.push(`<rect x="${rectX}" y="${y}" width="${boxSize}" height="${boxSize}" stroke="black" stroke-width="${borderWidth}px" fill="${this.colorSet.get(step.highlights != null ? step.highlights.get(i) : undefined)}" />`);
				resultBuilder.push(`<text x="${leftOffset + (i + 0.5) * boxSize}" y="${y + (boxSize / 2)}" color="black" alignment-baseline="central" text-anchor="middle">${step.array[i].value}</text>`)
			}

			parent.innerHTML = resultBuilder.join("\n");
		}
		else
			throw new Error("Renderer not written for this step result.");

		this.codeStep_postFull(step.codeStepResult);
	}

	public handleFullStepRedraw(step: FullStepResult): void {
		this.handleFullStepDraw(step);
	}

	public handleCodeStepDraw(step: CodeStepResult): void {
		this.codeStep_preFull(step);
		this.codeStep_postFull(step);
	}

	public handleCodeStepRedraw(step: CodeStepResult): void {
		this.codeStep_drawVariables(step);
	}

	protected codeStep_preFull(step: CodeStepResult): void {
		this.output.stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, step.text);

		this.codeStep_handleVariableWatchUpdate(step);
		this.codeStep_handleDebuggerHighlights(step);
	}

	protected codeStep_postFull(step: CodeStepResult): void {
		this.codeStep_drawVariables(step);
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
		const variableClass = "variable";
		const textSize = 16;
		const margin = textSize / 2;

		variableRenderer.querySelectorAll(`.${variableClass}`).forEach(child => variableRenderer.removeChild(child));

		step.variables.filter(variable => variable.draw).forEach(variable => {
			const elementLocation = this.arrayElementLocations[variable.value];

			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.textContent = variable.name;
			text.classList.add(variableClass);
			text.setAttribute("x", (elementLocation.x + (elementLocation.width / 2)).toString());
			text.setAttribute("y", (elementLocation.y - margin).toString());
			text.setAttribute("font-size", `${textSize}px`);
			text.setAttribute("text-anchor", "middle");
			text.setAttribute("alignment-baseline", "bottom");

			variableRenderer.appendChild(text);
		});
	}
}