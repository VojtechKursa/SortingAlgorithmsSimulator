import { StepMemory } from "../../../data/StepMemory";
import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { ColorSet } from "../../colors/ColorSet";
import { bodyVertical1LayoutClass } from "../../CssInterface";
import { StepDisplayVisitor } from "../StepDisplayVisitor";
import { AlignmentData, AlignmentType, SvgRenderer, SvgRenderResult } from "../SvgRenderer";

export class HtmlSvgDisplayVisitor extends StepDisplayVisitor {
	public get colorSet(): ColorSet {
		return this.renderer.colorSet;
	}
	public get renderer(): SvgRenderer {
		return this._renderer;
	}

	private lastStep?: StepMemory<FullStepResult>;
	private lastRenderResult?: SvgRenderResult;

	public constructor(
		next: StepDisplayVisitor | null,
		private _renderer: SvgRenderer,
		public readonly svgOutput: SVGSVGElement,
	) {
		super(next);
	}

	public updateColorSet(newColorSet: ColorSet): void {
		const rendered = this.renderer.updateColors(newColorSet);

		if (rendered != null)
			this.applySvgResult(rendered);
	}

	public updateRenderer(newRenderer: SvgRenderer): void {
		this._renderer = newRenderer;

		if (this.lastStep != null) {
			this.renderer.render(this.lastStep.fullStep);

			this.applySvgResult(this.renderer.render(this.lastStep.codeStep));
		}
	}



	protected override displayFullStepInternal(step: FullStepResult, redraw: boolean): void {
		if (this.lastStep == null) {
			this.lastStep = new StepMemory(step, step.codeStepResult);
		} else {
			this.lastStep.fullStep = step;
			this.lastStep.codeStep = step.codeStepResult;
		}

		this.display(step, redraw);
	}

	protected override displayCodeStepInternal(step: CodeStepResult, redraw: boolean): void {
		if (this.lastStep == null) {
			throw new Error("Attempted to render code step as first step.")
		}

		this.lastStep.codeStep = step;

		this.display(step, redraw);
	}



	private display(step: CodeStepResult | FullStepResult, redraw: boolean): void {
		if (redraw) {
			let rendered = this.renderer.redraw();

			if (rendered != null) {
				this.applySvgResult(rendered);
			} else if (this.lastRenderResult != undefined) {
				this.adjustMargins(this.lastRenderResult);
			}
		}
		else {
			this.applySvgResult(this.renderer.render(step));
		}
	}

	private applySvgResult(svgResult: SvgRenderResult): void {
		this.renderSvg(svgResult.svg);
		this.adjustMargins(svgResult);
	}

	private renderSvg(svg: SVGSVGElement): void {
		// TODO Animate (modify the svg parameter contents)

		this.svgOutput.textContent = "";

		const viewBox = svg.viewBox.baseVal;

		this.svgOutput.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
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

		this.lastRenderResult = svgResult;
	}
}