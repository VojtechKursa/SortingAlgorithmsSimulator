import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";
import { RenderingVisitor } from "../../visualization/rendering/RenderingVisitor";



export abstract class FullStepResult extends StepResult {
	protected constructor(
		public readonly final: boolean = false,
		text: string = "",
		public readonly isLastSubstep: boolean,
		public readonly codeStepResult: CodeStepResult = new CodeStepResult()
	) {
		super(text);
	}

	public display(renderer: RenderingVisitor, drawCodeStep: boolean = true): void {
		renderer.handleFullStepDraw(this, drawCodeStep);
	}

	public redraw(renderer: RenderingVisitor, drawCodeStep: boolean = true): void {
		renderer.handleFullStepRedraw(this, drawCodeStep);
	}
}