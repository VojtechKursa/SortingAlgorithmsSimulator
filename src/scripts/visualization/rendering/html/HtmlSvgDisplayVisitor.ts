import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { ColorSet } from "../../colors/ColorSet";
import { bodyVertical1LayoutClass } from "../../CssInterface";
import { StepDisplayHandler } from "../StepDisplayHandler";
import { AlignmentType, SvgRenderer, SvgRenderResult } from "../SvgRenderer";

export class HtmlSvgDisplayHandler implements StepDisplayHandler {
	private _renderer: SvgRenderer;

	private lastRenderResult?: SvgRenderResult;



	public constructor(
		renderer: SvgRenderer,
		public readonly svgOutput: SVGSVGElement,
		public animate: boolean = true,
		public animationDurationSeconds: number = 0.5
	) {
		this._renderer = renderer;
	}



	public get colorSet(): ColorSet {
		return this.renderer.colorSet;
	}

	public updateColorSet(newColorSet: ColorSet): void {
		this.renderer.colorSet = newColorSet;

		this.displayLastStep();
	}

	public get renderer(): SvgRenderer {
		return this._renderer;
	}

	public updateRenderer(newRenderer: SvgRenderer): void {
		this._renderer = newRenderer;

		this.displayLastStep();
	}


	public display(fullStep?: FullStepResult, codeStep?: CodeStepResult): void {
		if (codeStep == undefined) {
			if (fullStep != undefined)
				codeStep = fullStep.codeStepResult;
			else
				return;
		}

		const rendered = this.renderer.render(fullStep, codeStep);

		this.applySvgResult(rendered);
		this.lastRenderResult = rendered;
	}

	private displayLastStep(): void {
		const rendered = this.renderer.render();

		this.applySvgResult(rendered);
		this.lastRenderResult = rendered;
	}

	public redraw(): void {
		let rendered = this.renderer.redraw();

		if (rendered != null) {
			this.applySvgResult(rendered);
			this.lastRenderResult = rendered;
		}
		else if (this.lastRenderResult != undefined) {
			this.adjustMargins(this.lastRenderResult);
		}
	}

	private applySvgResult(svgResult: SvgRenderResult): void {
		this.renderSvg(svgResult.svg);
		this.adjustMargins(svgResult);
	}

	private renderSvg(svg: SVGSVGElement): void {
		// TODO Animate (modify the svg parameter contents)

		this.svgOutput.textContent = "";

		const viewBox = svg.getAttribute("viewBox");

		if (viewBox != null)
			this.svgOutput.setAttribute("viewBox", viewBox);

		this.svgOutput.innerHTML = svg.innerHTML;
	}

	/**
	 * Centers the SVG inside the parent container so the array boxes are always in the same place (if possible),
	 * even when stacking variables increase the height of the SVG element.
	*/
	private adjustMargins(svgResult: SvgRenderResult): void {
		if (svgResult.alignment == undefined)
			return;

		if (document.body.classList.contains(bodyVertical1LayoutClass)) {
			this.svgOutput.style.marginTop = "";
			return;
		}

		if (this.svgOutput.parentElement == undefined)
			return;

		let currentParentHeight = this.svgOutput.parentElement.clientHeight;
		if (currentParentHeight == undefined)
			return;

		let lastParentHeight = undefined;

		while (currentParentHeight != lastParentHeight) {
			const svgHeight = this.svgOutput.clientHeight;
			const viewBoxHeight = svgResult.svg.viewBox.baseVal.height;

			const pixelToUnitRatio = svgResult.alignment.centerLineInPx ? 1 : svgHeight / viewBoxHeight;
			const targetLine = svgResult.alignment.centerLine;
			const targetLinePx = targetLine * pixelToUnitRatio;

			const parentCenter = (currentParentHeight / 2);

			let margin: number;
			switch (svgResult.alignment.alignmentType) {
				case AlignmentType.FromTop:
					margin = parentCenter - targetLinePx;
					break;
				case AlignmentType.FromBottom:
					margin = parentCenter - svgHeight + targetLinePx;
					break;
			}

			// Prevents clipping of the SVG above it's parent
			if (margin >= 0) {
				this.svgOutput.style.marginTop = `${margin}px`;
			} else {
				this.svgOutput.style.marginTop = "";
			}

			lastParentHeight = currentParentHeight;
			currentParentHeight = this.svgOutput.parentElement.clientHeight;
		}
	}
}