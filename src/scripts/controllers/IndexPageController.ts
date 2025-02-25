import { hiddenClass } from "../visualization/css/GenericClasses";

/**
 * Controller class for managing the index page.
 */
export class IndexPageController {
	/**
	 * @param tableModeButton - The button element used to switch to table mode.
	 * @param tableWrapper - The div element that wraps the table mode content.
	 * @param gridModeButton - The button element used to switch to grid mode.
	 * @param gridWrapper - The div element that wraps the grid mode content.
	 */
	public constructor(
		private readonly tableModeButton: HTMLButtonElement,
		private readonly tableWrapper: HTMLDivElement,
		private readonly gridModeButton: HTMLButtonElement,
		private readonly gridWrapper: HTMLDivElement
	) {
		tableModeButton.addEventListener("click", () => {
			tableWrapper.classList.remove(hiddenClass);
			gridWrapper.classList.add(hiddenClass);

			tableModeButton.classList.add("active");
			gridModeButton.classList.remove("active");
		});

		gridModeButton.addEventListener("click", () => {
			gridWrapper.classList.remove(hiddenClass);
			tableWrapper.classList.add(hiddenClass);

			tableModeButton.classList.remove("active");
			gridModeButton.classList.add("active");
		});

		tableModeButton.click();
	}
}