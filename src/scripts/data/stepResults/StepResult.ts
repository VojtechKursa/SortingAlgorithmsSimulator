import { RenderingVisitor } from "../../visualization/rendering/RenderingVisitor";

export abstract class StepResult {
    protected constructor(public readonly text: string = "") { }

    public abstract display(renderer: RenderingVisitor): void;
	public abstract redraw(renderer: RenderingVisitor): void;
}