import { IndexPageController } from "../controllers/IndexPageController";
import { initCommon } from "./common";

document.addEventListener("DOMContentLoaded", () => {
	initCommon();
	initIndex();
});

function initIndex() {
	const tableModeButton = document.getElementById("display_mode-table") as HTMLButtonElement;
	const tableWrapper = document.getElementById("table_container") as HTMLDivElement;

	const gridModeButton = document.getElementById("display_mode-grid") as HTMLButtonElement;
	const gridWrapper = document.getElementById("card_container") as HTMLDivElement;

	return new IndexPageController(tableModeButton, tableWrapper, gridModeButton, gridWrapper);
}