import { CallStack, CallStackFreezed } from "../data/CallStack";
import { hiddenClass } from "../visualization/CssInterface";

export class CallStackController {
	protected readonly tableBody: HTMLTableSectionElement;

	public constructor(
		public readonly callStackWrapper: HTMLDivElement,
		visible: boolean = false
	) {
		this.visible = visible;

		const body = callStackWrapper.querySelector("tbody#call_stack_body") as HTMLTableSectionElement | null;
		if (body == null)
			throw new Error("Invalid call stack wrapper, doesn't contain 'tbody' element with id 'call_stack_body'");

		this.tableBody = body;
	}

	public get visible(): boolean {
		return !this.callStackWrapper.classList.contains(hiddenClass);
	}
	public set visible(visible: boolean) {
		if (visible)
			this.callStackWrapper.classList.remove(hiddenClass);
		else
			this.callStackWrapper.classList.add(hiddenClass);
	}

	public display(stack: CallStack | CallStackFreezed): void {
		if (stack instanceof CallStack)
			stack = stack.freeze();

		this.tableBody.textContent = "";

		for (const level of stack) {
			const functionNameCol = document.createElement("td");
			functionNameCol.textContent = level.functionName;

			const variablesCol = document.createElement("td");
			const variablesTextBuilder = new Array<string>();
			level.variables.forEach(variable => variablesTextBuilder.push(`${variable.name}=${variable.value}`));
			variablesCol.textContent = variablesTextBuilder.join(" ");

			const row = document.createElement("tr");

			row.appendChild(functionNameCol);
			row.appendChild(variablesCol);

			this.tableBody.appendChild(row);
		}
	}
}