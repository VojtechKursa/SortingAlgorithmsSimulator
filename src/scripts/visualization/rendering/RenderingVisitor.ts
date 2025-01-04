import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";
import { ColorSet } from "../colors/ColorSet";

export interface RenderingVisitor {
	colorSet: ColorSet;

	handleFullStepDraw(step: FullStepResult, drawCodeStep: boolean): void;
	handleFullStepRedraw(step: FullStepResult, drawCodeStep: boolean): void;

	handleCodeStepDraw(step: CodeStepResult): void;
	handleCodeStepRedraw(step: CodeStepResult): void;
}