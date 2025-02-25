import { Variable } from "../data/Variable";
import { VariableWatchClasses } from "../visualization/css/VariableWatchClasses";

/**
 * Controller class for managing the variable watch UI element.
 */
export class VariableWatchController {
	/**
	 * @param variableWatch - The element into which the variables will be written.
	 */
	public constructor(
		public readonly variableWatch: HTMLDivElement
	) { }

	/**
	 * Sets the variables to be displayed in the variable watch.
	 * Clears any existing content in the variable watch and populates it with the provided variables.
	 * @param variables - An array of Variable objects to be displayed.
	 * @see {@link Variable}
	 */
	public setVariables(variables: Variable[]) {
		this.variableWatch.innerText = "";

		variables.forEach(variable => {
			let row = document.createElement("tr");
			row.classList.add(VariableWatchClasses.row);
			this.variableWatch.appendChild(row);

			let variableNameColumn = document.createElement("td");
			variableNameColumn.classList.add(VariableWatchClasses.nameColumn);
			variableNameColumn.innerText = variable.name;
			row.appendChild(variableNameColumn);

			let variableValueColumn = document.createElement("td");
			variableValueColumn.classList.add(VariableWatchClasses.valueColumn);
			variableValueColumn.innerText = variable.value;
			row.appendChild(variableValueColumn);
		});
	}
}