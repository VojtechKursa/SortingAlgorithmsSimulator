import { PlayerController } from "./PlayerController";

export class SimulatorController {
    private playerController: PlayerController;

    private presetSelect: HTMLSelectElement;
    private inputElement: HTMLInputElement;

    private extraPresets?: Map<string, number[] | ((length: number) => number[])>

    public constructor(
        playerController: PlayerController,
        presetSelect: HTMLSelectElement,
        presetLoadButton: HTMLButtonElement,
        inputElement: HTMLInputElement,
        inputSetButton: HTMLButtonElement,
        extraPresets?: Map<string, Array<number>>
    ) {
        this.playerController = playerController;
        this.presetSelect = presetSelect;
        this.inputElement = inputElement;
        this.extraPresets = extraPresets;

        SimulatorController.addDefaultPresets(this.presetSelect);

        if(extraPresets != undefined) {
            for (const key in extraPresets.keys()) {
                let optionElement = document.createElement("option");

                optionElement.text = key;
                optionElement.value = key;

                this.presetSelect.add(optionElement);
            }
        }

        presetLoadButton.addEventListener("click", this.presetLoadButtonHandler);
        inputSetButton.addEventListener("click", _ => {
            let newInput = new Array<number>();

            // TO DO: Input filtering
            this.inputElement.value.split(",").forEach(item => {
                newInput.push(Number.parseInt(item.trim()));
            });

            this.playerController.setInput(newInput);
        });
    }

    private presetLoadButtonHandler(_: MouseEvent) {
        const generatedNumbers = 10;

        let newInput: number[] | null = null;

        switch (this.presetSelect.value) {
            case "random":
                newInput = new Array(generatedNumbers);
                const maxRandom = 50;

                for(let i = 0; i < newInput.length; i++) {
                    newInput[i] = Math.random() * maxRandom;
                }

                break;
            case "sorted":
                newInput = new Array(generatedNumbers);

                for(let i = 0; i < newInput.length; i++) {
                    newInput[i] = i;
                }

                break;
            case "reversed":
                newInput = new Array(generatedNumbers);

                for(let i = 0; i < newInput.length; i++) {
                    newInput[i] = newInput.length - i;
                }
                
                break;
            default:
                if(this.extraPresets != undefined) {
                    let numbers = this.extraPresets.get(this.presetSelect.value);

                    if (numbers != undefined) {
                        if(typeof numbers === "function") {
                            newInput = numbers(generatedNumbers);
                        }
                        else {
                            newInput = numbers;
                        }
                    }
                }
                break;
        }

        if(newInput != null) {
            this.playerController.setInput(newInput);
        }
    }

    private static addDefaultPresets(presetSelectElement: HTMLSelectElement) {
        let random = document.createElement("option");
        random.text = "Random";
        random.value = "random";
        random.selected = true;

        let sorted = document.createElement("option");
        sorted.text = "Sorted";
        sorted.value = "sorted";

        let reversed = document.createElement("option");
        reversed.text = "Reversed";
        reversed.value = "reversed";

        presetSelectElement.add(random);
        presetSelectElement.add(sorted);
        presetSelectElement.add(reversed);
    }
}