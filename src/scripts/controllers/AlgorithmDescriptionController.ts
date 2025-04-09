import { Complexity, ComplexityRange } from "../../sortsConfigs/definitions/Complexity";
import { SortFamilyProperties } from "../../sortsConfigs/definitions/SortFamilyProperties";
import { SortProperties } from "../../sortsConfigs/definitions/SortProperties";
import { getBooleanString, getComplexityOrComplexityRangeHTML, getComplexityOrComplexityRangeString } from "../../sortsConfigs/definitions/SortPropertyHelpers";
import { AlgorithmDescriptionClasses } from "../visualization/css/AlgorithmDescriptionClasses";

abstract class PropertiesTableEntry {
	public constructor(
		public readonly name: string,
	) { }
}

class ComplexityTableEntry extends PropertiesTableEntry {
	public constructor(
		name: string,
		public readonly value: Complexity | ComplexityRange | undefined
	) {
		super(name);
	}
}

class BooleanTableEntry extends PropertiesTableEntry {
	public constructor(
		name: string,
		public readonly value: boolean | null
	) {
		super(name);
	}
}

export class AlgorithmDescriptionController {
	private readonly dialog: HTMLDialogElement;

	public constructor(
		private readonly properties: SortFamilyProperties | SortProperties
	) {
		this.dialog = document.createElement("dialog");
		this.dialog.classList.add(AlgorithmDescriptionClasses.dialogClass);

		this.generateDialog();

		this.dialog.addEventListener("close", () => {
			document.body.classList.remove("blur");
			document.body.removeChild(this.dialog);
		});
	}

	private generateDialog(): void {
		this.dialog.innerHTML = "";

		const header = document.createElement("h2");
		header.textContent = this.properties.name;

		const propertiesWrapper = this.generateProperties();

		const description = this.generateDescription();

		const buttonsWrapper = document.createElement("div");
		buttonsWrapper.classList.add(AlgorithmDescriptionClasses.buttonsWrapperClass);

		const closeButton = document.createElement("button");
		closeButton.textContent = "Close";
		closeButton.classList.add("btn", "btn-primary");
		buttonsWrapper.appendChild(closeButton);

		this.dialog.appendChild(header);
		this.dialog.appendChild(propertiesWrapper);
		this.dialog.appendChild(description);
		this.dialog.appendChild(buttonsWrapper);

		closeButton.addEventListener("click", () => this.close());
	}

	private generateDescription(): HTMLDivElement {
		const description = document.createElement("div");
		description.classList.add(AlgorithmDescriptionClasses.descriptionClass);

		const short = document.createElement("div");
		short.textContent = this.properties.shortDescription;

		const long = document.createElement("div");
		long.textContent = this.properties.longDescription;

		description.appendChild(short);
		description.appendChild(long);

		return description;
	}

	private generateProperties(): HTMLDivElement {
		const propertiesWrapper = document.createElement("div");
		propertiesWrapper.classList.add(AlgorithmDescriptionClasses.propertiesClass, "row");

		const propertiesLayoutBreakpoint = "lg";

		const timeComplexityName = "Time complexity";
		const timeComplexities = [
			new ComplexityTableEntry("Worst", this.properties.timeComplexity.worst),
			new ComplexityTableEntry("Average", this.properties.timeComplexity.average),
			new ComplexityTableEntry("Best", this.properties.timeComplexity.best),
		];

		const otherProperties = [
			new ComplexityTableEntry("Space complexity", this.properties.spaceComplexity),
			new BooleanTableEntry("Stable", this.properties.stable),
			new BooleanTableEntry("In-place", this.properties.inPlace),
		];

		const timeComplexityWrapper = document.createElement("div");
		timeComplexityWrapper.classList.add("col-12", `col-${propertiesLayoutBreakpoint}-6`, "row", AlgorithmDescriptionClasses.tableWrapperClass);
		propertiesWrapper.appendChild(timeComplexityWrapper);

		const timeComplexityLabel = document.createElement("div");
		timeComplexityLabel.classList.add("col-4", AlgorithmDescriptionClasses.tableNameClass);
		timeComplexityLabel.textContent = timeComplexityName;
		timeComplexityWrapper.appendChild(timeComplexityLabel);

		const timeComplexitiesWrapper = document.createElement("div");
		timeComplexitiesWrapper.classList.add("col-8", AlgorithmDescriptionClasses.tableWrapperClass);
		timeComplexityWrapper.appendChild(timeComplexitiesWrapper);

		for (const complexity of timeComplexities) {
			const row = document.createElement("div");
			row.classList.add("row");

			const name = document.createElement("div");
			name.classList.add("col-6", AlgorithmDescriptionClasses.tableNameClass);
			name.textContent = complexity.name;

			const value = document.createElement("div");
			value.classList.add("col-6", AlgorithmDescriptionClasses.tableValueClass);
			value.innerHTML = complexity.value == undefined ? "?" : getComplexityOrComplexityRangeHTML(complexity.value);

			row.appendChild(name);
			row.appendChild(value);
			timeComplexitiesWrapper.appendChild(row);
		}

		const spacer = document.createElement("div");
		spacer.classList.add("col-0", `col-${propertiesLayoutBreakpoint}-1`, AlgorithmDescriptionClasses.spacerClass);
		propertiesWrapper.appendChild(spacer);

		const otherPropertiesWrapper = document.createElement("div");
		otherPropertiesWrapper.classList.add("col-12", `col-${propertiesLayoutBreakpoint}-5`, AlgorithmDescriptionClasses.tableWrapperClass);
		propertiesWrapper.appendChild(otherPropertiesWrapper);

		for (const property of otherProperties) {
			const row = document.createElement("div");
			row.classList.add("row");

			const name = document.createElement("div");
			name.classList.add("col-8", AlgorithmDescriptionClasses.tableNameClass);
			name.textContent = property.name;

			const value = document.createElement("div");
			value.classList.add("col-4", AlgorithmDescriptionClasses.tableValueClass);

			if (property instanceof ComplexityTableEntry) {
				value.innerHTML = property.value == undefined ? "?" : getComplexityOrComplexityRangeHTML(property.value);
			} else {
				value.textContent = getBooleanString(property.value);
			}

			row.appendChild(name);
			row.appendChild(value);
			otherPropertiesWrapper.appendChild(row);
		}

		return propertiesWrapper;
	}

	public open(): void {
		document.body.appendChild(this.dialog);
		document.body.classList.add("blur");
		this.dialog.showModal();
	}

	public close(): void {
		this.dialog.close();
	}
}