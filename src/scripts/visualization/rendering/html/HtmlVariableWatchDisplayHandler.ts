import { VariableWatchController } from "../../../controllers/VariableWatchController";
import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

export class HtmlVariableWatchDisplayHandler implements StepDisplayHandler {
	public constructor(
		public readonly variableWatchController: VariableWatchController
	) { }

	public display(fullStep?: FullStepResult, codeStep?: CodeStepResult): void {
		let code = codeStep != undefined ? codeStep : fullStep?.codeStepResult;

		if (code != undefined)
			this.variableWatchController.setVariables(code.variables);
	}

	public redraw(): void { }
}