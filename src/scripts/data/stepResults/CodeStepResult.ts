import { StepDescriptionKind } from "../../controllers/StepDescriptionController";
import { CodeHighlights, CodeHighlight } from "../../visualization/Highlights";
import { codeHighlightClass, VariableWatchClasses } from "../../visualization/CssInterface";
import { Variable } from "../Variable";
import { StepResult } from "./StepResult";
import { RenderingVisitor } from "../../visualization/rendering/RenderingVisitor";



export class CodeStepResult extends StepResult {
	public constructor(
		text: string = "",
		public readonly codeHighlights: CodeHighlights = new Map<number, CodeHighlight>(),
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