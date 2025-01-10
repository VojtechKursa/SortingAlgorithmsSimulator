import { DebuggerController } from "../../controllers/DebuggerController";
import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { ColorSet } from "../colors/ColorSet";
import { StepDisplayVisitor } from "./StepDisplayVisitor";

export class HtmlDebuggerDisplayVisitor extends StepDisplayVisitor {
	public constructor(
		public readonly debuggerController: DebuggerController,
		next: StepDisplayVisitor | null
	) {
		super(next);
	}

	protected displayFullStepInternal(step: FullStepResult, redraw: boolean): void {	}

	protected displayCodeStepInternal(step: CodeStepResult, redraw: boolean): void {
		if (!redraw)
			this.debuggerController.setHighlightedLines(step.highlightedLines);
	}
}