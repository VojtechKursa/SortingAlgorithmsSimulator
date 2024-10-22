import { InputController } from "./InputController";
import { PlayerController } from "./PlayerController";

export class SimulatorPageController {
    public constructor(
        private readonly playerController: PlayerController,
        private readonly inputController: InputController,
        private readonly settingsOpenButton: HTMLButtonElement,
    ) { }
}