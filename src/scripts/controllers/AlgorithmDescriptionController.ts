import { Complexity, ComplexityRange } from "../../sortsConfigs/definitions/Complexity";
import { SortFamilyProperties } from "../../sortsConfigs/definitions/SortFamilyProperties";
import { SortProperties } from "../../sortsConfigs/definitions/SortProperties";
import { getBooleanString, getComplexityOrComplexityRangeHTML, getComplexityOrComplexityRangeString } from "../../sortsConfigs/definitions/SortPropertyHelpers";
import { ButtonFactory } from "../misc/ButtonFactory";
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

/**
 * Controller for dialog containing a detailed description of an algorithm or algorithms family.
 */
export class AlgorithmDescriptionController {
	private readonly dialog: HTMLDialogElement;

	public constructor(
		private readonly properties: SortFamilyProperties | SortProperties,
		private readonly generatePlayButton: boolean,
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

		const header = this.generateHeader();

		const propertiesWrapper = this.generateProperties();

		const description = this.generateDescription();

		this.dialog.appendChild(header);
		this.dialog.appendChild(propertiesWrapper);
		this.dialog.appendChild(description);
	}

	private generateHeader(): HTMLDivElement {
		const header = document.createElement("div");
		header.classList.add(AlgorithmDescriptionClasses.headerClass);

		const headerText = document.createElement("h2");
		headerText.textContent = this.properties.name;

		const buttonsWrapper = this.generateButtons();

		header.appendChild(headerText);
		header.appendChild(buttonsWrapper);

		return header;
	}

	private generateButtons(): HTMLDivElement {
		const buttonsWrapper = document.createElement("div");
		buttonsWrapper.classList.add(AlgorithmDescriptionClasses.buttonsWrapperClass);

		if (this.generatePlayButton) {
			const playButton = ButtonFactory.makeButtonWithIcon("play-fill", ["btn", "btn-outline-success"], false);
			playButton.href = `${this.properties.nameMachine}.html`;
			buttonsWrapper.appendChild(playButton);
		}

		const closeButton = ButtonFactory.makeButtonWithIcon("x-lg", ["btn", "btn-outline-danger"]);
		buttonsWrapper.appendChild(closeButton);

		closeButton.addEventListener("click", () => this.close());

		return buttonsWrapper;
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
		propertiesWrapper.classList.add(AlgorithmDescriptionClasses.propertiesClass);

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
		timeComplexityWrapper.classList.add(AlgorithmDescriptionClasses.tableWrapperOuterClass);
		propertiesWrapper.appendChild(timeComplexityWrapper);

		const timeComplexityLabel = document.createElement("div");
		timeComplexityLabel.classList.add(AlgorithmDescriptionClasses.tableNameClass);
		timeComplexityLabel.textContent = timeComplexityName;
		timeComplexityWrapper.appendChild(timeComplexityLabel);

		const timeComplexitiesWrapper = document.createElement("div");
		timeComplexitiesWrapper.classList.add(AlgorithmDescriptionClasses.tableWrapperClass);
		timeComplexityWrapper.appendChild(timeComplexitiesWrapper);

		for (const complexity of timeComplexities) {
			const row = document.createElement("div");
			row.classList.add(AlgorithmDescriptionClasses.tableEntryClass);

			const name = document.createElement("div");
			name.classList.add(AlgorithmDescriptionClasses.tableNameClass);
			name.textContent = complexity.name;

			const value = document.createElement("div");
			value.classList.add(AlgorithmDescriptionClasses.tableValueClass);
			value.innerHTML = complexity.value == undefined ? "?" : getComplexityOrComplexityRangeHTML(complexity.value);

			row.appendChild(name);
			row.appendChild(value);
			timeComplexitiesWrapper.appendChild(row);
		}

		const otherPropertiesWrapper = document.createElement("div");
		otherPropertiesWrapper.classList.add(AlgorithmDescriptionClasses.tableWrapperClass);
		propertiesWrapper.appendChild(otherPropertiesWrapper);

		for (const property of otherProperties) {
			const row = document.createElement("div");
			row.classList.add(AlgorithmDescriptionClasses.tableEntryClass);

			const name = document.createElement("div");
			name.classList.add(AlgorithmDescriptionClasses.tableNameClass);
			name.textContent = property.name;

			const value = document.createElement("div");
			value.classList.add(AlgorithmDescriptionClasses.tableValueClass);

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

	/**
	 * Opens the dialog controlled by this controller.
	 */
	public open(): void {
		document.body.appendChild(this.dialog);
		document.body.classList.add("blur");
		this.dialog.showModal();
	}

	/**
	 * Closes the dialog controlled by this controller.
	 */
	public close(): void {
		this.dialog.close();
	}
}