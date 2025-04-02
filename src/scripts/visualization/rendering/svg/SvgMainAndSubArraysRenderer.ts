import { HasRangeOfValues, supportsRange, SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { FontProperties } from "./utils/FontProperties";
import { Point2D } from "../../../data/graphical/Point2D";
import { AnnotatedSvgRenderResult, CollectRendersResult, MultiArrayHelper, RepositionMode } from "./utils/MultiArrayUtils";
import { ColorMap } from "../../colors/ColorMap";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultMultiArray } from "../../../data/stepResults/StepResultMultiArray";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { SymbolicColor } from "../../colors/SymbolicColor";
import { SvgViewBox } from "../../../data/graphical/SvgViewBox";


class SvgSubRendererLabelSettings {
	public readonly totalLabelHeight: number;

	public constructor(
		public readonly font: FontProperties = new FontProperties(4, 0.5),
		public readonly marginTop: number = 2,
		public readonly marginBottom: number = 2,
	) {
		this.totalLabelHeight = marginTop + (font.fontSize * FontProperties.fontSizeCorrectionMultiplier) + marginBottom;
	}
}

class SvgMainAndSubArraysRendererSettings {
	public constructor(
		public readonly spaceBetweenRenders: number = 10,
		public readonly mainRenderBottomMargin: number = 10,
		public readonly labelSettings: SvgSubRendererLabelSettings = new SvgSubRendererLabelSettings(),
	) { }
}

export const enum OverSizeBehavior {
	Stretch,
	Center,
}

export class SvgMainAndSubArraysRenderer implements SvgRenderer, HasRangeOfValues {
	private readonly renderSettings: SvgMainAndSubArraysRendererSettings = new SvgMainAndSubArraysRendererSettings();

	private readonly _displayName: string;
	public get displayName(): string {
		return this._displayName;
	}

	public get machineName(): string {
		return `renderer-mainAndSub-${this.mainRenderer.machineName}_${this.subRenderer.machineName}`;
	}

	public set colorMap(value: ColorMap) {
		this.mainRenderer.colorMap = value;
		if (this.subRenderer != this.mainRenderer) {
			this.subRenderer.colorMap = value;
		}
	}

	public get colorMap(): ColorMap {
		return this.mainRenderer.colorMap;
	}

	public setRangeOfValues(min: number | undefined, max: number | undefined): void {
		const renderers = [this.mainRenderer];
		if (this.mainRenderer != this.subRenderer) {
			renderers.push(this.subRenderer);
		}

		for (const renderer of renderers) {
			if (supportsRange(renderer)) {
				renderer.setRangeOfValues(min, max);
			}
		}
	}



	public constructor(
		protected readonly mainRenderer: SvgRenderer,
		protected readonly subRenderer: SvgRenderer = mainRenderer,
		public readonly mainArrayBehavior: OverSizeBehavior = OverSizeBehavior.Center,
		displayName: string | undefined = undefined,
	) {
		if (displayName != undefined) {
			this._displayName = displayName;
		}
		else {
			if (mainRenderer == subRenderer) {
				this._displayName = `${this.mainRenderer.displayName}`;
			}
			else {
				this._displayName = `${this.mainRenderer.displayName} & ${this.subRenderer.displayName}`;
			}
		}
	}

	public async render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultMultiArray))
			throw new UnsupportedStepResultError(["StepResultMultiArray"]);

		if (step.arrays.length <= 0) {
			return new SvgRenderResult(document.createElementNS("http://www.w3.org/2000/svg", "svg"), null);
		}

		const firstStep = step.arrays[0];
		const mainRenderAnnotated = new AnnotatedSvgRenderResult(await this.mainRenderer.render(firstStep.step), firstStep.name);

		const subRenders = await MultiArrayHelper.collectRenders(step.arrays.slice(1, step.arrays.length), this.subRenderer, false);

		return this.assembleSvg(mainRenderAnnotated, subRenders);
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}

	protected assembleSvg(mainRender: AnnotatedSvgRenderResult, subRenders: CollectRendersResult): SvgRenderResult {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		let subRendersLabeled: boolean = false;
		let subRendersWidth: number = 0;
		let subRendersCenterLine: number = 0;
		let subRendersMaxHeight: number = 0;

		for (const renderResult of subRenders.renders) {
			const render = renderResult.render;
			const viewBox = render.svg.viewBox.baseVal;

			subRendersWidth += viewBox.width + this.renderSettings.spaceBetweenRenders;
			if (renderResult.label != undefined) {
				subRendersLabeled = true;
			}

			if (viewBox.height > subRendersMaxHeight) {
				subRendersMaxHeight = viewBox.height;
			}

			let localCenterLine: number;

			if (render.alignment == null) {
				localCenterLine = viewBox.height / 2;
			}
			else {
				localCenterLine = render.alignment.getLocalAlignmentLine(viewBox.height);
			}

			if (localCenterLine > subRendersCenterLine) {
				subRendersCenterLine = localCenterLine;
			}
		}

		if (subRendersWidth > 0) {
			subRendersWidth -= this.renderSettings.spaceBetweenRenders;
		}

		const mainRenderBottom = (
			(mainRender.label != undefined ? this.renderSettings.labelSettings.totalLabelHeight : 0) +
			mainRender.render.svg.viewBox.baseVal.height
		);
		const subRendersLabelBase = mainRenderBottom + this.renderSettings.mainRenderBottomMargin;
		const subRendersBase = (
			subRendersLabelBase +
			(subRendersLabeled ? this.renderSettings.labelSettings.totalLabelHeight : 0)
		);
		subRendersCenterLine += subRendersBase;

		const finalWidth = Math.max(subRendersWidth, mainRender.render.svg.viewBox.baseVal.width);
		const mainCenterX = finalWidth / 2;

		svg.appendChild(this.renderMainGroup(mainRender, mainCenterX, finalWidth));

		let baseX: number = 0;
		for (const render of subRenders.renders) {
			svg.appendChild(this.renderSubGroup(render, baseX, subRendersLabelBase, subRendersCenterLine));
			baseX += render.render.svg.viewBox.baseVal.width + this.renderSettings.spaceBetweenRenders;
		}

		const totalHeight = (subRenders.renders.length > 0) ? (subRendersBase + subRendersMaxHeight) : (mainRenderBottom);
		const viewBox = new SvgViewBox();
		viewBox.startX = 0;
		viewBox.startY = 0;
		viewBox.width = finalWidth;
		viewBox.height = totalHeight;

		svg.setAttribute("viewBox", viewBox.toString());

		return new SvgRenderResult(svg, null);
	}

	private renderMainGroup(mainRender: AnnotatedSvgRenderResult, centerX: number, totalWidth: number): SVGGElement {
		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

		const labelPresent = mainRender.label != undefined;
		if (labelPresent) {
			group.appendChild(this.createLabel(centerX, this.renderSettings.labelSettings.marginTop, mainRender.label));
		}

		const viewBox = mainRender.render.svg.viewBox.baseVal;

		const baseY = labelPresent ? this.renderSettings.labelSettings.totalLabelHeight : 0;
		const shift = new Point2D(-viewBox.x, -viewBox.y);
		if (shift.x != 0 || shift.y != 0) {
			for (const element of mainRender.render.svg.children) {
				MultiArrayHelper.recursiveRepositionElement(element, shift, RepositionMode.Translate);
			}
		}

		const translationBaseX = centerX - (viewBox.width / 2);
		const stretchMultiplierX = totalWidth / viewBox.width;

		const children = mainRender.render.svg.children;
		while (children.length > 0) {
			const element = children[0];

			if (this.mainArrayBehavior == OverSizeBehavior.Center) {
				MultiArrayHelper.recursiveRepositionElement(element, new Point2D(translationBaseX, baseY), RepositionMode.Translate);
			}
			else if (this.mainArrayBehavior == OverSizeBehavior.Stretch) {
				MultiArrayHelper.recursiveRepositionElement(element, new Point2D(stretchMultiplierX, 1), RepositionMode.Scale);
				MultiArrayHelper.recursiveRepositionElement(element, new Point2D(0, baseY), RepositionMode.Translate);
			}

			group.appendChild(element);
		}

		return group;
	}

	private renderSubGroup(subRender: AnnotatedSvgRenderResult, baseX: number, labelBaseY: number, elementsCenterLineY: number): SVGGElement {
		const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
		const viewBox = subRender.render.svg.viewBox.baseVal;

		if (subRender.label != undefined) {
			const centerLineX = baseX + (viewBox.width / 2);
			group.appendChild(this.createLabel(centerLineX, labelBaseY + this.renderSettings.labelSettings.marginTop, subRender.label))
		}

		const alignment = subRender.render.alignment;
		let localCenterLine: number;

		if (alignment == null) {
			localCenterLine = viewBox.height / 2;
		}
		else {
			localCenterLine = alignment.getLocalAlignmentLine(viewBox.height);
		}

		const shiftY = elementsCenterLineY - localCenterLine;
		const shift = new Point2D(baseX - viewBox.x, shiftY - viewBox.y);

		const children = subRender.render.svg.children;
		while (children.length > 0) {
			const element = children[0];

			MultiArrayHelper.recursiveRepositionElement(element, shift, RepositionMode.Translate);
			group.appendChild(element);
		}

		return group;
	}

	private createLabel(xPos: number, yPos: number, labelText: string): SVGTextElement {
		const label = document.createElementNS("http://www.w3.org/2000/svg", "text");

		label.textContent = labelText;

		label.setAttribute("x", xPos.toString());
		label.setAttribute("y", yPos.toString())
		label.setAttribute("fill", this.colorMap.get(SymbolicColor.Simulator_Foreground).toString());
		label.setAttribute("font-size", this.renderSettings.labelSettings.font.fontSize.toString());
		label.setAttribute("stroke-width", this.renderSettings.labelSettings.font.strokeWidth.toString());
		label.setAttribute("dominant-baseline", "hanging");
		label.setAttribute("text-anchor", "middle");

		return label;
	}
}