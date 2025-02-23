import { Variable } from "../Variable";
import { StepResult } from "./StepResult";
import { StepDisplayHandler } from "../../visualization/rendering/StepDisplayHandler";
import { Highlights } from "../../visualization/Highlights";
import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { CallStack, CallStackFrozen } from "../CallStack";



export class CodeStepResult extends StepResult {
	protected stack: CallStackFrozen | undefined;

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

	public get callStack(): CallStackFrozen | undefined {
		return this.stack;
	}

	public acceptEqualStack(stack: CallStack | CallStackFrozen) {
		const localStack = stack instanceof CallStackFrozen ? stack : stack.freeze();

		if (CallStackFrozen.equal(this.stack, localStack))
			this.stack = localStack;
	}
}