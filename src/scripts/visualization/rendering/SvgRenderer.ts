import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { ColorSet } from "../colors/ColorSet";

/**
 * Enum representing the type of alignment to use for an SVG image with custom alignment requirements.
 */
export const enum AlignmentType {
	/**
	 * Align the SVG from the top (a pivot of all the associated is the top of the SVG element's parent).
	 */
	FromTop,

	/**
	 * Align the SVG from the bottom (a pivot of all the associated is the bottom of the SVG element's parent).
	 */
	FromBottom
}

/**
 * Represents the alignment information for an SVG image with custom alignment requirements.
 */
export class AlignmentData {
	/**
	 * @param alignmentType - The type of alignment to use.
	 * @param centerLine - The line in the image to align the SVG to.
	 * @param centerLineInPx - Whether the centerLine is in pixels or in SVG units.
	 */
	public constructor(
		public readonly alignmentType: AlignmentType,
		public readonly centerLine: number,
		public readonly centerLineInPx: boolean,
	) { }
}

/**
 * Represents the result of rendering an algorithm state as an SVG.
 */
export class SvgRenderResult {
	/**
	 * @param svg - The rendered SVG.
	 * @param alignment - The alignment information of the rendered SVG, or null if the SVG is not to be manually aligned, just centered.
	 */
	public constructor(
		public readonly svg: SVGSVGElement,
		public readonly alignment: AlignmentData | null,
	) { }

	/**
	 * Clones the SVG and the alignment information.
	 *
	 * @returns The a deep copy of the SVG and it's associated alignment information, which isn't deeply copied, as it's read-only anyway.
	 */
	public clone(): SvgRenderResult {
		return new SvgRenderResult(this.svg.cloneNode(true) as SVGSVGElement, this.alignment);
	}
}

/**
 * An interface for renderer that renders a state of an algorithm as an SVG.
 */
export interface SvgRenderer {
	/**
	 * Gets the color set used by the renderer.
	 */
	get colorSet(): ColorSet;
	/**
	 * Sets the color set used by the renderer.
	 */
	set colorSet(value: ColorSet);

	/**
	 * Renders the state of an algorithm represented by the given step results.
	 *
	 * @param fullStep - The full step to render.
	 * @param codeStep - The code step to render.
	 *
	 * @returns The rendered SVG and it's associated alignment information.
	 *
	 * @see FullStepResult
	 * @see CodeStepResult
	 * @see SvgRenderResult
	 */
	render(fullStep?: FullStepResult, codeStep?: CodeStepResult): SvgRenderResult;

	/**
	 * Redraws the last rendered state of an algorithm after changes in the displayed viewport's size.
	 *
	 * @returns The redrawn SVG adjusted to the new display area and it's associated alignment information,
	 * or null if the renderer doesn't need manual resizing.
	 */
	redraw(): SvgRenderResult | null;
}
