import { SortFamilyProperties } from "../../sortsConfigs/definitions/SortFamilyProperties";
import { SortProperties } from "../../sortsConfigs/definitions/SortProperties";
import { AlgorithmDescriptionClasses } from "../visualization/css/AlgorithmDescriptionClasses";

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

		const description = document.createElement("div");
		description.classList.add(AlgorithmDescriptionClasses.descriptionClass);
		description.textContent = this.properties.longDescription;

		const closeButton = document.createElement("button");
		closeButton.textContent="Close";
		closeButton.classList.add("btn", "btn-primary");

		this.dialog.appendChild(header);
		this.dialog.appendChild(propertiesWrapper);
		this.dialog.appendChild(description);
		this.dialog.appendChild(closeButton);

		closeButton.addEventListener("click", () => this.close());
	}

	private generateProperties(): HTMLDivElement {
		const propertiesWrapper = document.createElement("div");
		propertiesWrapper.classList.add(AlgorithmDescriptionClasses.propertiesClass);

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