import { SimulatorOutputElements } from "../../data/collections/htmlElementCollections/SimulatorOutputElements";
import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { ColorSet } from "../ColorSet";

export interface RenderingVisitor {
	colorSet: ColorSet;

	handleFullStepDraw(step: FullStepResult, output: SimulatorOutputElements): void;
	handleFullStepRedraw(step: FullStepResult, output: SimulatorOutputElements): void;

	handleCodeStepDraw(step: CodeStepResult, output: SimulatorOutputElements): void;
	handleCodeStepRedraw(step: CodeStepResult, output: SimulatorOutputElements): void;
}