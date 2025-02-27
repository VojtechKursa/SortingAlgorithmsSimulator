import { StepResult } from "../../data/stepResults/StepResult";

/**
 * Interface for a handler that displays information about an algorithm's step in the UI.
 */
export interface StepDisplayHandler {
	/**
	 * Displays a given step in the UI.
	 *
	 * @param step - The step to display.
	 *
	 * @remarks
	 * If a parameter isn't provided, the handler may redraw the last step, if that serves any purpose,
	 * i.e. for coloring updates or other state changes in the handler, although preferably, any state changes should be reflected in the UI immediately.
	 */
	display(step?: StepResult): void;

	/**
	 * Redraws the last step displayed by the handler after a window resize.
	 *
	 * If the handler displays information in a way that doesn't need the handling of window resizes, the method may have empty implementation.
	 */
	redraw(): void;
}
