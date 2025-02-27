import { CallStack, CallStackFrozen, CallStackLevel } from "../data/CallStack";
import { Variable } from "../data/Variable";
import { hiddenClass } from "../visualization/css/GenericClasses";

/**
 * Controller class for managing and displaying a call stack in the simulator UI.
 */
export class CallStackController {
	/**
	 * The table body element where the call stack levels will be displayed.
	 */
	protected readonly tableBody: HTMLTableSectionElement;

	/**
	 * Stores the last displayed call stack data and variables.
	 */
	private lastDisplayData: [CallStackFrozen, (readonly Variable[])?] | undefined;

	/**
	 * The symbol used to separate variable names and values.
	 */
	private _variableSeparationSymbol: string;

	/**
	 * Sets a new variable separation symbol and updates the display if there is existing data.
	 * @param newSymbol - The new symbol to use for separating variable names and values.
	 */
	public set variableSeparationSymbol(newSymbol: string) {
		this._variableSeparationSymbol = newSymbol;

		if (this.lastDisplayData != undefined) {
			this.display(this.lastDisplayData[0], this.lastDisplayData[1]);
		}
	}

	/**
	 * Gets the current variable separation symbol.
	 * @returns The current symbol used for separating variable names and values.
	 */
	public get variableSeparationSymbol(): string {
		return this._variableSeparationSymbol;
	}

	/**
	 * @param callStackWrapper - The HTMLDivElement that wraps the call stack table.
	 * @param variableSeparationSymbol - The symbol used to separate variable names and values. Defaults to "=".
	 * @param visible - A boolean indicating whether the call stack is initially visible. Defaults to false.
	 */
	public constructor(
		public readonly callStackWrapper: HTMLDivElement,
		variableSeparationSymbol: string = "=",
		visible: boolean = false
	) {
		this.isPresent = visible;

		let body = callStackWrapper.querySelector("tbody#call_stack-body") as HTMLTableSectionElement | null;

		if (body == null) {
			body = document.createElement("tbody");
			body.id = "call_stack-body";
			callStackWrapper.appendChild(body);
		}

		this.tableBody = body;

		this._variableSeparationSymbol = variableSeparationSymbol;
	}

	/**
	 * Gets whether the call stack is currently visible.
	 * @returns True if the call stack is visible, otherwise false.
	 */
	public get isPresent(): boolean {
		return !this.callStackWrapper.classList.contains(hiddenClass);
	}

	/**
	 * Sets the visibility of the call stack.
	 * @param isPresent - True to make the call stack visible, false to hide it.
	 */
	public set isPresent(isPresent: boolean) {
		if (isPresent) {
			this.callStackWrapper.classList.remove(hiddenClass);
		}
		else {
			this.callStackWrapper.classList.add(hiddenClass);
		}
	}

	/**
	 * Displays the given call stack and optionally the current level variables.
	 * @param stack - The call stack to display.
	 * @param currentLevelVariables - The variables of the current call stack level, if any.
	 */
	public display(stack: CallStack | CallStackFrozen, currentLevelVariables?: readonly Variable[]): void {
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

	/**
	 * Creates a table row element for a given call stack level.
	 * @param level - The call stack level to create a row for.
	 * @returns The created table row element.
	 */
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

	/**
	 * Creates a div element containing the variables of a call stack level.
	 * @param variables - The variables of a call stack level to display.
	 * @returns The created div element containing the variables of a call stack level.
	 */
	private createVariablesCell(variables: readonly Variable[]): HTMLDivElement {
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