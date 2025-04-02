import { StepResult } from "../../data/stepResults/StepResult";
import { ColorMap } from "../colors/ColorMap";

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

	/**
	 * Returns Y coordinate of a line to which the image this alignment data is associated with should be aligned.
	 * @param viewBoxHeight The height of the SVG viewBox of the image.
	 * @param pointToPixelRatio The svg point to pixel ratio of the rendered image if center line is in pixels.
	 * 		If {@link centerLineInPx} is true and the ratio is undefined, an error is thrown.
	 *
	 * @returns The Y coordinate of a line to which the image this alignment data is associated with should be aligned.
	 */
	public getLocalAlignmentLine(viewBoxHeight: number, pointToPixelRatio: number | undefined = undefined): number {
		let centerLine = this.centerLine;

		if (this.centerLineInPx) {
			if (pointToPixelRatio == undefined) {
				throw new Error("Alignment line requested on alignment data where center line is in pixels, but point to pixel ratio is undefined");
			} else {
				centerLine /= pointToPixelRatio;
			}
		}

		switch (this.alignmentType) {
			case AlignmentType.FromTop:
				return centerLine;
			case AlignmentType.FromBottom:
				return viewBoxHeight - centerLine;
		}
	}
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
		public readonly alignment: AlignmentData | null = null,
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
	 * Gets the color map used by the renderer.
	 */
	get colorMap(): ColorMap;
	/**
	 * Sets the color map used by the renderer.
	 */
	set colorMap(value: ColorMap);

	/**
	 * Gets the string used to represent this renderer for machine processing purposes.
	 */
	get machineName(): string;

	/**
	 * Gets the string displayed to user to identify this renderer.
	 */
	get displayName(): string;

	/**
	 * Renders the state of an algorithm represented by the given step results.
	 *
	 * @param step - The step to render.
	 *
	 * @returns The rendered SVG and it's associated alignment information.
	 *
	 * @see {@link StepResult}
	 * @see {@link SvgRenderResult}
	 */
	render(step: StepResult): Promise<SvgRenderResult>;

	/**
	 * Redraws the last rendered state of an algorithm after changes in the displayed viewport's size.
	 *
	 * @returns The redrawn SVG adjusted to the new display area and it's associated alignment information,
	 * or null if the renderer doesn't need manual resizing.
	 */
	redraw(): Promise<SvgRenderResult | null>;
}
