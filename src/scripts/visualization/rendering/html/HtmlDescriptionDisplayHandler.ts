import { StepDescriptionController } from "../../../controllers/StepDescriptionController";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

/**
 * A StepDisplayHandler responsible for rendering a description of a step.
 */
export class HtmlDescriptionDisplayHandler implements StepDisplayHandler {
	public constructor(
		public readonly stepDescriptionController: StepDescriptionController
	) { }

	public display(step?: StepResult): void {
		if (step != undefined) {
			this.stepDescriptionController.setDescription(step.description);
		}
	}

	public redraw(): void { }
}