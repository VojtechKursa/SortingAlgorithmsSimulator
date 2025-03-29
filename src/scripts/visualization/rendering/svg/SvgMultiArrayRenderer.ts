import { ColorMap } from "../../colors/ColorMap";
import { SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultMultiArray } from "../../../data/stepResults/StepResultMultiArray";

export class SvgMultiArrayRenderer implements SvgRenderer {
	private readonly spaceBetweenRenders: number = 10;

	private readonly resultMemory: SvgRenderResult;

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
	) {
		this.resultMemory = new SvgRenderResult(
			document.createElementNS("http://www.w3.org/2000/svg", "svg"),
			null
		);
	}



	public async render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultMultiArray))
			throw new UnsupportedStepResultError(["StepResultMultiArray"]);

		const renders: SvgRenderResult[] = [];
		for (const array of step.arrays) {
			renders.push(await this.underlyingRenderer.render(array.step));
		}

		// TODO: Merge renders by recalculating positions (positions have to be recalculated for animations to work properly when elements move between renders)
		// TODO: Recalculate viewBox

		return this.resultMemory.clone();
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}
}