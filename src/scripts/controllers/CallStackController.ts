import { CallStack, CallStackFrozen, CallStackLevel } from "../data/CallStack";
import { Variable } from "../data/Variable";
import { hiddenClass } from "../visualization/css/GenericClasses";

export class CallStackController {
	protected readonly tableBody: HTMLTableSectionElement;

	private lastDisplayData: [CallStackFrozen, Variable[]?] | undefined;

	private _variableSeparationSymbol: string;
	public set variableSeparationSymbol(newSymbol: string) {
		this._variableSeparationSymbol = newSymbol;

		if (this.lastDisplayData != undefined) {
			this.display(this.lastDisplayData[0], this.lastDisplayData[1]);
		}
	}
	public get variableSeparationSymbol(): string {
		return this._variableSeparationSymbol;
	}

	public constructor(
		public readonly callStackWrapper: HTMLDivElement,
		variableSeparationSymbol: string = "=",
		visible: boolean = false
	) {
		this.isPresent = visible;

		const body = callStackWrapper.querySelector("tbody#call_stack-body") as HTMLTableSectionElement | null;
		if (body == null)
			throw new Error("Invalid call stack wrapper, doesn't contain 'tbody' element with id 'call_stack-body'");

		this.tableBody = body;

		this._variableSeparationSymbol = variableSeparationSymbol;
	}

	public get isPresent(): boolean {
		return !this.callStackWrapper.classList.contains(hiddenClass);
	}
	public set isPresent(isPresent: boolean) {
		if (isPresent) {
			this.callStackWrapper.classList.remove(hiddenClass);
		}
		else {
			this.callStackWrapper.classList.add(hiddenClass);
		}
	}

	public display(stack: CallStack | CallStackFrozen, currentLevelVariables?: Variable[]): void {
		const localStack = stack instanceof CallStackFrozen ? stack : stack.freeze();

		this.tableBody.textContent = "";

		if (localStack.currentFunctionName != undefined && currentLevelVariables != undefined) {
			this.tableBody.appendChild(this.createStackLevelRow(new CallStackLevel(localStack.currentFunctionName, currentLevelVariables)));
		}

		for (const level of stack) {
			this.tableBody.appendChild(this.createStackLevelRow(level));
		}

		this.lastDisplayData = [localStack, currentLevelVariables];
	}

	private createStackLevelRow(level: CallStackLevel): HTMLTableRowElement {
		const functionNameCol = document.createElement("td");
		functionNameCol.textContent = level.functionName;

		const variablesCol = document.createElement("td");
		variablesCol.appendChild(this.createVariablesCell(level.variables));

		const row = document.createElement("tr");

		row.appendChild(functionNameCol);
		row.appendChild(variablesCol);

		return row;
	}

	private createVariablesCell(variables: Variable[]): HTMLDivElement {
		const wrapper = document.createElement("div");

		for (const variable of variables) {
			const line = document.createElement("div");

			const varName = document.createElement("div");
			varName.textContent = variable.name;

			const splitter = document.createElement("div");
			splitter.textContent = this.variableSeparationSymbol;

			const varValue = document.createElement("div");
			varValue.textContent = variable.value;

			line.appendChild(varName);
			line.appendChild(splitter);
			line.appendChild(varValue);

			wrapper.appendChild(line);
		}

		return wrapper;
	}
}