import { Variable } from "../Variable";
import { StepResult } from "./StepResult";
import { StepDisplayVisitor } from "../../visualization/rendering/StepDisplayVisitor";
import { Highlights } from "../../visualization/Highlights";
import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { CallStack, CallStackFreezed } from "../CallStack";



export class CodeStepResult extends StepResult {
	protected stack: CallStackFreezed | undefined;

	public constructor(
		text: string = "",
		public readonly highlightedLines: Highlights = new Map<number, SymbolicColor>(),
		public readonly variables: Variable[] = [],
		stack: CallStack | CallStackFreezed | undefined = undefined
	) {
		super(text);

		if (stack != undefined) {
			this.stack = stack instanceof CallStackFreezed ? stack : stack.freeze();
		}
	}

	public get callStack(): CallStackFreezed | undefined {
		return this.stack;
	}

	public display(renderer: StepDisplayVisitor): void {
		renderer.displayCodeStep(this, false);
	}

	public redraw(renderer: StepDisplayVisitor): void {
		renderer.displayCodeStep(this, true);
	}

	public acceptEqualStack(stack: CallStack | CallStackFreezed) {
		const localStack = stack instanceof CallStackFreezed ? stack : stack.freeze();

		if (CallStackFreezed.equal(this.stack, localStack))
			this.stack = localStack;
	}
}