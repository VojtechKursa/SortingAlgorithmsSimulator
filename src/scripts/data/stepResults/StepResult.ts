import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { ReadOnlyHighlights } from "../../visualization/Highlights";
import { CallStack, CallStackFrozen } from "../CallStack";
import { Variable } from "../Variable";
import { StepKind } from "./StepKind";

/**
 * Represents a step of a sorting algorithm.
 */
export abstract class StepResult {
	/**
	 * A variable used to represent a call stack of recursive algorithms.
	 */
	private stack: CallStackFrozen | undefined;

	/**
	 * The lines of code to highlight in the debugger.
	 */
	public readonly highlightedCodeLines: ReadOnlyHighlights;

	/**
	 * @param stepKind {@link StepKind} - The kind of the step.
	 * @param final - Whether the step is the final step of the algorithm.
	 * @param description - The textual description of the step.
	 * @param highlightedCodeLines - The lines of code to highlight in the debugger.
	 * @param variables - The state of variables in the algorithm.
	 * @param stack - A call stack of the algorithm, if any.
	 */
	protected constructor(
		public readonly stepKind: StepKind,
		public readonly final: boolean = false,
		public readonly description: string = "",
		highlightedCodeLines: ReadOnlyHighlights | number | readonly number[] = new Map<number, SymbolicColor>(),
		public readonly variables: readonly Variable[] = [],
		stack: CallStack | CallStackFrozen | undefined = undefined
	) {
		if (stack != undefined) {
			this.stack = stack instanceof CallStack ? stack.freeze() : stack;
		} else {
			this.stack = undefined;
		}

		if (typeof highlightedCodeLines === "number") {
			highlightedCodeLines = [highlightedCodeLines];
		}

		if (highlightedCodeLines instanceof Array) {
			const map = new Map<number, SymbolicColor>();

			highlightedCodeLines.forEach(line => map.set(line, SymbolicColor.Code_ActiveLine));

			highlightedCodeLines = map;
		}

		this.highlightedCodeLines = highlightedCodeLines;
	}

	/**
	 * Gets the call stack of the algorithm at this step, if any.
	 */
	public get callStack(): CallStackFrozen | undefined {
		return this.stack;
	}

	/**
	 * Accepts an equal call stack into itself.
	 * Can be used for the purposes of saving memory by reusing a call stack already returned by a previous step result.
	 * @param stack The call stack to accept. The stack will be accepted only if it's equal to the call stack currently in the step result.
	 * @see {@link CallStackFrozen.equal}
	 */
	private acceptEqualStack(stack: CallStack | CallStackFrozen | undefined): void {
		if (this.stack == undefined || stack == undefined)
			return;

		if (stack == this.stack)
			return;

		const localStack = stack instanceof CallStack ? stack.freeze() : stack;

		if (CallStackFrozen.equal(this.stack, localStack))
			this.stack = localStack;
	}

	/**
	 * Accepts an equal step data into itself.
	 * Can be used for the purposes of saving memory by reusing a step result already returned by a previous step result.
	 *
	 * @param step The step whose data to accept. Only step data that match the data in this step result will be accepted.
	 *
	 * @remarks
	 * Overriding implementation should always call it's parent's method.
	 */
	public acceptEqualStepData(step: StepResult): void {
		this.acceptEqualStack(step.callStack);
	}
}