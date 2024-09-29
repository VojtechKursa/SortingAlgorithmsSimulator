import { Highlights } from "../Highlights";
import { StepResult } from "./StepResult";



export type DebuggerElement = HTMLDivElement;
export type VariableWatchElement = HTMLDivElement | null;

export class CodeStepResult extends StepResult {
	public readonly codeHighlights: Highlights;
	public readonly variables: Map<string, any>;

	public constructor(text: string, codeHighlights: Highlights, variables: Map<string, any>) {
		super(text);
		
		this.codeHighlights = codeHighlights;
		this.variables = variables;
	}

	public display(debuggerElement: DebuggerElement, variableWatchElement: VariableWatchElement) {
		// TODO: Debugger highlighting
	}
}