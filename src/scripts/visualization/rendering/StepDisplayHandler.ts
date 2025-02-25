import { CodeStepResult } from "../../data/stepResults/CodeStepResult";
import { FullStepResult } from "../../data/stepResults/FullStepResult";

/**
 * Interface for a handler that displays information about an algorithm's step in the UI.
 */
export interface StepDisplayHandler {
	/**
	 * Displays a given step in the UI.
	 *
	 * @param fullStep - The full step to display.
	 * @param codeStep - The code step to display.
	 *
	 * @remarks
	 * If neither parameter is provided, the handler may redraw the last step, if that serves any purpose,
	 * i.e. for coloring updates or other state changes in the handler, although preferably, any state changes should be reflected in the UI immediately.
	 */
	display(fullStep?: FullStepResult, codeStep?: CodeStepResult): void;

	/**
	 * Redraws the last step displayed by the handler after a window resize.
	 *
	 * If the handler displays information in a way that doesn't need the handling of window resizes, the method may have empty implementation.
	 */
	redraw(): void;
}
