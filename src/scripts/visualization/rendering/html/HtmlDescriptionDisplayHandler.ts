import { StepDescriptionController, StepDescriptionKind } from "../../../controllers/StepDescriptionController";
import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

export class HtmlDescriptionDisplayHandler implements StepDisplayHandler {
	public constructor(
		public readonly stepDescriptionController: StepDescriptionController
	) { }

	public display(fullStep?: FullStepResult, codeStep?: CodeStepResult): void {
		let code = codeStep != undefined ? codeStep : fullStep?.codeStepResult;

		if (code != undefined) {
			this.stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, code.text);
		}

		if (fullStep != undefined) {
			this.stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, fullStep.text);
		}
	}

	public redraw(): void { }
}