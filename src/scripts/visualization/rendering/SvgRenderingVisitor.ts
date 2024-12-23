import { StepDescriptionKind } from "../../controllers/StepDescriptionController";
import { SimulatorOutputElements } from "../../data/collections/htmlElementCollections/SimulatorOutputElements";
import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { StepResultArray } from "../../data/stepResults/StepResultArray";
import { ColorSet } from "../ColorSet";
import { codeHighlightClass, RendererClasses, VariableWatchClasses } from "../CssInterface";
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
			parent.querySelectorAll(`.${RendererClasses.elementClass},.${RendererClasses.elementValueClass},.${RendererClasses.elementIndexClass}`)
				.forEach(element => element.remove());

			this.arrayElementLocations.splice(0, this.arrayElementLocations.length);

			let borderWidth = 2;

			let boxSize = Math.min((parent.clientWidth / step.array.length) - borderWidth, parent.clientHeight - borderWidth);
			let y = (parent.clientHeight - boxSize) / 2;
			let leftOffset = (parent.clientWidth - step.array.length * boxSize) / 2;

			let boxSizeStr = boxSize.toString();

			for (let i = 0; i < step.array.length; i++) {
				const item = step.array[i];

				const box = new Rectangle(leftOffset + i * boxSize, y, boxSize, boxSize);
				this.arrayElementLocations.push(box);

				const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
				rect.setAttribute("x", box.x.toString());
				rect.setAttribute("y", y.toString());
				rect.setAttribute("height", boxSizeStr);
				rect.setAttribute("width", boxSizeStr);
				rect.setAttribute("stroke", "black");
				rect.setAttribute("stroke-width", `${borderWidth}px`);
				rect.setAttribute("fill", this.colorSet.get(step.highlights != null ? step.highlights.get(i) : undefined));
				rect.classList.add(RendererClasses.elementClass);

				const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
				text.setAttribute("x", (leftOffset + (i + 0.5) * boxSize).toString());
				text.setAttribute("y", (y + (boxSize / 2)).toString());
				text.setAttribute("color", "black");
				text.setAttribute("dominant-baseline", "central");
				text.setAttribute("text-anchor", "middle");
				text.textContent = item.value.toString();
				text.classList.add(RendererClasses.elementValueClass);

				parent.appendChild(rect);
				parent.appendChild(text);

				if (item.index != null) {
					const rightMargin = 4;
					const bottomMargin = 4;

					const index = document.createElementNS("http://www.w3.org/2000/svg", "text");
					index.setAttribute("x", (box.x + box.width - rightMargin).toString());
					index.setAttribute("y", (box.y + box.height - bottomMargin).toString());
					index.setAttribute("color", "black");
					index.setAttribute("dominant-baseline", "text-bottom");
					index.setAttribute("text-anchor", "end");
					index.textContent = item.index.toString();
					index.classList.add(RendererClasses.elementIndexClass);

					parent.appendChild(index);
				}
			}
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
		const textSize = 16;
		const margin = textSize / 2;

		variableRenderer.querySelectorAll(`.${RendererClasses.variableClass}`).forEach(child => variableRenderer.removeChild(child));

		step.variables.filter(variable => variable.draw).forEach(variable => {
			const elementLocation = this.arrayElementLocations[variable.value];

			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.textContent = variable.name;
			text.classList.add(RendererClasses.variableClass);
			text.setAttribute("x", (elementLocation.x + (elementLocation.width / 2)).toString());
			text.setAttribute("y", (elementLocation.y - margin).toString());
			text.setAttribute("font-size", `${textSize}px`);
			text.setAttribute("text-anchor", "middle");
			text.setAttribute("alignment-baseline", "bottom");

			variableRenderer.appendChild(text);
		});
	}
}