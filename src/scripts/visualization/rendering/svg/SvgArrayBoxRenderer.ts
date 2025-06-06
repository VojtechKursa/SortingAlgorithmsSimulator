import { StepResultArray } from "../../../data/stepResults/StepResultArray";
import { ColorMap } from "../../colors/ColorMap";
import { RendererClasses } from "../../css/RendererClasses";
import { SymbolicColor } from "../../colors/SymbolicColor";
import { VariableDrawInformation } from "../../../data/Variable";
import { AlignmentData, AlignmentType, SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { StepResult } from "../../../data/stepResults/StepResult";
import { Point2D } from "../../../data/graphical/Point2D";
import { FontProperties } from "./utils/FontProperties";
import { getOneVariableVerticalSpace, VariableRenderSettings } from "./utils/VariableRendering";

class ArrayRenderSettings {
	public constructor(
		public readonly boxSize: number = 10,
		public readonly horizontalMargin: number = 10,
		public readonly borderWidth: number = 0.5,
		public readonly fontMain: FontProperties = new FontProperties(4, 0.5),
		public readonly fontIndex: FontProperties = new FontProperties(2.5, 0.5),
		public readonly indexRightMargin: number = 1,
		public readonly indexBottomMargin: number = 1
	) { }
}

export class SvgArrayBoxRenderer implements SvgRenderer {
	public readonly arraySettings = new ArrayRenderSettings();
	public readonly variableSettings = new VariableRenderSettings(this.arraySettings.boxSize * 0.8);

	public readonly oneVariableVerticalSpace = getOneVariableVerticalSpace(this.variableSettings);

	private _currentArrayLength: number | undefined;
	public get currentArrayLength(): number | undefined {
		return this._currentArrayLength;
	}
	protected set currentArrayLength(value: number) {
		this._currentArrayLength = value;
	}

	private readonly defaultMinYNoVariables = -this.arraySettings.borderWidth / 2;
	private get defaultMinY(): number {
		return this.defaultMinYNoVariables - this.minimumViewBoxTopMargin;
	}

	private minY: number;

	private lastRenderedStep: StepResultArray | undefined;
	private readonly resultMemory: SvgRenderResult;

	private _colorMap: ColorMap;
	public get colorMap(): ColorMap {
		return this._colorMap;
	}
	public set colorMap(value: ColorMap) {
		this._colorMap = value;

		if (this.lastRenderedStep != undefined) {
			const lastRenderedStep = this.lastRenderedStep;
			this.lastRenderedStep = undefined;
			this.render(lastRenderedStep);
		}
	}

	public get displayName(): string {
		return "Array";
	}

	public get machineName(): string {
		return "renderer-array";
	}

	public get minimumViewBoxTopMargin(): number {
		return this.reservedVariablesSpace * this.oneVariableVerticalSpace;
	}



	public constructor(
		colorMap: ColorMap,
		public reservedVariablesSpace: number = 0,
		public reserveVariablesSpaceWithNoVariables: boolean = false,
		public drawFinalVariables: boolean = false,
		public drawLastStackLevelVariables: boolean = false,
	) {
		this._colorMap = colorMap;
		this.minY = this.defaultMinY;

		this.resultMemory = new SvgRenderResult(
			document.createElementNS("http://www.w3.org/2000/svg", "svg"),
			new AlignmentData(AlignmentType.FromBottom, (this.arraySettings.boxSize + this.arraySettings.borderWidth) / 2, false)
		);
	}



	public render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultArray))
			throw new UnsupportedStepResultError(["StepResultArray"]);

		if (this.lastRenderedStep != undefined) {
			if (step.array != this.lastRenderedStep.array || step.arrayHighlights != this.lastRenderedStep.arrayHighlights) {
				this.drawArray(step);
			}
		} else {
			this.drawArray(step);
		}

		this.drawVariables(step);

		this.adjustViewBox();

		this.lastRenderedStep = step;

		return Promise.resolve(this.resultMemory.clone());
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}



	private drawArray(step: StepResultArray): void {
		const output = this.resultMemory.svg;

		output.querySelectorAll(`.${RendererClasses.elementWrapperClass}`).forEach(element => element.remove());

		this.currentArrayLength = step.array.length;

		for (let i = 0; i < step.array.length; i++) {
			const item = step.array[i];

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.classList.add(RendererClasses.elementWrapperClass);
			if (!item.duplicated) {
				group.id = `elem_${item.id}`;
			}
			else if (item.duplicateIdentifier != null) {
				group.id = `elem_${item.id}-duplicate-${item.duplicateIdentifier}`;
			}

			const rectX = i * this.arraySettings.boxSize;
			const rectY = 0;

			const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect.setAttribute("x", rectX.toString());
			rect.setAttribute("y", rectY.toString());
			rect.setAttribute("height", this.arraySettings.boxSize.toString());
			rect.setAttribute("width", this.arraySettings.boxSize.toString());
			rect.setAttribute("stroke", this.colorMap.get(SymbolicColor.Element_Border).toString());
			rect.setAttribute("stroke-width", this.arraySettings.borderWidth.toString());
			rect.setAttribute("fill", this.colorMap.get(step.arrayHighlights != null ? step.arrayHighlights.get(i) : SymbolicColor.Element_Background).toString());
			rect.classList.add(RendererClasses.elementBoxClass);
			if (group.id != "") {
				rect.id = `${group.id}_rect`;
			}

			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			text.setAttribute("x", (rectX + (this.arraySettings.boxSize / 2)).toString());
			text.setAttribute("y", (rectY + (this.arraySettings.boxSize / 2)).toString());
			text.setAttribute("font-size", this.arraySettings.fontMain.fontSize.toString());
			text.setAttribute("stroke-width", this.arraySettings.fontMain.strokeWidth.toString());
			text.setAttribute("color", this.colorMap.get(SymbolicColor.Element_Foreground).toString());
			text.setAttribute("dominant-baseline", "central");
			text.setAttribute("text-anchor", "middle");
			text.textContent = item.value.toString();
			text.classList.add(RendererClasses.elementValueClass);
			if (group.id != "") {
				text.id = `${group.id}_text`;
			}

			group.appendChild(rect);
			group.appendChild(text);

			if (item.index != null) {
				const index = document.createElementNS("http://www.w3.org/2000/svg", "text");
				index.setAttribute("x", (rectX + this.arraySettings.boxSize - this.arraySettings.indexRightMargin).toString());
				index.setAttribute("y", (rectY + this.arraySettings.boxSize - this.arraySettings.indexBottomMargin).toString());
				index.setAttribute("font-size", this.arraySettings.fontIndex.fontSize.toString());
				index.setAttribute("stroke-width", this.arraySettings.fontIndex.strokeWidth.toString());
				index.setAttribute("color", this.colorMap.get(SymbolicColor.Element_Foreground).toString());
				index.setAttribute("dominant-baseline", "text-bottom");
				index.setAttribute("text-anchor", "end");
				index.textContent = item.index.toString();
				index.classList.add(RendererClasses.elementIndexClass);
				if (group.id != "") {
					index.id = `${group.id}_index`;
				}

				group.appendChild(index);
			}

			output.appendChild(group);
		}
	}

	private drawVariables(step: StepResult): void {
		if (this.resultMemory == undefined)
			throw new Error("Attempted to render code step before first full step.");

		const output = this.resultMemory.svg;

		output.querySelectorAll(`.${RendererClasses.variableWrapperClass}`).forEach(element => element.remove());

		if (step.final && !this.drawFinalVariables) {
			this.minY = this.defaultMinYNoVariables;
			return;
		}

		if (this.currentArrayLength == undefined)
			throw new Error("Attempted to draw variables without drawing an array first");

		const variablesAboveElements = new Array<number>(this.currentArrayLength);
		if (step.variables.length > 0 || this.reserveVariablesSpaceWithNoVariables) {
			this.minY = this.defaultMinY;
		} else {
			this.minY = this.defaultMinYNoVariables;
		}

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

		const chevronTop = -(variableIndex * this.oneVariableVerticalSpace) - this.variableSettings.chevronMargin - this.variableSettings.chevronHeight;
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
		chevron.setAttribute("stroke", this.colorMap.get(SymbolicColor.Simulator_Border).toString());
		chevron.setAttribute("stroke-width", this.variableSettings.chevronStrokeWidth.toString());

		const color = this.colorMap.get(variable.color).clone();
		color.alpha *= alphaFactor;
		chevron.setAttribute("fill", color.toString());

		const chevronBorderTop = chevronTop - (this.variableSettings.chevronStrokeWidth / 2);

		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.id = `${group.id}_text`;
		text.textContent = variable.variableName;
		text.classList.add(RendererClasses.variableTextClass);
		text.setAttribute("x", chevronCenterX.toString());
		text.setAttribute("y", (chevronBorderTop - this.variableSettings.textMarginBottom).toString());
		text.setAttribute("font-size", this.variableSettings.textFont.fontSize.toString());
		text.setAttribute("stroke-width", this.variableSettings.textFont.strokeWidth.toString());
		text.setAttribute("fill", this.colorMap.get(SymbolicColor.Simulator_Foreground).toString());
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