import { ColorSet } from "../../visualization/ColorSet";
import { SimulatorOutputElements } from "../collections/htmlElementCollections/SimulatorOutputElements";

export abstract class StepResult {
    protected constructor(public readonly text: string = "") { }

    public abstract display(outputElements: SimulatorOutputElements, colorSet: ColorSet): void;
}