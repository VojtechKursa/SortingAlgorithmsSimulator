import { Variable } from "../data/Variable";
import { VariableWatchClasses } from "../visualization/css/VariableWatchClasses";

export class VariableWatchController {
	public constructor(
		public readonly variableWatch: HTMLDivElement
	) { }

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