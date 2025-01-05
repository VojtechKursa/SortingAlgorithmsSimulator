import { CallStack, CallStackFreezed } from "../data/CallStack";

export class CallStackController {
	public constructor(
		public readonly callStackWrapper: HTMLDivElement
	) { }

	public display(stack: CallStack | CallStackFreezed): void {
		if (stack instanceof CallStack)
			stack = stack.freeze();

		this.callStackWrapper.textContent = "";

		for (const level of stack) {
			const div = document.createElement("div");
			const variableBuilder = new Array<string>();

			level.variables.forEach(variable => {
				variableBuilder.push(`${variable.name}=${variable.value}`);
			});

			div.textContent = `${level.functionName} - ${variableBuilder.join(" ")}`;

			this.callStackWrapper.appendChild(div);
		}
	}
}