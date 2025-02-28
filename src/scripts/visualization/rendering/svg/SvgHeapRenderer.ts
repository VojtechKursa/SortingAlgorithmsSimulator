import { IndexedNumber } from "../../../data/IndexedNumber";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultArray } from "../../../data/stepResults/StepResultArray";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { ColorSet } from "../../colors/ColorSet";
import { SymbolicColor } from "../../colors/SymbolicColor";
import { RendererClasses } from "../../css/RendererClasses";
import { SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { DotLangInterface } from "./DotLangInterface";

class DotLangNode {
	public constructor(
		public readonly baseNumber: IndexedNumber
	) {

	}

	public get id(): number {
		return this.baseNumber.id;
	}
	public get text(): string {
		return this.baseNumber.value.toString();
	}

	public toString(): string {
		return `${this.id} [id="${this.id}",label="${this.text}"]`;
	}
}

class FontProperties {
	public constructor(
		public readonly fontSize: number,
		public readonly strokeWidth: number
	) { }
}

class HeapRenderSettings {
	public constructor(
		public readonly circleCircumference: number = 10,
		public readonly horizontalMargin: number = 10,
		public readonly verticalMargin: number = 10,
		public readonly borderWidth: number = 0.5,
		public readonly fontMain: FontProperties = new FontProperties(4, 0.5),
		public readonly fontIndex: FontProperties = new FontProperties(2.5, 0.5),
		public readonly indexRightMargin: number = 1,
		public readonly indexBottomMargin: number = 1
	) { }

	public get circleRadius(): number {
		return this.circleCircumference / 2;
	}
}

export class SvgHeapRenderer implements SvgRenderer {
	private readonly heapSettings = new HeapRenderSettings();

	private lastRenderedStep: StepResultArray | undefined;
	private resultMemory: SvgRenderResult;

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
			document.createElementNS("http://www.w3.org/2000/svg", "svg")
		);
	}



	public async render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultArray))
			throw new UnsupportedStepResultError(["StepResultArray"]);

		if (this.lastRenderedStep != undefined) {
			if (step.array != this.lastRenderedStep.array || step.arrayHighlights != this.lastRenderedStep.arrayHighlights) {
				await this.drawHeap(step);
			}
		} else {
			await this.drawHeap(step);
		}

		this.lastRenderedStep = step;

		return this.resultMemory;
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}



	private async drawHeap(step: StepResultArray): Promise<void> {
		const nodeArray = step.array.map(number => new DotLangNode(number));

		const graphBuilder: string[] = ["graph {", ...nodeArray.map(node => node.toString())];

		if (nodeArray.length > 0) {
			const toProcess: number[] = [0];
			let current: number | undefined;

			while ((current = toProcess.shift()) != undefined) {
				let left = (2 * current) + 1;
				let right = (2 * current) + 2;

				if (left >= nodeArray.length)
					continue;
				graphBuilder.push(`${nodeArray[current].id} -- ${nodeArray[left].id}`);
				toProcess.push(left);

				if (right >= nodeArray.length)
					continue;
				graphBuilder.push(`${nodeArray[current].id} -- ${nodeArray[right].id}`);
				toProcess.push(right);
			}
		}

		graphBuilder.push("}");

		const rendererPromise = DotLangInterface.getRenderer();
		const request = graphBuilder.join("\n");
		const svg = (await rendererPromise).renderSVGElement(request);

		this.resultMemory = new SvgRenderResult(svg);
	}
}
