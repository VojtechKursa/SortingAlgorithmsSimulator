import { StepDisplayVisitor } from "../../visualization/rendering/StepDisplayVisitor";

export abstract class StepResult {
	protected constructor(public readonly text: string = "") { }

	public abstract display(renderer: StepDisplayVisitor): void;
	public abstract redraw(renderer: StepDisplayVisitor): void;
}