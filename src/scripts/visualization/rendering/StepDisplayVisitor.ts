import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";

export abstract class StepDisplayVisitor {
	public constructor(
		public readonly next: StepDisplayVisitor | null
	) { }

	public displayFullStep(step: FullStepResult, drawCodeStep: boolean, redraw: boolean): void {
		this.displayFullStepInternal(step, redraw);

		if (drawCodeStep)
			this.displayCodeStepInternal(step.codeStepResult, redraw);

		if (this.next != null)
			this.next.displayFullStep(step, drawCodeStep, redraw);
	}

	public displayCodeStep(step: CodeStepResult, redraw: boolean): void {
		this.displayCodeStepInternal(step, redraw);

		if (this.next != null)
			this.next.displayCodeStep(step, redraw);
	}

	protected abstract displayFullStepInternal(step: FullStepResult, redraw: boolean): void;
	protected abstract displayCodeStepInternal(step: CodeStepResult, redraw: boolean): void;
}
