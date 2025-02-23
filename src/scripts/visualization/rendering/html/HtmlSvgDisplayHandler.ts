import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { ColorSet } from "../../colors/ColorSet";
import { bodyVertical1LayoutClass } from "../../css/LayoutClasses";
import { StepDisplayHandler } from "../StepDisplayHandler";
import { AlignmentType, SvgRenderer, SvgRenderResult } from "../SvgRenderer";

type AnimatableSVGElement = SVGRectElement | SVGTextElement | SVGPolygonElement;

class Difference<T> {
	public constructor(
		public readonly property: string,
		public readonly originalValue: T,
		public readonly newValue: T
	) { }
}

class AnimatablePropertyMap {
	private readonly map = new Map<string, string>();

	public constructor(
		element: SVGElement
	) {
		this.addCommonAttributes(element);
	}

	public addCommonAttributes(element: SVGElement) {
		this.addAttribute(element, "x");
		this.addAttribute(element, "y");
		this.addAttribute(element, "points");
	}

	public addAttribute(element: SVGElement, attribute: string) {
		const attr = element.getAttribute(attribute);
		if (attr != null)
			this.map.set(attribute, attr);
	}

	public static getDifferences(originalPropertyMap: AnimatablePropertyMap, newPropertyMap: AnimatablePropertyMap): Array<Difference<string>> | null {
		const result = new Array<Difference<string>>();

		for (const map1KeyVal of originalPropertyMap.map) {
			const map2Val = newPropertyMap.map.get(map1KeyVal[0]);
			if (map2Val == undefined)
				continue;

			if (map1KeyVal[1] != map2Val)
				result.push(new Difference(map1KeyVal[0], map1KeyVal[1], map2Val));
		}

		if (result.length > 0)
			return result;
		else
			return null;
	}
}

export class HtmlSvgDisplayHandler implements StepDisplayHandler {
	private _renderer: SvgRenderer;

	private lastRenderResult?: SvgRenderResult;
	private lastRenderMemory?: Map<string, AnimatableSVGElement>;



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

		this.applySvgResult(rendered, true);
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

	private buildLastRenderMemory(): Map<string, AnimatableSVGElement> | undefined {
		if (this.lastRenderResult == undefined)
			return undefined;

		const result = new Map<string, AnimatableSVGElement>();

		for (const element of this.getAnimatableElements(this.lastRenderResult.svg)) {
			result.set(element.id, element as AnimatableSVGElement);
		}

		return result;
	}

	private getAnimatableElements(svg: SVGSVGElement): Array<AnimatableSVGElement> {
		return new Array<AnimatableSVGElement>(...svg.querySelectorAll("rect,text,polygon") as NodeListOf<AnimatableSVGElement>);
	}

	private applySvgResult(svgResult: SvgRenderResult, preventAnimation: boolean = false): void {
		let svgToRender = preventAnimation ? svgResult.svg : this.handleAnimations(svgResult.svg);

		this.renderSvg(svgToRender);
		this.adjustMargins(svgResult);
	}

	private handleAnimations(svg: SVGSVGElement): SVGSVGElement {
		const animate = this.animate && this.animationDurationSeconds > 0;

		if (!animate) {
			if (this.lastRenderMemory != undefined)
				this.lastRenderMemory = undefined;

			return svg;
		}

		this.lastRenderMemory = this.buildLastRenderMemory();
		if (this.lastRenderMemory == undefined) {
			return svg;
		}

		const animatedSVG = svg.cloneNode(true) as SVGSVGElement;

		const currentAnimatable = this.getAnimatableElements(animatedSVG);

		for (const currentElement of currentAnimatable) {
			const previousElement = this.lastRenderMemory.get(currentElement.id);
			if (previousElement == undefined)
				continue;

			const currentElementProperties = new AnimatablePropertyMap(currentElement);
			const previousElementProperties = new AnimatablePropertyMap(previousElement);
			const differences = AnimatablePropertyMap.getDifferences(previousElementProperties, currentElementProperties);

			if (differences == null)
				continue;

			for (const difference of differences) {
				const animateElement = document.createElementNS("http://www.w3.org/2000/svg", "animate");

				animateElement.setAttribute("begin", "indefinite");
				animateElement.setAttribute("dur", `${this.animationDurationSeconds}s`);
				animateElement.setAttribute("fill", "freeze");

				animateElement.setAttribute("attributeName", difference.property);
				animateElement.setAttribute("from", difference.originalValue);
				animateElement.setAttribute("to", difference.newValue);

				currentElement.appendChild(animateElement);
			}
		}

		return animatedSVG;
	}

	private renderSvg(svg: SVGSVGElement): void {
		this.svgOutput.textContent = "";

		const viewBox = svg.getAttribute("viewBox");

		if (viewBox != null)
			this.svgOutput.setAttribute("viewBox", viewBox);

		this.svgOutput.innerHTML = svg.innerHTML;

		this.svgOutput.querySelectorAll("animate").forEach(animation => animation.beginElement());
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