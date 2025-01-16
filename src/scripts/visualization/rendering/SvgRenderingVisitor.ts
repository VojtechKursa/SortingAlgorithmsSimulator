import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { StepResultArray } from "../../data/stepResults/StepResultArray";
import { ColorSet } from "../colors/ColorSet";
import { RendererClasses } from "../CssInterface";
import { SymbolicColor } from "../colors/SymbolicColor";
import { VariableDrawInformation } from "../../data/Variable";
import { StepDisplayVisitorWithColor } from "./StepDisplayVisitorWithColor";

class Rectangle {
	public constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly height: number,
		public readonly width: number
	) { }
}

class Point2D {
	public constructor(
		public readonly x: number,
		public readonly y: number
	) { }

	public toString(): string {
		return `${this.x},${this.y}`;
	}
}

export class SvgRenderingVisitor extends StepDisplayVisitorWithColor {
	private readonly arrayElementLocations = new Array<Rectangle>();
	private boxSize = 0;

	public constructor(
		colorSet: ColorSet,
		public readonly output: SVGSVGElement,
		public drawFinalVariables: boolean = false,
		public drawLastStackLevelVariables: boolean = false,
		next: SvgRenderingVisitor | null = null
	) {
		super(colorSet, next);
	}

	protected override displayFullStepInternal(step: FullStepResult): void {
		if (step instanceof StepResultArray) {
			this.drawArray(step);
		}
		else
			throw new Error("Step result type not supported by this visitor.");
	}

	protected override displayCodeStepInternal(step: CodeStepResult): void {
		this.drawVariables(step);
	}

	private drawArray(step: StepResultArray) {
		const parent = this.output;

		parent.querySelectorAll(`.${RendererClasses.elementClass},.${RendererClasses.elementValueClass},.${RendererClasses.elementIndexClass}`)
			.forEach(element => element.remove());

		this.arrayElementLocations.splice(0, this.arrayElementLocations.length);

		let borderWidth = 2;

		let boxSize = Math.min((parent.clientWidth / step.array.length) - borderWidth, parent.clientHeight - borderWidth);
		this.boxSize = boxSize;
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
			rect.setAttribute("stroke", this.colorSet.get(SymbolicColor.Element_Border).toString());
			rect.setAttribute("stroke-width", `${borderWidth}px`);
			rect.setAttribute("fill", this.colorSet.get(step.highlights != null ? step.highlights.get(i) : SymbolicColor.Element_Background).toString());
			rect.classList.add(RendererClasses.elementClass);

			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute("x", (leftOffset + (i + 0.5) * boxSize).toString());
			text.setAttribute("y", (y + (boxSize / 2)).toString());
			text.setAttribute("color", this.colorSet.get(SymbolicColor.Element_Foreground).toString());
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
				index.setAttribute("color", this.colorSet.get(SymbolicColor.Element_Foreground).toString());
				index.setAttribute("dominant-baseline", "text-bottom");
				index.setAttribute("text-anchor", "end");
				index.textContent = item.index.toString();
				index.classList.add(RendererClasses.elementIndexClass);

				parent.appendChild(index);
			}
		}
	}

	private drawVariables(step: CodeStepResult) {
		const variableRenderer = this.output;

		variableRenderer.querySelectorAll(`.${RendererClasses.variableWrapperClass}`).forEach(child => variableRenderer.removeChild(child));

		// temp
		variableRenderer.querySelectorAll(`.${RendererClasses.variableTextClass}`).forEach(child => variableRenderer.removeChild(child));
		variableRenderer.querySelectorAll(`.${RendererClasses.variablePointerClass}`).forEach(child => variableRenderer.removeChild(child));

		const variablesAboveElements = new Array<number>(this.arrayElementLocations.length);

		step.variables.forEach(variable => {
			const drawInformation = variable.getDrawInformation();
			if (drawInformation != null)
				this.drawVariable(drawInformation, variablesAboveElements, variableRenderer, 1);
		});

		if (this.drawLastStackLevelVariables && step.callStack != undefined) {
			const lastCallLevel = step.callStack.top();

			if (lastCallLevel != undefined) {
				lastCallLevel.variables.forEach(variable => {
					const drawInformation = variable.getDrawInformation();
					if (drawInformation != null)
						this.drawVariable(drawInformation, variablesAboveElements, variableRenderer, 0.5);
				});
			}
		}
	}

	private drawVariable(variable: VariableDrawInformation, variablesAboveElements: number[], output: SVGSVGElement, alphaFactor: number = 1) {
		if (variable.drawAtIndex == null || variable.drawAtIndex < 0 || variable.drawAtIndex >= this.arrayElementLocations.length)
			return;

		const textSize = 16;
		const chevronMargin = textSize / 2;
		const textMargin = chevronMargin / 2;

		const chevronWidth = this.boxSize;
		const chevronHeight = this.boxSize / 2;

		const elementLocation = this.arrayElementLocations[variable.drawAtIndex];
		const variableOrder = variablesAboveElements[variable.drawAtIndex] ?? 0;

		const chevronTop = elementLocation.y - chevronMargin - chevronHeight - (variableOrder * (chevronMargin + chevronHeight + (textMargin * 2) + textSize));

		const points = new Array<Point2D>();
		points.push(new Point2D(elementLocation.x, chevronTop));
		points.push(new Point2D(elementLocation.x + chevronWidth, chevronTop));
		points.push(new Point2D(elementLocation.x + (chevronWidth / 2), chevronTop + chevronHeight));

		const chevron = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		chevron.classList.add(RendererClasses.variablePointerClass);
		chevron.setAttribute("points", points.map(point => point.toString()).join(" "));
		chevron.setAttribute("stroke", "black");
		chevron.setAttribute("stroke-width", "1");

		const color = this.colorSet.get(variable.color).clone();
		color.alpha *= alphaFactor;
		chevron.setAttribute("fill", color.toString());

		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.textContent = variable.variableName;
		text.classList.add(RendererClasses.variableTextClass);
		text.setAttribute("x", (elementLocation.x + (elementLocation.width / 2)).toString());
		text.setAttribute("y", (chevronTop - textMargin).toString());
		text.setAttribute("font-size", `${textSize}px`);
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("alignment-baseline", "bottom");
		text.setAttribute("color", this.colorSet.get(SymbolicColor.Simulator_Foreground).toString());

		output.appendChild(chevron);
		output.appendChild(text);

		variablesAboveElements[variable.drawAtIndex] = variableOrder + 1;
	}
}