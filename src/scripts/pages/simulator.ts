import { ColorSet } from "../ColorSet";
import { PresetColor } from "../PresetColor";
import { PlayerController } from "../controllers/PlayerController";
import { PresetDefinition, SimulatorController } from "../controllers/SimulatorController";
import { SortingAlgorithm } from "../sorts/SortingAlgorithm";



export function initSimulator(sortingAlgorithm: SortingAlgorithm, extraPresets?: PresetDefinition): SimulatorController {
    let back = document.getElementById("step_back") as HTMLButtonElement;
    let step = document.getElementById("step_id") as HTMLOutputElement;
    let next = document.getElementById("step_next") as HTMLButtonElement;
    let pause = document.getElementById("player_control_pause") as HTMLInputElement;
    let play = document.getElementById("player_control_play") as HTMLInputElement;
    let periodInput = document.getElementById("player_control_period") as HTMLInputElement;
    let reset = document.getElementById("button_reset") as HTMLButtonElement;

    let output = document.getElementById("canvas") as HTMLElement;

    let colorMap = new Map<PresetColor, string>();
    colorMap.set(PresetColor.Highlight_1, "blue");
    colorMap.set(PresetColor.Highlight_2, "green");
    colorMap.set(PresetColor.Highlight_3, "red");
    colorMap.set(PresetColor.Sorted, "grey");
    colorMap.set(PresetColor.CodeHighlight_1, "yellow");

    let colorSet = new ColorSet(colorMap, "white");

    let playerController = new PlayerController(output, colorSet, sortingAlgorithm, back, next, step, play, pause, periodInput, reset);


    window.addEventListener("resize", _ => playerController.redraw());


    let presetSelect = document.getElementById("preset_select") as HTMLSelectElement;
    let presetSelectButton = document.getElementById("preset_load") as HTMLButtonElement;

    let numbersInput = document.getElementById("numbers_input") as HTMLInputElement;
    let numbersSet = document.getElementById("numbers_set") as HTMLButtonElement;

    return new SimulatorController(playerController, presetSelect, presetSelectButton, numbersInput, numbersSet, extraPresets);
}