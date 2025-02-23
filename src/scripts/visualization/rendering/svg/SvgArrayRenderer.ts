import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { StepResultArray } from "../../../data/stepResults/StepResultArray";
import { ColorSet } from "../../colors/ColorSet";
import { RendererClasses } from "../../CssInterface";
import { SymbolicColor } from "../../colors/SymbolicColor";
import { VariableDrawInformation } from "../../../data/Variable";
import { AlignmentData, AlignmentType, SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { UnsupportedStepResult } from "../../../errors/UnsupportedStepResult";
import { StepResult } from "../../../data/stepResults/StepResult";

class Point2D {
	public constructor(
		public readonly x: number,
		public readonly y: number
	) { }

	public toString(): string {
		return `${this.x},${this.y}`;
	}
}

class FontProperties {
	public constructor(
		public readonly fontSize: number,
		public readonly strokeWidth: number
	) { }
}

class ArrayRenderSettings {
	public constructor(
		public readonly boxSize: number = 10,
		public readonly horizontalMargin: number = 10,
		public readonly verticalMargin: number = 10,
		public readonly borderWidth: number = 0.5,
		public readonly fontMain: FontProperties = new FontProperties(4, 0.5),
		public readonly fontIndex: FontProperties = new FontProperties(2.5, 0.5),
		public readonly indexRightMargin: number = 1,
		public readonly indexBottomMargin: number = 1
	) { }
}

class VariableRenderSettings {
	public constructor(
		public readonly chevronWidth: number,
		public readonly chevronHeight: number = chevronWidth / 2,
		public readonly chevronMargin: number = chevronHeight / 2,
		public readonly chevronStrokeWidth: number = 0.5,
		public readonly textFont: FontProperties = new FontProperties(2.5, 0.1),
		public readonly textMarginBottom: number = 1,
		public readonly textMarginTop: number = 0
	) { }
}

export class SvgArrayRenderer implements SvgRenderer {
	private readonly arraySettings = new ArrayRenderSettings();
	private readonly variableSettings = new VariableRenderSettings(this.arraySettings.boxSize * 0.8);

	private readonly oneVariableSpace = (
		this.variableSettings.chevronMargin +
		this.variableSettings.chevronHeight +
		this.variableSettings.textMarginBottom +
		this.variableSettings.textFont.fontSize +
		this.variableSettings.textMarginTop
	);

	private currentArrayLength: number | undefined;

	private readonly defaultMinY = -this.arraySettings.borderWidth / 2;
	private minY = this.defaultMinY;

	private readonly resultMemory: SvgRenderResult;

	private _colorSet: ColorSet;
	public get colorSet(): ColorSet {
		return this._colorSet;
	}
	public set colorSet(value: ColorSet) {
		this._colorSet = value;
	}



	public constructor(
		colorSet: ColorSet,
		public drawFinalVariables: boolean = false,
		public drawLastStackLevelVariables: boolean = false,
	) {
		this._colorSet = colorSet;

		this.resultMemory = new SvgRenderResult(
			document.createElementNS("http://www.w3.org/2000/svg", "svg"),
			new AlignmentData(AlignmentType.FromBottom, (this.arraySettings.boxSize + this.arraySettings.borderWidth) / 2, false)
		);
	}



	public render(fullStep?: FullStepResult, codeStep?: CodeStepResult): SvgRenderResult {
		let full: StepResultArray | undefined = undefined;
		let code: CodeStepResult | undefined = undefined;

		if (fullStep != undefined) {
			if (!(fullStep instanceof StepResultArray)) {
				throw new UnsupportedStepResult(["StepResultArray"]);
			}

			full = fullStep;
			code = fullStep.codeStepResult;
		}

		if (codeStep != undefined) {
			code = codeStep;
		}

		if (full != undefined) {
			this.drawArray(full);
		}

		if (code != undefined) {
			this.drawVariables(code);
		}

		if (full != undefined || code != undefined) {
			this.adjustViewBox();
		}

		return this.resultMemory.clone();
	}

	public redraw(): SvgRenderResult | null {
		return null;
	}



	private drawArray(step: StepResultArray): void {
		const output = this.resultMemory.svg;

		output.querySelectorAll(`.${RendererClasses.elementWrapperClass}`).forEach(element => element.remove());

		this.currentArrayLength = step.array.length;

		for (let i = 0; i < step.array.length; i++) {
			const item = step.array[i];

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.classList.add(RendererClasses.elementWrapperClass);
			group.id = `elem_${item.id}`;

			const rectX = i * this.arraySettings.boxSize;
			const rectY = 0;

			const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect.id = `${group.id}_rect`;
			rect.setAttribute("x", rectX.toString());
			rect.setAttribute("y", rectY.toString());
			rect.setAttribute("height", this.arraySettings.boxSize.toString());
			rect.setAttribute("width", this.arraySettings.boxSize.toString());
			rect.setAttribute("stroke", this.colorSet.get(SymbolicColor.Element_Border).toString());
			rect.setAttribute("stroke-width", `${this.arraySettings.borderWidth}px`);
			rect.setAttribute("fill", this.colorSet.get(step.highlights != null ? step.highlights.get(i) : SymbolicColor.Element_Background).toString());
			rect.classList.add(RendererClasses.elementBoxClass);

			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.id = `${group.id}_text`;
			text.setAttribute("x", (rectX + (this.arraySettings.boxSize / 2)).toString());
			text.setAttribute("y", (rectY + (this.arraySettings.boxSize / 2)).toString());
			text.setAttribute("font-size", `${this.arraySettings.fontMain.fontSize}px`);
			text.setAttribute("stroke-width", `${this.arraySettings.fontMain.strokeWidth}px`);
			text.setAttribute("color", this.colorSet.get(SymbolicColor.Element_Foreground).toString());
			text.setAttribute("dominant-baseline", "central");
			text.setAttribute("text-anchor", "middle");
			text.textContent = item.value.toString();
			text.classList.add(RendererClasses.elementValueClass);

			group.appendChild(rect);
			group.appendChild(text);

			if (item.index != null) {
				const index = document.createElementNS("http://www.w3.org/2000/svg", "text");
				index.id = `${group.id}_index`;
				index.setAttribute("x", (rectX + this.arraySettings.boxSize - this.arraySettings.indexRightMargin).toString());
				index.setAttribute("y", (rectY + this.arraySettings.boxSize - this.arraySettings.indexBottomMargin).toString());
				index.setAttribute("font-size", `${this.arraySettings.fontIndex.fontSize}px`);
				index.setAttribute("stroke-width", `${this.arraySettings.fontIndex.strokeWidth}px`);
				index.setAttribute("color", this.colorSet.get(SymbolicColor.Element_Foreground).toString());
				index.setAttribute("dominant-baseline", "text-bottom");
				index.setAttribute("text-anchor", "end");
				index.textContent = item.index.toString();
				index.classList.add(RendererClasses.elementIndexClass);

				group.appendChild(index);
			}

			output.appendChild(group);
		}
	}

	private drawVariables(step: CodeStepResult): void {
		if (this.resultMemory == undefined)
			throw new Error("Attempted to render code step before first full step.");

		const output = this.resultMemory.svg;

		output.querySelectorAll(`.${RendererClasses.variableWrapperClass}`).forEach(element => element.remove());

		if (this.currentArrayLength == undefined)
			throw new Error("Attempted to draw variables without drawing an array first");

		const variablesAboveElements = new Array<number>(this.currentArrayLength);
		this.minY = this.defaultMinY;

		step.variables.forEach(variable => {
			const drawInformation = variable.getDrawInformation();

			if (drawInformation != null) {
				const variableMinY = this.drawVariable(drawInformation, variablesAboveElements, output, 1);

				if (variableMinY != null && variableMinY < this.minY) {
					this.minY = variableMinY;
				}
			}
		});

		if (this.drawLastStackLevelVariables && step.callStack != undefined) {
			const lastCallLevel = step.callStack.secondToTop();

			if (lastCallLevel != undefined) {
				lastCallLevel.variables.forEach(variable => {
					const drawInformation = variable.getDrawInformation();

					if (drawInformation != null) {
						const variableMinY = this.drawVariable(drawInformation, variablesAboveElements, output, 0.5);

						if (variableMinY != null && variableMinY < this.minY) {
							this.minY = variableMinY;
						}
					}
				});
			}
		}
	}

	private drawVariable(variable: VariableDrawInformation, variablesAboveElements: number[], output: SVGSVGElement, alphaFactor: number = 1): number | null {
		if (this.currentArrayLength == undefined)
			throw new Error("Attempted to draw variable without drawing an array first");

		if (variable.drawAtIndex == null || variable.drawAtIndex < -1 || variable.drawAtIndex > this.currentArrayLength)
			return null;

		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
		group.id = `variable_${variable.variableName}`;
		group.classList.add(RendererClasses.variableWrapperClass);

		const variableIndex = variablesAboveElements[variable.drawAtIndex] ?? 0;

		const chevronTop = -(variableIndex * this.oneVariableSpace) - this.variableSettings.chevronMargin - this.variableSettings.chevronHeight;
		const chevronCenterX = (variable.drawAtIndex + 0.5) * this.arraySettings.boxSize;
		const chevronX1 = chevronCenterX - (this.variableSettings.chevronWidth / 2);
		const chevronX2 = chevronCenterX + (this.variableSettings.chevronWidth / 2);

		const points = new Array<Point2D>();
		points.push(new Point2D(chevronX1, chevronTop));
		points.push(new Point2D(chevronX2, chevronTop));
		points.push(new Point2D(chevronCenterX, chevronTop + this.variableSettings.chevronHeight));

		const chevron = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		chevron.id = `${group.id}_chevron`;
		chevron.classList.add(RendererClasses.variablePointerClass);
		chevron.setAttribute("points", points.map(point => point.toString()).join(" "));
		chevron.setAttribute("stroke", this.colorSet.get(SymbolicColor.Simulator_Border).toString());
		chevron.setAttribute("stroke-width", this.variableSettings.chevronStrokeWidth.toString());

		const color = this.colorSet.get(variable.color).clone();
		color.alpha *= alphaFactor;
		chevron.setAttribute("fill", color.toString());

		const chevronBorderTop = chevronTop - (this.variableSettings.chevronStrokeWidth / 2);

		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.id = `${group.id}_text`;
		text.textContent = variable.variableName;
		text.classList.add(RendererClasses.variableTextClass);
		text.setAttribute("x", chevronCenterX.toString());
		text.setAttribute("y", (chevronBorderTop - this.variableSettings.textMarginBottom).toString());
		text.setAttribute("font-size", `${this.variableSettings.textFont.fontSize}px`);
		text.setAttribute("stroke-width", `${this.variableSettings.textFont.strokeWidth}px`);
		text.setAttribute("fill", this.colorSet.get(SymbolicColor.Simulator_Foreground).toString());
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("dominant-baseline", "text-bottom");

		group.appendChild(chevron);
		group.appendChild(text);

		output.appendChild(group);

		variablesAboveElements[variable.drawAtIndex] = variableIndex + 1;

		return chevronBorderTop - this.variableSettings.textMarginBottom - this.variableSettings.textFont.fontSize - this.variableSettings.textMarginTop;
	}

	private adjustViewBox(): boolean {
		if (this.resultMemory == undefined)
			throw new Error("Adjust view box attempted on non-existing SVG element");

		if (this.currentArrayLength == undefined)
			return false;

		const startX = -this.arraySettings.horizontalMargin;
		const endX = (this.currentArrayLength * this.arraySettings.boxSize) + this.arraySettings.horizontalMargin;

		const startY = this.minY;
		const endY = this.arraySettings.boxSize + (this.arraySettings.borderWidth / 2);

		const width = endX - startX;
		const height = endY - startY;

		this.resultMemory.svg.setAttribute("viewBox", `${startX} ${startY} ${width} ${height}`);
		return true;
	}
}