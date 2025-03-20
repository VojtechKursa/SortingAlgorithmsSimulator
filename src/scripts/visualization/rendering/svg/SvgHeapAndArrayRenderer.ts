import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultArray } from "../../../data/stepResults/StepResultArray";
import { StepResultArrayHeapSort } from "../../../data/stepResults/StepResultArrayHeapSort";
import { SvgViewBox } from "../../../data/graphical/SvgViewBox";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { ColorMap } from "../../colors/ColorMap";
import { SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { SvgArrayBoxRenderer } from "./SvgArrayBoxRenderer";
import { SvgHeapRenderer } from "./SvgHeapRenderer";
import { Point2D } from "../../../data/graphical/Point2D";

class AttributeAndShift {
	public constructor(
		public readonly attributeName: string,
		public readonly shift: number,
	) { }
}

export class SvgHeapAndArrayRenderer implements SvgRenderer {
	private readonly spaceBetweenHeapAndArray: number = 20;

	private arrayRenderer: SvgArrayBoxRenderer;
	private heapRenderer: SvgHeapRenderer;

	private _colorMap: ColorMap;
	public get colorMap(): ColorMap {
		return this._colorMap;
	}
	public set colorMap(value: ColorMap) {
		this._colorMap = value;
		this.arrayRenderer.colorMap = value;
		this.heapRenderer.colorMap = value;
	}

	public get machineName(): string {
		return "renderer-heap_and_array";
	}
	public get displayName(): string {
		return "Heap and Array"
	}

	public constructor(
		colorMap: ColorMap,
		drawFinalVariables: boolean = false,
		drawLastStackLevelVariables: boolean = false
	) {
		this._colorMap = colorMap;

		this.arrayRenderer = new SvgArrayBoxRenderer(colorMap, drawFinalVariables, drawLastStackLevelVariables);
		this.heapRenderer = new SvgHeapRenderer(colorMap);
	}

	public async render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultArray)) {
			throw new UnsupportedStepResultError(["StepResultArray"]);
		}

		let array: SvgRenderResult | undefined;
		let heap: SvgRenderResult | undefined;
		let renderArray = true;
		let renderHeap = true;

		if (step instanceof StepResultArrayHeapSort) {
			if (!step.drawHeap || step.endOfHeap <= 0) {
				renderHeap = false;
			}
			if (!step.drawArray) {
				renderArray = false;
			}
		}

		if (renderArray) {
			array = await this.arrayRenderer.render(step);
		}
		if (renderHeap) {
			heap = await this.heapRenderer.render(step);
		}



		if (heap != undefined && array != undefined) {
			const heapViewBox = heap.svg.viewBox.baseVal;
			const arrayViewBox = array.svg.viewBox.baseVal;
			const resultViewBox = new SvgViewBox();

			resultViewBox.width = Math.max(arrayViewBox.width, heapViewBox.width);
			resultViewBox.height = heapViewBox.height + this.spaceBetweenHeapAndArray + arrayViewBox.height;

			const newHeapOrigin = new Point2D(
				(resultViewBox.width - heapViewBox.width) / 2,
				0
			);
			const heapShifts = newHeapOrigin.x != 0 && newHeapOrigin.y != 0;

			const newArrayOrigin = new Point2D(
				(resultViewBox.width - arrayViewBox.width) / 2,
				heapViewBox.height + this.spaceBetweenHeapAndArray
			);

			for (const element of heap.svg.querySelectorAll("*")) {
				if (element.id != "") {
					element.id = `heap-${element.id}`;
				}

				if (heapShifts) {
					this.updatePosition(element, newHeapOrigin);
				}
			}

			for (const element of array.svg.querySelectorAll("*")) {
				if (element.id != "") {
					element.id = `array-${element.id}`;
				}

				this.updatePosition(element, newArrayOrigin);
			}

			const heapGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
			heapGroup.id = "heap";
			heapGroup.append(...heap.svg.children);

			const arrayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
			arrayGroup.id = "array";
			arrayGroup.append(...array.svg.children);

			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.appendChild(heapGroup);
			svg.appendChild(arrayGroup);
			svg.setAttribute("viewBox", resultViewBox.toString());

			return new SvgRenderResult(svg, null);
		}
		else if (heap != undefined) {
			return heap;
		}
		else if (array != undefined) {
			return array;
		}
		else {
			return new SvgRenderResult(document.createElementNS("http://www.w3.org/2000/svg", "svg"), null);
		}
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}

	private updatePosition(element: Element, newOrigin: Point2D) {
		const config = [
			new AttributeAndShift("x", newOrigin.x),
			new AttributeAndShift("y", newOrigin.y),
			new AttributeAndShift("cx", newOrigin.x),
			new AttributeAndShift("cy", newOrigin.y),
		];

		for (const attribute of config) {
			const currentValue = element.getAttribute(attribute.attributeName);
			if (currentValue != null) {
				const newValue = Number.parseFloat(currentValue) + attribute.shift;
				element.setAttribute(attribute.attributeName, newValue.toString());
			}
		}

		const pointsAttribute = element.getAttribute("points");
		if (pointsAttribute != null) {
			const pointsStrings = pointsAttribute.split(" ");
			const points: Point2D[] = [];
			let parseSuccessful = true;

			for (const pointStr of pointsStrings) {
				const point = Point2D.fromString(pointStr);
				if (point == null) {
					parseSuccessful = false;
					break;
				}
				points.push(point);
			}

			if (parseSuccessful) {
				const newPoints = points.map(point => new Point2D(point.x + newOrigin.x, point.y + newOrigin.y).toString());

				element.setAttribute("points", newPoints.join(" "));
			}
		}
	}
}