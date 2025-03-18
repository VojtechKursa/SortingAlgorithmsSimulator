import { SortFamilyProperties } from "../../sortsConfigs/definitions/SortFamilyProperties";
import { SortProperties } from "../../sortsConfigs/definitions/SortProperties";

export class AlgorithmDescriptionController {
	private readonly dialog: HTMLDialogElement;

	public constructor(
		private readonly properties: SortFamilyProperties | SortProperties
	) {
		this.dialog = document.createElement("dialog");

		this.dialog.addEventListener("close", () => {
			document.body.classList.remove("blur");
			document.body.removeChild(this.dialog);
		});
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