import { VariableWatchController } from "../../../controllers/VariableWatchController";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

/**
 * A StepDisplayHandler responsible for rendering algorithm's local variables in the UI.
 */
export class HtmlVariableWatchDisplayHandler implements StepDisplayHandler {
	public constructor(
		public readonly variableWatchController: VariableWatchController
	) { }

	public display(step?: StepResult): void {
		if (step != undefined) {
			this.variableWatchController.setVariables(step.variables);
		}
	}

	public redraw(): void { }
}