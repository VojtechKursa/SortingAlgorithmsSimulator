import { RenderingVisitor } from "../../visualization/rendering/RenderingVisitor";
import { SimulatorOutputElements } from "../collections/htmlElementCollections/SimulatorOutputElements";

export abstract class StepResult {
    protected constructor(public readonly text: string = "") { }

    public abstract display(outputElements: SimulatorOutputElements, renderer: RenderingVisitor): void;
	public abstract redraw(outputElements: SimulatorOutputElements, renderer: RenderingVisitor): void;
}