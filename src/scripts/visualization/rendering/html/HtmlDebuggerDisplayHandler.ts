import { DebuggerController } from "../../../controllers/DebuggerController";
import { CodeStepResult } from "../../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../../data/stepResults/FullStepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

export class HtmlDebuggerDisplayHandler implements StepDisplayHandler {
	public constructor(
		public readonly debuggerController: DebuggerController
	) { }

	public display(fullStep?: FullStepResult, codeStep?: CodeStepResult): void {
		let code = codeStep != undefined ? codeStep : fullStep?.codeStepResult;

		if (code != undefined) {
			this.debuggerController.setHighlightedLines(code.highlightedLines);
		}
	}

	public redraw(): void { }
}