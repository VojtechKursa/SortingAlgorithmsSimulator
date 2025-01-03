import { SymbolicColor } from "../../visualization/colors/SymbolicColor";
import { Highlights } from "../../visualization/Highlights";
import { CallStackFreezed } from "../CallStack";
import { Variable } from "../Variable";
import { CodeStepResult } from "./CodeStepResult";

export class CodeStepResultWithStack extends CodeStepResult {
	public constructor(
		text: string = "",
		symbolicColors: Highlights = new Map<number, SymbolicColor>(),
		variables: Variable[] = [],
		public readonly stack: CallStackFreezed
	) {
		super(text, symbolicColors, variables);
	}
}