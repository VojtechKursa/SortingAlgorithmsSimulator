import { Point2D } from "../../../../data/graphical/Point2D";
import { AnnotatedArray, AnnotatedStepResult } from "../../../../data/stepResults/StepResultMultiArray";
import { SvgRenderer, SvgRenderResult } from "../../SvgRenderer";

export class AnnotatedSvgRenderResult {
	public constructor(
		public readonly render: SvgRenderResult,
		public readonly label: string | undefined = undefined
	) { }
}

export class CollectRendersResult {
	public constructor(
		public readonly renders: readonly AnnotatedSvgRenderResult[],
		public readonly minX: number,
		public readonly maxX: number,
		public readonly minY: number,
		public readonly maxY: number,
	) { }
}

export const enum RepositionMode {
	Translate,
	Scale,
}

export class MultiArrayHelper {
	public static async collectRenders(steps: readonly AnnotatedStepResult[], renderer: SvgRenderer, ignoreEmpty: boolean = true): Promise<CollectRendersResult> {
		const renders: AnnotatedSvgRenderResult[] = [];

		let minX: number = 0;
		let maxX: number = 0;
		let minY: number = 0;
		let maxY: number = 0;
		for (const step of steps) {
			const render = await renderer.render(step.step);
			if (render.svg.children.length <= 0 && ignoreEmpty)
				continue;

			renders.push(new AnnotatedSvgRenderResult(render, step.name));

			const viewBox = render.svg.viewBox.baseVal;
			const viewBoxMinX = viewBox.x;
			const viewBoxMaxX = viewBox.x + viewBox.width;
			const viewBoxMinY = viewBox.y;
			const viewBoxMaxY = viewBox.y + viewBox.height;

			if (renders.length == 1) {
				minX = viewBoxMinX;
				maxX = viewBoxMaxX;
				minY = viewBoxMinY;
				maxY = viewBoxMaxY;
			} else {
				if (viewBoxMinX < minX) {
					minX = viewBoxMinX;
				}
				if (viewBoxMaxX > maxX) {
					maxX = viewBoxMaxX;
				}
				if (viewBoxMinY < minY) {
					minY = viewBoxMinY;
				}
				if (viewBoxMaxY > maxY) {
					maxY = viewBoxMaxY;
				}
			}
		}

		return new CollectRendersResult(renders, minX, maxX, minY, maxY);
	}

	public static recursiveRepositionElement(element: Element, shift: Point2D, repositionMode: RepositionMode): void {
		const shifts: [string, number][] = [
			["x", shift.x],
			["y", shift.y],
			["cx", shift.x],
			["cy", shift.y],
		];

		if (repositionMode == RepositionMode.Scale) {
			shifts.push(
				["width", shift.x],
				["height", shift.y],
				["rx", shift.x],
				["ry", shift.y],
			);
		}

		for (const shift of shifts) {
			switch (repositionMode) {
				case RepositionMode.Translate:
					MultiArrayHelper.shiftAttribute(element, shift[0], shift[1]);
					break;
				case RepositionMode.Scale:
					MultiArrayHelper.multiplyAttribute(element, shift[0], shift[1]);
					break;
			}
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

			let correctedPoints: Point2D[];
			switch (repositionMode) {
				case RepositionMode.Translate:
					correctedPoints = points.map(point => new Point2D(point.x + shift.x, point.y + shift.y));
					break;
				case RepositionMode.Scale:
					correctedPoints = points.map(point => new Point2D(point.x * shift.x, point.y * shift.y));
					break;
			}
			const newPointsAttribute = correctedPoints.map(point => point.toString()).join(" ");

			element.setAttribute("points", newPointsAttribute);
		}

		for (const child of element.children) {
			MultiArrayHelper.recursiveRepositionElement(child, shift, repositionMode);
		}
	}

	public static shiftAttribute(element: Element, attributeName: string, shift: number): void {
		const attribute = element.getAttribute(attributeName);
		if (attribute != null) {
			const attributeValue = Number.parseFloat(attribute) + shift;
			element.setAttribute(attributeName, attributeValue.toString());
		}
	}

	public static multiplyAttribute(element: Element, attributeName: string, stretch: number): void {
		const attribute = element.getAttribute(attributeName);
		if (attribute != null) {
			const attributeValue = Number.parseFloat(attribute) * stretch;
			element.setAttribute(attributeName, attributeValue.toString());
		}
	}
}