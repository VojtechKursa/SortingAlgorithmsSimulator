import { ColorMap } from "../../colors/ColorMap";
import { AlignmentType, SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultMultiArray } from "../../../data/stepResults/StepResultMultiArray";
import { FontProperties } from "./utils/FontProperties";
import { SvgViewBox } from "../../../data/graphical/SvgViewBox";
import { Point2D } from "../../../data/graphical/Point2D";
import { SymbolicColor } from "../../colors/SymbolicColor";

class AnnotatedSvgRenderResult {
	public constructor(
		public readonly render: SvgRenderResult,
		public readonly label: string | undefined = undefined
	) { }
}

class CollectRendersResult {
	public constructor(
		public readonly renders: readonly AnnotatedSvgRenderResult[],
		public readonly centerX: number,
		public readonly viewBox: SvgViewBox,
	) { }
}

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

export class SvgMultiArrayRenderer implements SvgRenderer {
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



	public constructor(
		public readonly underlyingRenderer: SvgRenderer,
	) { }



	public async render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultMultiArray))
			throw new UnsupportedStepResultError(["StepResultMultiArray"]);

		const rendersCollection = await this.collectRenders(step);

		return this.assembleSvg(rendersCollection);
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}



	private async collectRenders(step: StepResultMultiArray): Promise<CollectRendersResult> {
		const renders: AnnotatedSvgRenderResult[] = [];

		let height: number = 0;
		let minX: number = 0;
		let maxX: number = 0;
		for (const array of step.arrays) {
			const render = await this.underlyingRenderer.render(array.step);
			if (render.svg.children.length <= 0)
				continue;

			renders.push(new AnnotatedSvgRenderResult(render, array.name));

			const viewBox = render.svg.viewBox.baseVal;
			const viewBoxMinX = viewBox.x;
			const viewBoxMaxX = viewBox.x + viewBox.width;
			if (renders.length == 1) {
				height = viewBox.height;
				minX = viewBoxMinX;
				maxX = viewBoxMaxX;
			} else {
				height += this.renderSettings.spaceBetweenRenders + viewBox.height;

				if (viewBoxMinX < minX) {
					minX = viewBoxMinX;
				}
				if (viewBoxMaxX > maxX) {
					maxX = viewBoxMaxX;
				}
			}
		}

		// correct values so image starts at X = 0
		const shift = -minX;
		minX += shift;
		maxX += shift;

		const centerX = (minX + maxX) / 2;
		const resultViewBox = new SvgViewBox();
		resultViewBox.startX = 0;
		resultViewBox.width = maxX - minX;
		resultViewBox.startY = 0;
		resultViewBox.height = height;

		return new CollectRendersResult(renders, centerX, resultViewBox);
	}

	private assembleSvg(rendersCollection: CollectRendersResult): SvgRenderResult {
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

		let nextStartY: number = 0;
		const labelInRender = rendersCollection.renders.some(val => val.label != undefined);

		for (const annotatedRender of rendersCollection.renders) {
			const render = annotatedRender.render;
			const shiftResult = SvgMultiArrayRenderer.calculateSvgShift(render.svg.viewBox.baseVal, rendersCollection.centerX, nextStartY);
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
				SvgMultiArrayRenderer.recursiveShiftElement(child, shift);
			}

			if (annotatedRender.label != undefined) {
				let labelPosY: number;
				const base = shift.y;
				const height = (nextStartY - this.renderSettings.spaceBetweenRenders) - base;

				if (render.alignment == null || render.alignment.centerLineInPx) {
					labelPosY = (height / 2) + shift.y;
				} else {
					const offset = render.alignment.centerLine;

					switch (render.alignment.alignmentType) {
						case AlignmentType.FromBottom:
							labelPosY = base + height - offset
							break;
						case AlignmentType.FromTop:
							labelPosY = base + offset;
							break;
					}
				}

				const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
				label.textContent = annotatedRender.label;
				label.setAttribute("x", this.renderSettings.labelSettings.marginLeft.toString());
				label.setAttribute("y", labelPosY.toString())
				label.setAttribute("fill", this.colorMap.get(SymbolicColor.Simulator_Foreground).toString());
				label.setAttribute("font-size", `${this.renderSettings.labelSettings.font.fontSize}px`);
				label.setAttribute("stroke-width", `${this.renderSettings.labelSettings.font.strokeWidth}px`);
				label.setAttribute("dominant-baseline", "central");
				label.setAttribute("text-anchor", "left");

				const outerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
				svg.removeChild(group);
				svg.appendChild(outerGroup);
				outerGroup.appendChild(label);
				outerGroup.appendChild(group);
			}
		}

		let newViewBox: SvgViewBox;
		if (labelInRender) {
			newViewBox = new SvgViewBox();

			newViewBox.startX = rendersCollection.viewBox.startX;
			newViewBox.width = rendersCollection.viewBox.width + this.renderSettings.labelSettings.totalLabelWidth;
			newViewBox.startY = rendersCollection.viewBox.startY;
			newViewBox.height = rendersCollection.viewBox.height;
		}
		else {
			newViewBox = rendersCollection.viewBox;
		}

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

	private static recursiveShiftElement(element: Element, shift: Point2D): void {
		const shifts: [string, number][] = [
			["x", shift.x],
			["y", shift.y],
			["cx", shift.x],
			["cy", shift.y],
		];

		for (const shift of shifts) {
			SvgMultiArrayRenderer.shiftAttribute(element, shift[0], shift[1]);
		}

		const pointsAttribute = element.getAttribute("points");
		if (pointsAttribute != null) {
			const points: Point2D[] = [];
			const pointsSplit = pointsAttribute.split(" ");
			for (const pointString of pointsSplit) {
				if (pointString.length <= 0)
					continue;

				const pointCoords = pointString.split(",");
				if (pointCoords.length != 2)
					throw new Error(`Invalid point coordinate in SVG: ${pointString}`);

				points.push(new Point2D(Number.parseFloat(pointCoords[0]), Number.parseFloat(pointCoords[1])));
			}

			const correctedPoints = points.map(point => new Point2D(point.x + shift.x, point.y + shift.y));
			const newPointsAttribute = correctedPoints.map(point => point.toString()).join(" ");

			element.setAttribute("points", newPointsAttribute);
		}

		for (const child of element.children) {
			SvgMultiArrayRenderer.recursiveShiftElement(child, shift);
		}
	}

	private static shiftAttribute(element: Element, attributeName: string, shift: number) {
		const attribute = element.getAttribute(attributeName);
		if (attribute != null) {
			const attributeValue = Number.parseFloat(attribute) + shift;
			element.setAttribute(attributeName, attributeValue.toString());
		}
	}
}