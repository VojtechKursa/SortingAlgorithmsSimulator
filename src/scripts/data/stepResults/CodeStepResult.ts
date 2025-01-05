import { Variable } from "../Variable";
import { StepResult } from "./StepResult";
import { RenderingVisitor } from "../../visualization/rendering/RenderingVisitor";
import { Highlights } from "../../visualization/Highlights";
import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { CallStack, CallStackFreezed } from "../CallStack";



export class CodeStepResult extends StepResult {
	protected stack: CallStackFreezed | undefined;

	public constructor(
		text: string = "",
		public readonly symbolicColors: Highlights = new Map<number, SymbolicColor>(),
		public readonly variables: Variable[] = [],
		stack: CallStack | CallStackFreezed | undefined = undefined
	) {
		super(text);

		if (stack instanceof CallStack)
			stack = stack.freeze()

		this.stack = stack;
	}

	public get callStack(): CallStackFreezed | undefined {
		return this.stack;
	}

	public display(renderer: RenderingVisitor): void {
		renderer.handleCodeStepDraw(this);
	}

	public redraw(renderer: RenderingVisitor): void {
		renderer.handleCodeStepRedraw(this);
	}

	public acceptEqualStack(stack: CallStack | CallStackFreezed) {
		if (stack instanceof CallStack)
			stack = stack.freeze();

		if (CallStackFreezed.equal(this.stack, stack))
			this.stack = stack;
	}
}