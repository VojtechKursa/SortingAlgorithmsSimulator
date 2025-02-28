import { StepResult } from "../../../data/stepResults/StepResult";
import { ColorSet } from "../../colors/ColorSet";
import { bodyVertical1LayoutClass } from "../../css/LayoutClasses";
import { StepDisplayHandler } from "../StepDisplayHandler";
import { AlignmentType, SvgRenderer, SvgRenderResult } from "../SvgRenderer";

type AnimatableSVGElement = SVGRectElement | SVGTextElement | SVGPolygonElement | SVGEllipseElement;

class Difference<T> {
	public constructor(
		public readonly property: string,
		public readonly originalValue: T,
		public readonly newValue: T
	) { }
}

class AnimatablePropertyMap {
	private readonly map = new Map<string, string>();

	public constructor(element: AnimatableSVGElement) {
		this.addCommonAttributes(element);
	}

	public addCommonAttributes(element: AnimatableSVGElement) {
		switch (element.tagName.toLowerCase()) {
			case "text":
			case "rect":
				this.addAttribute(element, "x");
				this.addAttribute(element, "y");
				break;
			case "polygon":
				this.addAttribute(element, "points");
				break;
			case "ellipse":
				this.addAttribute(element, "cx");
				this.addAttribute(element, "cy");
				this.addAttribute(element, "rx");
				this.addAttribute(element, "ry");
				break;
		}
	}

	public addAttribute(element: AnimatableSVGElement, attribute: string) {
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

/**
 * A StepDisplayHandler responsible for rendering an SVG representation of an algorithm's state in the UI.
 *
 * This class is also responsible for animation of changes between steps.
 */
export class HtmlSvgDisplayHandler implements StepDisplayHandler {
	/**
	 * The currently selected renderer for rendering the state of the algorithm as an SVG image.
	 */
	private _renderer: SvgRenderer;

	/**
	 * The last step that was displayed.
	 */
	private lastStep: StepResult | undefined;

	/**
	 * The last render returned by the renderer.
	 */
	private lastRenderResult?: SvgRenderResult;

	/**
	 * A map of the elements in the last rendered SVG, used for animating changes between steps.
	 * Map is indexed by the elements' IDs.
	 */
	private lastRenderMemory?: Map<string, AnimatableSVGElement>;



	/**
	 * @param renderer - The initial renderer to use for rendering the algorithm's state as an SVG image.
	 * @param svgOutput - The SVG element to display the rendered SVG in.
	 * @param animate - Whether to animate changes between steps. Defaults to true.
	 * @param animationDurationSeconds - The duration of the transition animations in seconds. Defaults to 0.5.
	 *
	 * @see {@link SvgRenderer}
	 */
	public constructor(
		renderer: SvgRenderer,
		public readonly svgOutput: SVGSVGElement,
		public animate: boolean = true,
		public animationDurationSeconds: number = 0.5
	) {
		this._renderer = renderer;
	}



	/**
	 * The color set used by the renderer.
	 */
	public get colorSet(): ColorSet {
		return this.renderer.colorSet;
	}

	/**
	 * Updates the color set used by the renderer and immediately re-renders the SVG image using the new color set.
	 *
	 * @param newColorSet - The new color set to use.
	 *
	 * @see {@link SvgRenderer.colorSet}
	 */
	public updateColorSet(newColorSet: ColorSet): void {
		this.renderer.colorSet = newColorSet;

		this.displayLastStep();
	}

	/**
	 * The renderer used to render the algorithm's state as an SVG image.
	 */
	public get renderer(): SvgRenderer {
		return this._renderer;
	}

	/**
	 * Updates the renderer used to render the algorithm's state and immediately re-renders the SVG image using the new renderer.
	 *
	 * @param newRenderer - The new SvgRenderer to use.
	 */
	public updateRenderer(newRenderer: SvgRenderer): void {
		this._renderer = newRenderer;

		this.displayLastStep();
	}


	public display(step?: StepResult): void {
		if (step == undefined)
			return;

		this.renderer.render(step).then(rendered => {
			this.applySvgResult(rendered);

			this.lastStep = step;
			this.lastRenderResult = rendered;
		});
	}

	/**
	 * Displays the last step displayed step, used for updates after changing .
	 */
	private displayLastStep(): void {
		if (this.lastStep == undefined)
			return;

		this.renderer.render(this.lastStep).then(rendered => {
			this.applySvgResult(rendered, true);
			this.lastRenderResult = rendered;
		});
	}

	public redraw(): void {
		this.renderer.redraw().then(rendered => {
			if (rendered != null) {
				this.applySvgResult(rendered);
				this.lastRenderResult = rendered;
			}
			else if (this.lastRenderResult != undefined) {
				this.adjustMargins(this.lastRenderResult);
			}
		});
	}

	/**
	 * Builds a map of the elements in the last rendered SVG, that can be used for animating changes between steps.
	 *
	 * @returns The map of the elements in the last rendered SVG, indexed by their IDs.
	 */
	private buildLastRenderMemory(): Map<string, AnimatableSVGElement> | undefined {
		if (this.lastRenderResult == undefined)
			return undefined;

		const result = new Map<string, AnimatableSVGElement>();

		for (const element of this.getAnimatableElements(this.lastRenderResult.svg)) {
			result.set(element.id, element as AnimatableSVGElement);
		}

		return result;
	}

	/**
	 * Retrieves all supported animatable elements from an SVG element.
	 *
	 * @param svg - The SVG element to retrieve the animatable elements from.
	 *
	 * @returns An array of all supported animatable elements in the provided SVG element.
	 */
	private getAnimatableElements(svg: SVGSVGElement): Array<AnimatableSVGElement> {
		const queryResult = new Array<AnimatableSVGElement>(...svg.querySelectorAll("rect,text,polygon,ellipse") as NodeListOf<AnimatableSVGElement>);
		return queryResult.filter(element => element.id != "");
	}

	/**
	 * Applies the SVG render result from a renderer to the SVG output element.
	 * If animation is enabled, the changes between the last render and the new render are animated.
	 * Margin adjustments are also applied to center the SVG inside the parent container according to the parameters in the render result.
	 *
	 * @param svgResult - The new SVG render result to display.
	 * @param preventAnimation - Whether to prevent animation of changes. Defaults to false.
	 */
	private applySvgResult(svgResult: SvgRenderResult, preventAnimation: boolean = false): void {
		let svgToRender = preventAnimation ? svgResult.svg : this.handleAnimations(svgResult.svg);

		this.renderSvg(svgToRender);
		this.adjustMargins(svgResult);
	}

	/**
	 * Animates changes between the last rendered SVG and a provided SVG.
	 *
	 * @param svg - The new SVG element to animate.
	 *
	 * @returns The provided SVG element with animations added.
	 * 	The provided element is not modified, a deep copy of the provided SVG element is created instead,
	 * 	except in situations where animations are impossible by state of the handler
	 * 	(animations disabled or this is the first step).
	 */
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

	/**
	 * Renders an SVG element to the SVG output element and triggers all contained animations.
	 *
	 * @param svg - The SVG element to render.
	 */
	private renderSvg(svg: SVGSVGElement): void {
		this.svgOutput.textContent = "";

		const viewBox = svg.getAttribute("viewBox");

		if (viewBox != null)
			this.svgOutput.setAttribute("viewBox", viewBox);

		this.svgOutput.innerHTML = svg.innerHTML;

		this.svgOutput.querySelectorAll("animate").forEach(animation => animation.beginElement());
	}

	/**
	 * Centers the SVG inside the parent container using margins so the important elements in the SVG are always in the same place (if possible),
	 * even when stacking variables increase the size of the SVG element.
	 *
	 * @param svgResult - The SVG render result to adjust the margins for.
	 *
	 * @see {@link SvgRenderResult.alignment}
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