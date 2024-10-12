import { InputController } from "./InputController";
import { PlayerController } from "./PlayerController";

export class SimulatorPageController {
    private playerController: PlayerController;
    private inputController: InputController;

    private settingsOpenButton: HTMLButtonElement;

    public constructor(
        playerController: PlayerController,
        inputController: InputController,
        settingsOpenButton: HTMLButtonElement,
    ) {
        this.playerController = playerController;
        this.inputController = inputController;
        
        this.settingsOpenButton = settingsOpenButton;
    }

    /*
    private inputSetButtonHandler(): void {
        let newInput = new Array<number>();

        let text = this.inputElement.value;

        if (text.match(/^(?:\d+,)*\d+$/i)) {
            text.split(",").forEach(item => {
                newInput.push(Number.parseInt(item.trim()));
            });

            this.playerController.setInput(newInput);

            this.inputElement.classList.remove("wrong");
        }
        else {
            this.inputElement.classList.add("wrong");
        }
    }
    */
}