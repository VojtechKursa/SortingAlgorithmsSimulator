import { CallStackController } from "../../../controllers/CallStackController";
import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

export class HtmlCallStackDisplayHandler implements StepDisplayHandler {
	public constructor(
		public readonly callStackController: CallStackController
	) { }

	public display(fullStep?: FullStepResult, codeStep?: CodeStepResult): void {
		let code = codeStep != undefined ? codeStep : fullStep?.codeStepResult;

		if (code?.callStack != undefined) {
			this.callStackController.isPresent = true;
			this.callStackController.display(code.callStack, code.variables);
		}
	}

	public redraw(): void { }
}