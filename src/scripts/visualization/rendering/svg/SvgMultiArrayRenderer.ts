import { HasRangeOfValues, supportsRange, SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { FontProperties } from "./utils/FontProperties";
import { SvgViewBox } from "../../../data/graphical/SvgViewBox";
import { Point2D } from "../../../data/graphical/Point2D";
import { SymbolicColor } from "../../colors/SymbolicColor";
import { CollectRendersResult, MultiArrayHelper, RepositionMode } from "./utils/MultiArrayUtils";
import { ColorMap } from "../../colors/ColorMap";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultMultiArray } from "../../../data/stepResults/StepResultMultiArray";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";

class SvgMultiArrayRendererLabelSettings {
	public readonly totalLabelWidth: number;

	public constructor(
		public readonly font: FontProperties = new FontProperties(4, 0.5),
		public readonly marginLeft: number = 2,
		public readonly marginRight: number = 2,
		public readonly reservedWidth: number = 1,
	) {
		this.totalLabelWidth = marginLeft + reservedWidth + marginRight;
	}
}

class SvgMultiArrayRendererSettings {
	public constructor(
		public readonly spaceBetweenRenders: number = 10,
		public readonly labelSettings: SvgMultiArrayRendererLabelSettings = new SvgMultiArrayRendererLabelSettings(),
	) { }
}

export class SvgMultiArrayRenderer implements SvgRenderer, HasRangeOfValues {
	private readonly renderSettings: SvgMultiArrayRendererSettings = new SvgMultiArrayRendererSettings();

	public get colorMap(): ColorMap {
		return this.underlyingRenderer.colorMap;
	}
	public set colorMap(value: ColorMap) {
		this.underlyingRenderer.colorMap = value;
	}

	public get displayName(): string {
		return `Multi ${this.underlyingRenderer.displayName}`;
	}

	public get machineName(): string {
		return `renderer-multiple-${this.underlyingRenderer.machineName}`;
	}

	public setRangeOfValues(min: number | undefined, max: number | undefined): void {
		if (supportsRange(this.underlyingRenderer)) {
			this.underlyingRenderer.setRangeOfValues(min, max);
		}
	}



	public constructor(
		protected readonly underlyingRenderer: SvgRenderer,
	) { }



	public async render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultMultiArray))
			throw new UnsupportedStepResultError(["StepResultMultiArray"]);

		const rendersCollection = await MultiArrayHelper.collectRenders(step.arrays, this.underlyingRenderer);

		return this.assembleSvg(rendersCollection);
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}



	protected assembleSvg(renders: CollectRendersResult): SvgRenderResult {
		let minX = renders.minX;
		let maxX = renders.maxX;
		const xShift = -minX;
		minX += xShift;
		maxX += xShift;
		const centerX = (minX + maxX) / 2;

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		let nextStartY: number = 0;
		const labelInRender = renders.renders.some(val => val.label != undefined);

		for (const annotatedRender of renders.renders) {
			const render = annotatedRender.render;
			const shiftResult = SvgMultiArrayRenderer.calculateSvgShift(render.svg.viewBox.baseVal, centerX, nextStartY);
			nextStartY = shiftResult[1] + this.renderSettings.spaceBetweenRenders;
			const shift = new Point2D(shiftResult[0].x + (labelInRender ? this.renderSettings.labelSettings.totalLabelWidth : 0), shiftResult[0].y);

			const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
			svg.appendChild(group);

			// By adding children to a new hierarchy, they're removed from the original one,
			// so we can just keep adding the first child until the children array is empty
			const children = render.svg.children;
			while (children.length > 0) {
				const child = children[0];

				group.appendChild(child);
				MultiArrayHelper.recursiveRepositionElement(child, shift, RepositionMode.Translate);
			}

			if (annotatedRender.label != undefined) {
				let labelPosY: number;
				const base = shift.y;
				const height = (nextStartY - this.renderSettings.spaceBetweenRenders) - base;

				if (render.alignment == null || render.alignment.centerLineInPx) {
					labelPosY = (height / 2) + shift.y;
				} else {
					labelPosY = render.alignment.getLocalAlignmentLine(height);
				}

				const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
				label.textContent = annotatedRender.label;
				label.setAttribute("x", this.renderSettings.labelSettings.marginLeft.toString());
				label.setAttribute("y", labelPosY.toString())
				label.setAttribute("fill", this.colorMap.get(SymbolicColor.Simulator_Foreground).toString());
				label.setAttribute("font-size", this.renderSettings.labelSettings.font.fontSize.toString());
				label.setAttribute("stroke-width", this.renderSettings.labelSettings.font.strokeWidth.toString());
				label.setAttribute("dominant-baseline", "central");
				label.setAttribute("text-anchor", "left");

				const outerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
				svg.removeChild(group);
				svg.appendChild(outerGroup);
				outerGroup.appendChild(label);
				outerGroup.appendChild(group);
			}
		}

		const newViewBox = new SvgViewBox();
		newViewBox.startX = 0;
		newViewBox.width = maxX - minX + (labelInRender ? this.renderSettings.labelSettings.totalLabelWidth : 0);
		newViewBox.startY = 0;
		newViewBox.height = Math.max(nextStartY - this.renderSettings.spaceBetweenRenders, 0);

		svg.setAttribute("viewBox", newViewBox.toString());

		return new SvgRenderResult(svg, null);
	}

	private static calculateSvgShift(viewBox: SVGRect, centerX: number, currentShiftY: number): [Point2D, number] {
		let shiftX: number = 0;
		if (viewBox.x != 0) {
			shiftX -= viewBox.x;
		}

		// Due to shift, start of X is now 0, so (startX + endX) is (0 + width)
		const localCenter = viewBox.width / 2;

		shiftX += centerX - localCenter;

		let shiftY = currentShiftY - viewBox.y;

		const shift = new Point2D(shiftX, shiftY);
		const nextShiftY = currentShiftY + viewBox.height;

		return [shift, nextShiftY];
	}
}