import { CallStackController } from "../../../controllers/CallStackController";
import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { StepDisplayVisitor } from "../StepDisplayVisitor";

export class HtmlCallStackDisplayVisitor extends StepDisplayVisitor {
	public constructor(
		public readonly callStackController: CallStackController,
		next: StepDisplayVisitor | null
	) {
		super(next);
	}

	protected displayFullStepInternal(step: FullStepResult, redraw: boolean): void { }

	protected displayCodeStepInternal(step: CodeStepResult, redraw: boolean): void {
		if (step.callStack != undefined && !redraw) {
			this.callStackController.isPresent = true;

			this.callStackController.display(step.callStack, step.variables);
		}
	}
}