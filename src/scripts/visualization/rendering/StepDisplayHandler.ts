import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";

export interface StepDisplayHandler {
	display(fullStep?: FullStepResult, codeStep?: CodeStepResult): void;
	redraw(): void;
}
