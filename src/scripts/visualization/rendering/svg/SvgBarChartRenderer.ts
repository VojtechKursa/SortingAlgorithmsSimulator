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

class BarChartRenderSettings {
	public readonly barHeightScale = this.chartHeight - this.minimumBarHeight;
	public readonly mainFontHeight = this.fontMain.fontSize * FontProperties.fontSizeCorrectionMultiplier;

	public constructor(
		public readonly barWidth: number = 10,
		public readonly minimumBarHeight: number = 10,
		public readonly chartHeight: number = 100,
		public readonly horizontalMargin: number = 10,
		public readonly borderWidth: number = 0.5,
		public readonly fontMain: FontProperties = new FontProperties(4, 0.5),
		public readonly fontIndex: FontProperties = new FontProperties(2.5, 0.5),
		public readonly textTopMargin: number = 5,
		public readonly textBottomMargin: number = 2,
		public readonly indexHorizontalMargin: number = 1,
		public readonly indexTopMargin: number = 2.8,
		public readonly indexBottomMargin: number = 1,
		public readonly mainTextMinimumSeparation: number = 1,
	) { }
}

export class SvgArrayBarChartRenderer implements SvgRenderer {
	public readonly renderSettings = new BarChartRenderSettings();
	public readonly variableSettings = new VariableRenderSettings(this.renderSettings.barWidth * 0.8, undefined, undefined, undefined, undefined, 0, 2.5);

	public readonly oneVariableVerticalSpace = getOneVariableVerticalSpace(this.variableSettings);

	private _currentArrayLength: number | undefined;
	public get currentArrayLength(): number | undefined {
		return this._currentArrayLength;
	}
	protected set currentArrayLength(value: number) {
		this._currentArrayLength = value;
	}

	private lastRenderedStep: StepResultArray | undefined;
	private readonly resultMemory: SvgRenderResult;

	private readonly defaultMaxY = this.renderSettings.chartHeight + this.renderSettings.borderWidth;
	private maxY = this.defaultMaxY;

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
		return "Bar chart";
	}

	public get machineName(): string {
		return "renderer-bar_chart";
	}



	public constructor(
		colorMap: ColorMap,
		public drawFinalVariables: boolean = false,
		public drawLastStackLevelVariables: boolean = false,
	) {
		this._colorMap = colorMap;

		this.resultMemory = new SvgRenderResult(
			document.createElementNS("http://www.w3.org/2000/svg", "svg"),
			new AlignmentData(AlignmentType.FromTop, this.renderSettings.chartHeight / 2, false)
		);
	}



	public render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultArray))
			throw new UnsupportedStepResultError(["StepResultArray"]);

		if (
			this.lastRenderedStep == undefined ||
			step.array != this.lastRenderedStep.array ||
			step.arrayHighlights != this.lastRenderedStep.arrayHighlights
		) {
			this.drawChart(step);
		}

		this.drawVariables(step);

		this.adjustViewBox();

		this.lastRenderedStep = step;

		return Promise.resolve(this.resultMemory.clone());
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}



	private getBarTop(scale: number): number {
		return this.renderSettings.barHeightScale * (1 - scale);
	}

	private drawChart(step: StepResultArray): void {
		const output = this.resultMemory.svg;

		output.querySelectorAll(`.${RendererClasses.elementWrapperClass}`).forEach(element => element.remove());

		if (step.array.length <= 0)
			return;

		let arrayMin = step.array[0].value;
		let arrayMax = step.array[0].value;
		for (const element of step.array) {
			if (element.value < arrayMin)
				arrayMin = element.value;
			if (element.value > arrayMax)
				arrayMax = element.value;
		}
		let shiftBy = arrayMin < 0 ? -arrayMin : 0;
		if (shiftBy > 0) {
			arrayMin += shiftBy;
			arrayMax += shiftBy;
		}
		const range = arrayMax - arrayMin;
		const barScales = step.array.map(val => (val.value + shiftBy - arrayMin) / range);

		this.currentArrayLength = step.array.length;

		for (let i = 0; i < step.array.length; i++) {
			const item = step.array[i];
			const scale = barScales[i];

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			group.classList.add(RendererClasses.elementWrapperClass);
			if (!item.duplicated) {
				group.id = `elem_${item.id}`;
			}

			const rectX = i * this.renderSettings.barWidth;
			const rectY = this.getBarTop(scale);

			const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect.setAttribute("x", rectX.toString());
			rect.setAttribute("y", rectY.toString());
			rect.setAttribute("height", (this.renderSettings.chartHeight - rectY).toString());
			rect.setAttribute("width", this.renderSettings.barWidth.toString());
			rect.setAttribute("stroke", this.colorMap.get(SymbolicColor.Element_Border).toString());
			rect.setAttribute("stroke-width", `${this.renderSettings.borderWidth}px`);
			rect.setAttribute("fill", this.colorMap.get(step.arrayHighlights != null ? step.arrayHighlights.get(i) : SymbolicColor.Element_Background).toString());
			rect.classList.add(RendererClasses.elementBoxClass);
			if (group.id != "") {
				rect.id = `${group.id}_rect`;
			}
			group.appendChild(rect);

			const textBottomY = this.renderSettings.chartHeight - this.renderSettings.textBottomMargin;
			const textTopY = rectY + this.renderSettings.textTopMargin;
			const drawTop = (textTopY + this.renderSettings.mainTextMinimumSeparation) < (textBottomY - this.renderSettings.mainFontHeight);

			const textBottom = document.createElementNS("http://www.w3.org/2000/svg", "text");
			textBottom.setAttribute("x", (rectX + (this.renderSettings.barWidth / 2)).toString());
			textBottom.setAttribute("y", textBottomY.toString());
			textBottom.setAttribute("font-size", `${this.renderSettings.fontMain.fontSize}px`);
			textBottom.setAttribute("stroke-width", `${this.renderSettings.fontMain.strokeWidth}px`);
			textBottom.setAttribute("color", this.colorMap.get(SymbolicColor.Element_Foreground).toString());
			textBottom.setAttribute("dominant-baseline", "text-bottom");
			textBottom.setAttribute("text-anchor", "middle");
			textBottom.textContent = item.value.toString();
			textBottom.classList.add(RendererClasses.elementValueClass);
			if (group.id != "") {
				textBottom.id = `${group.id}_text-bottom`;
			}
			group.appendChild(textBottom);


			if (drawTop) {
				const textTop = textBottom.cloneNode(true) as SVGTextElement;
				textTop.setAttribute("y", textTopY.toString());
				textTop.setAttribute("dominant-baseline", "text-top");
				if (group.id != "") {
					textTop.id = `${group.id}_text-top`;
				}
				group.appendChild(textTop);
			}

			if (item.index != null) {
				const indexBottom = document.createElementNS("http://www.w3.org/2000/svg", "text");
				indexBottom.setAttribute("x", (rectX + this.renderSettings.barWidth - this.renderSettings.indexHorizontalMargin).toString());
				indexBottom.setAttribute("y", (this.renderSettings.chartHeight - this.renderSettings.indexBottomMargin).toString());
				indexBottom.setAttribute("font-size", `${this.renderSettings.fontIndex.fontSize}px`);
				indexBottom.setAttribute("stroke-width", `${this.renderSettings.fontIndex.strokeWidth}px`);
				indexBottom.setAttribute("color", this.colorMap.get(SymbolicColor.Element_Foreground).toString());
				indexBottom.setAttribute("dominant-baseline", "text-bottom");
				indexBottom.setAttribute("text-anchor", "end");
				indexBottom.textContent = item.index.toString();
				indexBottom.classList.add(RendererClasses.elementIndexClass);
				if (group.id != "") {
					indexBottom.id = `${group.id}_index-bottom`;
				}
				group.appendChild(indexBottom);

				if (drawTop) {
					const indexTop = indexBottom.cloneNode(true) as SVGTextElement;
					indexTop.setAttribute("y", (rectY + this.renderSettings.indexTopMargin).toString());
					indexTop.setAttribute("dominant-baseline", "text-top");
					if (group.id != "") {
						indexTop.id = `${group.id}_index-top`;
					}
					group.appendChild(indexTop);
				}
			}

			output.appendChild(group);
		}
	}

	private drawVariables(step: StepResult): void {
		if (this.resultMemory == undefined)
			throw new Error("Attempted to render code step before first full step.");

		const output = this.resultMemory.svg;

		output.querySelectorAll(`.${RendererClasses.variableWrapperClass}`).forEach(element => element.remove());

		if (step.final && !this.drawFinalVariables)
			return;

		if (this.currentArrayLength == undefined)
			throw new Error("Attempted to draw variables without drawing an array first");

		const variablesAboveElements = new Array<number>(this.currentArrayLength);
		this.maxY = this.defaultMaxY;

		step.variables.forEach(variable => {
			const drawInformation = variable.getDrawInformation();

			if (drawInformation != null) {
				const variableMaxY = this.drawVariable(drawInformation, variablesAboveElements, output, 1);

				if (variableMaxY != null && variableMaxY > this.maxY) {
					this.maxY = variableMaxY;
				}
			}
		});

		if (this.drawLastStackLevelVariables && step.callStack != undefined) {
			const lastCallLevel = step.callStack.secondToTop();

			if (lastCallLevel != undefined) {
				lastCallLevel.variables.forEach(variable => {
					const drawInformation = variable.getDrawInformation();

					if (drawInformation != null) {
						const variableMaxY = this.drawVariable(drawInformation, variablesAboveElements, output, 0.5);

						if (variableMaxY != null && variableMaxY > this.maxY) {
							this.maxY = variableMaxY;
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

		const chevronTop = this.renderSettings.chartHeight + this.variableSettings.chevronMargin + (variableIndex * this.oneVariableVerticalSpace);
		const chevronBottom = chevronTop + this.variableSettings.chevronHeight;
		const chevronCenterX = (variable.drawAtIndex + 0.5) * this.renderSettings.barWidth;
		const chevronX1 = chevronCenterX - (this.variableSettings.chevronWidth / 2);
		const chevronX2 = chevronCenterX + (this.variableSettings.chevronWidth / 2);

		const points = new Array<Point2D>();
		points.push(new Point2D(chevronX1, chevronBottom));
		points.push(new Point2D(chevronX2, chevronBottom));
		points.push(new Point2D(chevronCenterX, chevronTop));

		const chevron = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
		chevron.id = `${group.id}_chevron`;
		chevron.classList.add(RendererClasses.variablePointerClass);
		chevron.setAttribute("points", points.map(point => point.toString()).join(" "));
		chevron.setAttribute("stroke", this.colorMap.get(SymbolicColor.Simulator_Border).toString());
		chevron.setAttribute("stroke-width", this.variableSettings.chevronStrokeWidth.toString());

		const color = this.colorMap.get(variable.color).clone();
		color.alpha *= alphaFactor;
		chevron.setAttribute("fill", color.toString());

		const chevronBorderBottom = chevronBottom + (this.variableSettings.chevronStrokeWidth / 2);

		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.id = `${group.id}_text`;
		text.textContent = variable.variableName;
		text.classList.add(RendererClasses.variableTextClass);
		text.setAttribute("x", chevronCenterX.toString());
		text.setAttribute("y", (chevronBorderBottom + this.variableSettings.textMarginTop).toString());
		text.setAttribute("font-size", `${this.variableSettings.textFont.fontSize}px`);
		text.setAttribute("stroke-width", `${this.variableSettings.textFont.strokeWidth}px`);
		text.setAttribute("fill", this.colorMap.get(SymbolicColor.Simulator_Foreground).toString());
		text.setAttribute("text-anchor", "middle");
		text.setAttribute("dominant-baseline", "text-top");

		group.appendChild(chevron);
		group.appendChild(text);

		output.appendChild(group);

		variablesAboveElements[variable.drawAtIndex] = variableIndex + 1;

		return chevronBorderBottom + this.variableSettings.textMarginTop + this.variableSettings.textFont.fontSize + this.variableSettings.textMarginBottom;
	}

	private adjustViewBox(): boolean {
		if (this.resultMemory == undefined)
			throw new Error("Adjust view box attempted on non-existing SVG element");

		if (this.currentArrayLength == undefined)
			return false;

		const startX = -this.renderSettings.horizontalMargin;
		const endX = (this.currentArrayLength * this.renderSettings.barWidth) + this.renderSettings.horizontalMargin;

		const startY = -this.renderSettings.borderWidth / 2;
		const endY = this.maxY;

		const width = endX - startX;
		const height = endY - startY;

		this.resultMemory.svg.setAttribute("viewBox", `${startX} ${startY} ${width} ${height}`);
		return true;
	}
}