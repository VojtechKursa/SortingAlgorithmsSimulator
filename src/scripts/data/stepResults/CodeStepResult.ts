import { Variable } from "../Variable";
import { StepResult } from "./StepResult";
import { Highlights } from "../../visualization/Highlights";
import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { CallStack, CallStackFrozen } from "../CallStack";



/**
 * Represents a step of a sorting algorithm that won't change the visualization of the internal data structure of the sorting algorithm.
 */
export class CodeStepResult extends StepResult {
	/**
	 * A variable used to represent a call stack of recursive algorithms.
	 */
	protected stack: CallStackFrozen | undefined;

	/**
	 * Creates an instance of CodeStepResult.
	 * @param text - The textual description of the step.
	 * @param highlightedLines - The lines of code to highlight in the debugger.
	 * @param variables - The state of variables in the algorithm.
	 * @param stack - A call stack of the algorithm, if any.
	 */
	public constructor(
		text: string = "",
		public readonly highlightedLines: Highlights = new Map<number, SymbolicColor>(),
		public readonly variables: Variable[] = [],
		stack: CallStack | CallStackFrozen | undefined = undefined
	) {
		super(text);

		if (stack != undefined) {
			this.stack = stack instanceof CallStackFrozen ? stack : stack.freeze();
		}
	}

	/**
	 * Gets the call stack of the algorithm, if any.
	 */
	public get callStack(): CallStackFrozen | undefined {
		return this.stack;
	}

	/**
	 * Accepts an equal call stack into itself.
	 * Can be used for the purposes of saving memory by reusing a call stack already returned by a previous step result.
	 * @param stack The call stack to accept. The stack will be accepted only if it's equal to the call stack currently in the step result.
	 * @see CallStackFrozen.equal
	 */
	public acceptEqualStack(stack: CallStack | CallStackFrozen) {
		const localStack = stack instanceof CallStackFrozen ? stack : stack.freeze();

		if (CallStackFrozen.equal(this.stack, localStack))
			this.stack = localStack;
	}
}