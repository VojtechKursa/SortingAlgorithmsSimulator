import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { Highlights } from "../../visualization/Highlights";
import { CallStack, CallStackFreezed } from "../CallStack";
import { Variable } from "../Variable";
import { CodeStepResult } from "./CodeStepResult";

export class CodeStepResultWithStack extends CodeStepResult {
	public readonly stack: CallStackFreezed;

	public constructor(
		stack: CallStack | CallStackFreezed,
		text: string = "",
		symbolicColors: Highlights = new Map<number, SymbolicColor>(),
		variables: Variable[] = []
	) {
		super(text, symbolicColors, variables);

		this.stack = stack instanceof CallStack ? stack.freeze() : stack;
	}

	public split(): [CodeStepResult, CallStackFreezed] {
		return [new CodeStepResult(this.text, this.symbolicColors, this.variables), this.stack];
	}
}