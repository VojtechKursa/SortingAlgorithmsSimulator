import { ColorSet } from "../ColorSet";
import { SimulatorOutputElements } from "../htmlElementCollections/SimulatorOutputElements";

export abstract class StepResult {
    protected constructor(public readonly text: string = "") { }

    public abstract display(outputElements: SimulatorOutputElements, colorSet: ColorSet): void;
}