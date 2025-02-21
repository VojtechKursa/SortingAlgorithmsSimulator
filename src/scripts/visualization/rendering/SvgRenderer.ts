import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { ColorSet } from "../colors/ColorSet";

export const enum AlignmentType {
	FromTop,
	FromBottom
}

export class AlignmentData {
	public constructor(
		public readonly alignmentType: AlignmentType,
		public readonly centerLine: number,
		public readonly centerLineInPx: boolean,
	) { }
}

export class SvgRenderResult {
	public constructor(
		public readonly svg: SVGSVGElement,
		public readonly alignment: AlignmentData | null,
	) { }

	public clone(): SvgRenderResult {
		return new SvgRenderResult(this.svg.cloneNode(true) as SVGSVGElement, this.alignment);
	}
}

export interface SvgRenderer {
	get colorSet(): ColorSet;
	set colorSet(value: ColorSet);

	updateColors(colorSet: ColorSet): SvgRenderResult | null;

	render(step: FullStepResult | CodeStepResult): SvgRenderResult;
	redraw(): SvgRenderResult | null;
}
