import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultArray } from "../../../data/stepResults/StepResultArray";
import { StepResultArrayHeapSort } from "../../../data/stepResults/StepResultArrayHeapSort";
import { SvgViewBox } from "../../../data/graphical/SvgViewBox";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { ColorMap } from "../../colors/ColorMap";
import { SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { SvgArrayBoxRenderer } from "./SvgArrayBoxRenderer";
import { SvgHeapRenderer } from "./SvgHeapRenderer";

export class SvgHeapAndArrayRenderer implements SvgRenderer {
	private readonly spaceBetweenHeapAndArray: number = 2;
	private readonly heapRelativeScale: number = 0.75;
	private readonly heapMaxVerticalSizeInArrayMultiples: number = 5;

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
		arrayRenderer: SvgArrayBoxRenderer
	) {
		this._colorMap = arrayRenderer.colorMap;

		this.arrayRenderer = arrayRenderer;
		this.heapRenderer = new SvgHeapRenderer(this.colorMap);
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

			const arrayElementsWidth = this.arrayRenderer.arraySettings.boxSize * (this.arrayRenderer.currentArrayLength ?? 0);
			const arrayWidthPercentageTakenByElements = arrayElementsWidth / arrayViewBox.width;
			const heapWidthLimit = arrayViewBox.width * arrayWidthPercentageTakenByElements * this.heapRelativeScale;
			const heapHeightLimit = this.arrayRenderer.arraySettings.boxSize * this.heapMaxVerticalSizeInArrayMultiples;
			const heapScale = Math.min(heapWidthLimit / heapViewBox.width, heapHeightLimit / heapViewBox.height);

			const arrayStartY = (heapViewBox.height * heapScale) + this.spaceBetweenHeapAndArray + (-arrayViewBox.y);

			resultViewBox.startX = arrayViewBox.x;
			resultViewBox.startY = 0;
			resultViewBox.width = arrayViewBox.width;
			resultViewBox.height = arrayStartY + arrayViewBox.height - (-arrayViewBox.y);

			for (const element of heap.svg.querySelectorAll("*")) {
				if (element.id != "") {
					element.id = `heap-${element.id}`;
				}
			}

			for (const element of array.svg.querySelectorAll("*")) {
				if (element.id != "") {
					element.id = `array-${element.id}`;
				}
			}

			const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute("viewBox", resultViewBox.toString());

			const heapGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
			svg.appendChild(heapGroup);
			heapGroup.id = "heap";
			heapGroup.append(...heap.svg.children);

			const heapScaleTransform = svg.createSVGTransform();
			heapScaleTransform.setScale(heapScale, heapScale);
			heapGroup.transform.baseVal.appendItem(heapScaleTransform);

			const arrayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
			svg.appendChild(arrayGroup);
			arrayGroup.id = "array";
			arrayGroup.append(...array.svg.children);

			const arrayTranslateTransform = svg.createSVGTransform();
			arrayTranslateTransform.setTranslate(0, arrayStartY);
			arrayGroup.transform.baseVal.appendItem(arrayTranslateTransform);

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
}