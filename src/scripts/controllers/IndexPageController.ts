import sortFamilies from "../../sortsConfigs/sortFamilies";
import { hiddenClass } from "../visualization/css/GenericClasses";
import { AlgorithmDescriptionController } from "./AlgorithmDescriptionController";

/**
 * Controller class for managing the index page.
 */
export class IndexPageController {
	private static readonly sortFamilyData = "data-sort-family";
	private static readonly sortAlgorithmData = "data-sort-algorithm";

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

		const descriptionTriggers = document.querySelectorAll(`[${IndexPageController.sortFamilyData}],[${IndexPageController.sortAlgorithmData}]`);
		for (const trigger of descriptionTriggers) {
			trigger.addEventListener("click", ev => {
				ev.preventDefault();
				const familyName = trigger.getAttribute(IndexPageController.sortFamilyData);
				console.log("Family name", familyName);
				if (familyName != null) {
					const properties = sortFamilies.find(family => family.nameMachine == familyName);
					if (properties != undefined) {
						new AlgorithmDescriptionController(properties).open();
					}
					return;
				}

				const algorithmName = trigger.getAttribute(IndexPageController.sortAlgorithmData);
				console.log("Algorithm name", algorithmName);
				if (algorithmName != null) {
					const allAlgorithms = sortFamilies.map(family => family.sorts).flat();
					const properties = allAlgorithms.find(algorithm => algorithm.nameMachine == algorithmName);
					if (properties != undefined) {
						new AlgorithmDescriptionController(properties).open();
					}
					return;
				}
			});
		}
	}
}