import { hiddenClass } from "../visualization/CssInterface";

export class IndexPageController {
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