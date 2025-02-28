import Color from "colorjs.io";
import { IndexedNumber } from "../../../data/IndexedNumber";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepResultArray } from "../../../data/stepResults/StepResultArray";
import { UnsupportedStepResultError } from "../../../errors/UnsupportedStepResultError";
import { ColorSet } from "../../colors/ColorSet";
import { SymbolicColor } from "../../colors/SymbolicColor";
import { SvgRenderer, SvgRenderResult } from "../SvgRenderer";
import { DotLangInterface } from "./DotLangInterface";

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

	private _colorSet: ColorSet;
	public get colorSet(): ColorSet {
		return this._colorSet;
	}
	public set colorSet(value: ColorSet) {
		this._colorSet = value;
	}



	public constructor(colorSet: ColorSet) {
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
		const getHexColor = (color: SymbolicColor) => this.colorSet.get(color).toString({ format: "hex" });

		// Build array of Nodes from array
		const nodeArray = step.array.map(number => new DotLangNode(number));

		// Add highlights to Nodes as defined in arrayHighlights
		if (step.arrayHighlights != null) {
			for (const highlight of step.arrayHighlights) {
				const color = this.colorSet.get(highlight[1]);
				nodeArray[highlight[0]].backgroundColor = color;
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

		// Finish graph definition
		graphBuilder.push("}");

		// Render
		const rendererPromise = DotLangInterface.getRenderer();
		const request = graphBuilder.join("\n");
		const svg = (await rendererPromise).renderSVGElement(request);

		// Save result
		this.resultMemory = new SvgRenderResult(svg);
	}
}
