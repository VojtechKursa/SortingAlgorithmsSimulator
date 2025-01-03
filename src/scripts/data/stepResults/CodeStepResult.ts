import { Variable } from "../Variable";
import { StepResult } from "./StepResult";
import { RenderingVisitor } from "../../visualization/rendering/RenderingVisitor";
import { Highlights } from "../../visualization/Highlights";
import { SymbolicColor } from "../../visualization/colors/SymbolicColor";



export class CodeStepResult extends StepResult {
	public constructor(
		text: string = "",
		public readonly symbolicColors: Highlights = new Map<number, SymbolicColor>(),
		public readonly variables: Variable[] = []
	) {
		super(text);
	}

	public display(renderer: RenderingVisitor): void {
		renderer.handleCodeStepDraw(this);
	}

	public redraw(renderer: RenderingVisitor): void {
		renderer.handleCodeStepRedraw(this);
	}
}