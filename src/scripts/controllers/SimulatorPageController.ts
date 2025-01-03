import { DarkModeHandler } from "./DarkModeHandler";
import { InputController } from "./InputController";
import { PlayerController } from "./PlayerController";

export class SimulatorPageController {
	public constructor(
		private readonly playerController: PlayerController,
		private readonly inputController: InputController,
		private readonly settingsOpenButton: HTMLButtonElement,
		darkModeHandler: DarkModeHandler
	)
	{
		darkModeHandler.addEventHandler(dark => {
			playerController.setDarkMode(dark);
		});
	}
}