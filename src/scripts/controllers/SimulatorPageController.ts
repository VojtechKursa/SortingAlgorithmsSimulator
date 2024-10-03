import { InputPresetDefinition } from "../InputPresetDefinition";
import { PlayerController } from "./PlayerController";

export class SimulatorPageController {
    private playerController: PlayerController;

    private presetSelect: HTMLSelectElement;
    private inputElement: HTMLInputElement;

    private presets: InputPresetDefinition;

    public constructor(
        playerController: PlayerController,
        presetSelect: HTMLSelectElement,
        presetLoadButton: HTMLButtonElement,
        inputElement: HTMLInputElement,
        inputSetButton: HTMLButtonElement,
        extraPresets?: InputPresetDefinition
    ) {
        this.playerController = playerController;
        this.presetSelect = presetSelect;
        this.inputElement = inputElement;
        this.presets = new Map<string, Array<number> | ((length: number) => number[])>(SimulatorPageController.getDefaultPresets());

        if (extraPresets) {
            for (const key of extraPresets.keys()) {
                let val = extraPresets.get(key);

                if (val)
                    this.presets.set(key, val);
            }
        }



        for (const key of this.presets.keys()) {
            let optionElement = document.createElement("option");

            optionElement.text = key;
            optionElement.value = key;

            this.presetSelect.add(optionElement);
        }



        presetLoadButton.addEventListener("click", _ => this.presetLoadButtonHandler());
        inputSetButton.addEventListener("click", _ => this.inputSetButtonHandler());

        presetLoadButton.click();
    }

    private presetLoadButtonHandler(): void {
        const generatedNumbers = 10;

        let newInput: number[] | null = null;

        let numbers = this.presets.get(this.presetSelect.value);

        if (numbers != undefined) {
            if (typeof numbers === "function") {
                newInput = numbers(generatedNumbers);
            }
            else {
                newInput = numbers;
            }
        }

        if (newInput != null) {
            this.playerController.setInput(newInput);
        }
    }

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

    private static getDefaultPresets(): InputPresetDefinition {
        let result: InputPresetDefinition = new Map<string, (number[] | ((length: number) => number[]))>();

        result.set("Random", amount => {
            let ret = new Array(amount);
            const maxRandom = 50;

            for (let i = 0; i < ret.length; i++) {
                ret[i] = Math.floor(Math.random() * maxRandom);
            }

            return ret;
        });

        result.set("Sorted", amount => {
            let newInput = new Array(amount);

            for (let i = 0; i < newInput.length; i++) {
                newInput[i] = i;
            }

            return newInput;
        });

        result.set("Reversed", amount => {
            let newInput = new Array(amount);

            for (let i = 0; i < newInput.length; i++) {
                newInput[i] = newInput.length - i;
            }

            return newInput;
        });

        return result;
    }
}