import { CallStackController } from "../../../controllers/CallStackController";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

/**
 * A StepDisplayHandler responsible for rendering a call stack of an algorithm.
 */
export class HtmlCallStackDisplayHandler implements StepDisplayHandler {
	/**
	 * @param callStackController - The controller associated with the call stack display handler.
	 */
	public constructor(
		public readonly callStackController: CallStackController
	) { }

	public display(step?: StepResult): void {
		if (step?.callStack != undefined) {
			this.callStackController.isPresent = true;
			this.callStackController.display(step.callStack, step.variables);
		}
	}

	public redraw(): void { }
}