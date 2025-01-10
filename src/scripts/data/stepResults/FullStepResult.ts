import { CodeStepResult } from "./CodeStepResult";
import { StepResult } from "./StepResult";
import { StepDisplayVisitor } from "../../visualization/rendering/StepDisplayVisitor";



export abstract class FullStepResult extends StepResult {
	protected constructor(
		public readonly final: boolean = false,
		text: string = "",
		public readonly isLastSubstep: boolean,
		public readonly codeStepResult: CodeStepResult = new CodeStepResult()
	) {
		super(text);
	}

	public display(renderer: StepDisplayVisitor, drawCodeStep: boolean = true): void {
		renderer.displayFullStep(this, drawCodeStep, false);
	}

	public redraw(renderer: StepDisplayVisitor, drawCodeStep: boolean = true): void {
		renderer.displayFullStep(this, drawCodeStep, true);
	}
}