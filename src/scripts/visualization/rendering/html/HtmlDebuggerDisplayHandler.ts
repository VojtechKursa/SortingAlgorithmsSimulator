import { DebuggerController } from "../../../controllers/DebuggerController";
import { StepResult } from "../../../data/stepResults/StepResult";
import { StepDisplayHandler } from "../StepDisplayHandler";

/**
 * A StepDisplayHandler responsible for rendering a debugger UI.
 */
export class HtmlDebuggerDisplayHandler implements StepDisplayHandler {
	public constructor(
		public readonly debuggerController: DebuggerController
	) { }

	public display(step?: StepResult): void {
		if (step != undefined) {
			this.debuggerController.setHighlightedLines(step.highlightedCodeLines);
		}
	}

	public redraw(): void { }
}