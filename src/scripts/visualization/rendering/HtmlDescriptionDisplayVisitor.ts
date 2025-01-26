import { StepDescriptionController, StepDescriptionKind } from "../../controllers/StepDescriptionController";
import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { StepDisplayVisitor } from "./StepDisplayVisitor";

export class HtmlDescriptionDisplayVisitor extends StepDisplayVisitor {
	public constructor(
		public readonly stepDescriptionController: StepDescriptionController,
		next: StepDisplayVisitor | null
	) {
		super(next);
	}

	protected displayFullStepInternal(step: FullStepResult, redraw: boolean): void {
		this.stepDescriptionController.setDescription(StepDescriptionKind.FullStepDescription, step.text);
	}

	protected displayCodeStepInternal(step: CodeStepResult, redraw: boolean): void {
		this.stepDescriptionController.setDescription(StepDescriptionKind.CodeStepDescription, step.text);
	}
}