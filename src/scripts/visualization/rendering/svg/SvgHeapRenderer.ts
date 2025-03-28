import Color from "colorjs.io";
import { IndexedNumber } from "../../../data/IndexedNumber";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultArray } from "../../../data/stepResults/StepResultArray";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { ColorMap } from "../../colors/ColorMap";
import { SymbolicColor } from "../../colors/SymbolicColor";
import { SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { DotLangInterface } from "./DotLangInterface";
import { StepResultArrayHeapSort } from "../../../data/stepResults/StepResultArrayHeapSort";
import { ReadOnlyHighlights } from "../../Highlights";

class DotLangNode {
	public constructor(
		public readonly baseNumber: IndexedNumber,
		public backgroundColor?: Color,
		public fontColor?: Color,
		public borderColor?: Color,
	) { }

	public get id(): number {
		return this.baseNumber.id;
	}

	public get text(): string {
		let result = this.baseNumber.value.toString();

		if (this.baseNumber.index != null) {
			result += ` - ${this.baseNumber.index}`;
		}

		return result;
	}

	public toString(): string {
		const base = `${this.id} [id="${this.id}",label="${this.text}"`;

		const attributeBuilder: string[] = [""];

		if (this.backgroundColor != undefined) {
			attributeBuilder.push(`fillcolor="${this.backgroundColor.toString({ format: "hex" })}"`);
		}
		if (this.fontColor != undefined) {
			attributeBuilder.push(`fontcolor="${this.fontColor.toString({ format: "hex" })}"`);
		}
		if (this.borderColor != undefined) {
			attributeBuilder.push(`color="${this.borderColor.toString({ format: "hex" })}"`);
		}

		return base + attributeBuilder.join(",") + "]";
	}
}

export class SvgHeapRenderer implements SvgRenderer {
	private lastRenderedStep: StepResultArray | undefined;
	private resultMemory: SvgRenderResult;

	private _colorMap: ColorMap;
	public get colorMap(): ColorMap {
		return this._colorMap;
	}
	public set colorMap(value: ColorMap) {
		this._colorMap = value;
	}

	public get displayName(): string {
		return "Heap";
	}

	public get machineName(): string {
		return "renderer-heap";
	}



	public constructor(colorMap: ColorMap) {
		this._colorMap = colorMap;

		this.resultMemory = new SvgRenderResult(
			document.createElementNS("http://www.w3.org/2000/svg", "svg")
		);
	}



	public async render(step: StepResult): Promise<SvgRenderResult> {
		if (!(step instanceof StepResultArray))
			throw new UnsupportedStepResultError(["StepResultArray"]);

		if (
			this.lastRenderedStep == undefined ||
			(
				step.array != this.lastRenderedStep.array ||
				step.arrayHighlights != this.lastRenderedStep.arrayHighlights
			)
		) {
			if (step instanceof StepResultArrayHeapSort) {
				if (step.drawHeap && step.endOfHeap > 0) {
					await this.drawHeap(step.array.slice(0, step.endOfHeap), step.arrayHighlights);
				}
			} else {
				await this.drawHeap(step.array, step.arrayHighlights);
			}
		}

		this.lastRenderedStep = step;

		return this.resultMemory.clone();
	}

	public redraw(): Promise<SvgRenderResult | null> {
		return Promise.resolve(null);
	}



	private async drawHeap(array: readonly IndexedNumber[], highlights: ReadOnlyHighlights | null): Promise<void> {
		const getHexColor = (color: SymbolicColor) => this.colorMap.get(color).toString({ format: "hex" });

		// Build array of Nodes from array
		const nodeArray = array.map(number => new DotLangNode(number));

		// Add highlights to Nodes as defined in arrayHighlights
		if (highlights != null) {
			for (const highlight of highlights) {
				const node = nodeArray[highlight[0]];
				if (node == undefined)
					continue;

				const color = this.colorMap.get(highlight[1]);
				node.backgroundColor = color;
			}
		}

		// Initialize graph
		const graphBuilder: string[] = [
			"graph {",
			'bgcolor="transparent"',
			`node [tooltip=" ",style="filled",color="${getHexColor(SymbolicColor.Element_Border)}",fillcolor="${getHexColor(SymbolicColor.Element_Background)}",fontcolor="${getHexColor(SymbolicColor.Element_Foreground)}"]`,
			'edge [tooltip=" "]',
			...nodeArray.map(node => node.toString())
		];

		// Make connections
		for (let i = 0; i < nodeArray.length; i++) {
			const current = nodeArray[i];
			const left = nodeArray[2 * i + 1];
			if (left == undefined)
				break;
			graphBuilder.push(`${current.id} -- ${left.id}`);

			const right = nodeArray[2 * i + 2];
			if (right == undefined)
				break;
			graphBuilder.push(`${current.id} -- ${right.id}`);
		}

		// Finish graph definition
		graphBuilder.push("}");

		// Render
		const rendererPromise = DotLangInterface.getRenderer();
		const request = graphBuilder.join("\n");
		const svg = (await rendererPromise).renderSVGElement(request);

		// Add IDs for animations to nodes
		for (const node of svg.querySelectorAll(".node")) {
			const nodeEllipse = node.querySelector("ellipse");
			if (nodeEllipse != null) {
				nodeEllipse.id = `${node.id}-ellipse`;
			}

			const nodeText = node.querySelector("text");
			if (nodeText != null) {
				nodeText.id = `${node.id}-text`;
			}
		}

		/* Edges aren't animated because their IDs aren't usable for relating edges between states for animations
			If default IDs are used for edges, they're labeled in order they're generated, which means edges with same IDs
				are always in the same places
			If IDs are assigned based on IDs of nodes they're connecting, then edges appear and disappear when new edges are made
				(If switching edge between 2-3 to edge between 3-4, IDs of old and new edge are different)
			A more complex matching algorithm would be necessary to properly animate edges, which is out of scope of this project for now. */

		// Save result
		this.resultMemory = new SvgRenderResult(svg);
	}
}
