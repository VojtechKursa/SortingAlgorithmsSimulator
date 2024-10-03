import { ColorSet } from "../ColorSet";
import { PlayerElementContainer } from "../PlayerElementContainer";
import { PresetColor } from "../PresetColor";
import { PresetDefinition } from "../PresetDefinition";
import { PlayerController } from "../controllers/PlayerController";
import { SimulatorController } from "../controllers/SimulatorController";
import { SortingAlgorithm } from "../sorts/SortingAlgorithm";


function findOutputElement(id: string): SVGSVGElement {
    for (const element of document.getElementsByTagName("svg")) {
        if (element.id == id)
            return element;
    }

    throw new Error("Output element not found");
}

export function initSimulator(sortingAlgorithm: SortingAlgorithm, extraPresets?: PresetDefinition): SimulatorController {
    let playerElementContainer: PlayerElementContainer;
    {
        let back = document.getElementById("step_back") as HTMLButtonElement;
        let step = document.getElementById("step_id") as HTMLOutputElement;
        let next = document.getElementById("step_next") as HTMLButtonElement;
        let pause = document.getElementById("player_control_pause") as HTMLInputElement;
        let play = document.getElementById("player_control_play") as HTMLInputElement;
        let periodInput = document.getElementById("player_control_period") as HTMLInputElement;

        playerElementContainer = new PlayerElementContainer(back, step, next, pause, play, periodInput);
    }

    let debuggerElementContainer: PlayerElementContainer;
    {
        let backCode = document.getElementById("step_code_back") as HTMLButtonElement;
        let stepCode = document.getElementById("step_code_id") as HTMLOutputElement;
        let nextCode = document.getElementById("step_code_next") as HTMLButtonElement;
        let pauseCode = document.getElementById("player_control_code_pause") as HTMLInputElement;
        let playCode = document.getElementById("player_control_code_play") as HTMLInputElement;
        let periodInputCode = document.getElementById("player_control_code_period") as HTMLInputElement;

        debuggerElementContainer = new PlayerElementContainer(backCode, stepCode, nextCode, pauseCode, playCode, periodInputCode);
    }

    let reset = document.getElementById("button_reset") as HTMLButtonElement;

    let output = findOutputElement("canvas");
    let debug_view = document.getElementById("col_debugger") as HTMLDivElement;

    let colorMap = new Map<PresetColor, string>();
    colorMap.set(PresetColor.Highlight_1, "blue");
    colorMap.set(PresetColor.Highlight_2, "green");
    colorMap.set(PresetColor.Highlight_3, "red");
    colorMap.set(PresetColor.Sorted, "grey");
    colorMap.set(PresetColor.ElementOrderCorrect, "limegreen");
    colorMap.set(PresetColor.ElementOrderSwapped, "red");
    colorMap.set(PresetColor.CodeHighlight_1, "yellow");

    let colorSet = new ColorSet(colorMap, "white");

    let playerController = new PlayerController(colorSet, sortingAlgorithm, output, debug_view, null, playerElementContainer, debuggerElementContainer, reset);


    window.addEventListener("resize", _ => playerController.redraw());


    let presetSelect = document.getElementById("preset_select") as HTMLSelectElement;
    let presetSelectButton = document.getElementById("preset_load") as HTMLButtonElement;

    let numbersInput = document.getElementById("numbers_input") as HTMLInputElement;
    let numbersSet = document.getElementById("numbers_set") as HTMLButtonElement;

    sortingAlgorithm.getPseudocode().forEach((codeLine, lineNum) => {
        let line = document.createElement("div");
        line.classList.add("code-line");

        let header = document.createElement("div");
        header.classList.add("code-header");
        header.textContent = (lineNum + 1).toString();

        let text = document.createElement("div");
        text.classList.add("code-text")
        text.textContent = codeLine.replace(/\t/g, " ".repeat(4));

        line.appendChild(header);
        line.appendChild(text);

        debug_view.appendChild(line);
    });

    return new SimulatorController(playerController, presetSelect, presetSelectButton, numbersInput, numbersSet, extraPresets);
}