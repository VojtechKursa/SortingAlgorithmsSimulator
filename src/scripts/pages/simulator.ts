import { ColorSet } from "../visualization/ColorSet";
import { PlayerController } from "../controllers/PlayerController";
import { SimulatorPageController } from "../controllers/SimulatorPageController";
import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { RendererControlElements } from "../data/collections/htmlElementCollections/RendererControlElements";
import { DebuggerControlElements } from "../data/collections/htmlElementCollections/DebuggerControlElements";
import { InputPreset } from "../input/presets/InputPreset";
import { InputController } from "../controllers/InputController";
import { StepDescriptionController } from "../controllers/StepDescriptionController";
import { SimulatorOutputElements } from "../data/collections/htmlElementCollections/SimulatorOutputElements";
import { ContinuousControlElements } from "../data/collections/htmlElementCollections/ContinuousControlElements";
import { RendererHighlight } from "../visualization/Highlights";
import { SvgRenderingVisitor } from "../visualization/rendering/SvgRenderingVisitor";



export function initSimulator(sortingAlgorithm: SortingAlgorithm, extraPresets?: InputPreset[]): SimulatorPageController {
	let debug_view = document.getElementById("debugger") as HTMLDivElement;

	let playerController: PlayerController;
	{
		let playerElementContainer: RendererControlElements;
		{
			let back = document.getElementById("step_back") as HTMLButtonElement;
			let backSub = document.getElementById("step_back_sub") as HTMLButtonElement;
			let step = document.getElementById("step_id") as HTMLDivElement;
			let nextSub = document.getElementById("step_next_sub") as HTMLButtonElement;
			let next = document.getElementById("step_next") as HTMLButtonElement;
			let beginning = document.getElementById("step_beginning") as HTMLButtonElement;
			let end = document.getElementById("step_end") as HTMLButtonElement;

			playerElementContainer = new RendererControlElements(back, next, backSub, nextSub, beginning, end, step);
		}

		let debuggerElementContainer: DebuggerControlElements;
		{
			let backCode = document.getElementById("step_code_back") as HTMLButtonElement;
			let stepCode = document.getElementById("step_code_id") as HTMLOutputElement;
			let nextCode = document.getElementById("step_code_next") as HTMLButtonElement;

			debuggerElementContainer = new DebuggerControlElements(backCode, nextCode, stepCode);
		}

		let continuousControlElements: ContinuousControlElements;
		{
			let periodInput = document.getElementById("player_control_period") as HTMLInputElement;
			let pauseButton = document.getElementById("player_control_pause") as HTMLInputElement;
			let playButton = document.getElementById("player_control_play") as HTMLInputElement;
			let radioWrapper = document.getElementById("continuous_control-kind-wrapper") as HTMLDivElement;

			continuousControlElements = new ContinuousControlElements(periodInput, pauseButton, playButton, radioWrapper);
		}

		let output = ((document.getElementById("canvas") as any) as SVGSVGElement);
		let debug_view = document.getElementById("debugger") as HTMLDivElement;

		let reset = document.getElementById("button_reset") as HTMLButtonElement;
		let colorMap = new Map<RendererHighlight, string>();
		colorMap.set(RendererHighlight.Highlight_1, "blue");
		colorMap.set(RendererHighlight.Highlight_2, "green");
		colorMap.set(RendererHighlight.Highlight_3, "red");
		colorMap.set(RendererHighlight.Sorted, "grey");
		colorMap.set(RendererHighlight.ElementOrderCorrect, "limegreen");
		colorMap.set(RendererHighlight.ElementOrderSwapped, "red");

		let colorSet = new ColorSet(colorMap, "white");

		let stepDescriptionElement = document.getElementById("step_description") as HTMLDivElement;
		let stepDescriptionController = new StepDescriptionController(stepDescriptionElement);

		let variableWatchElement = document.getElementById("variable_watch_body") as HTMLDivElement;

		let simulatorOutputElements = new SimulatorOutputElements(output, debug_view, variableWatchElement, stepDescriptionController);

		let renderer = new SvgRenderingVisitor(colorSet, simulatorOutputElements);

		playerController = new PlayerController(sortingAlgorithm, simulatorOutputElements, playerElementContainer, debuggerElementContainer, continuousControlElements, renderer, reset);
	}

	let inputController: InputController;
	{
		let body = document.getElementsByTagName("body")[0];
		let inputDialog = document.getElementById("dialog_input") as HTMLDialogElement;
		let inputDialogOpenButton = document.getElementById("button_show_dialog_input") as HTMLButtonElement;
		let inputDialogMethodSelector = document.getElementById("dialog_input-method") as HTMLSelectElement;
		let inputDialogMethodArea = document.getElementById("dialog_input-method_area") as HTMLDivElement;
		let inputDialogOkButton = document.getElementById("dialog_input_ok_button") as HTMLButtonElement;
		let inputDialogCloseButton = document.getElementById("dialog_input_close_button") as HTMLButtonElement;

		inputController = new InputController(playerController, body, inputDialog, inputDialogOpenButton, inputDialogMethodSelector, inputDialogMethodArea, inputDialogOkButton, inputDialogCloseButton, extraPresets);
	}

	let simulatorPageController: SimulatorPageController;
	{
		let settingsOpenButton = document.getElementById("settings_open") as HTMLButtonElement;

		simulatorPageController = new SimulatorPageController(playerController, inputController, settingsOpenButton);
	}

	window.addEventListener("load", _ => playerController.draw());    // ensure the first drawing is correct
	window.addEventListener("resize", _ => playerController.redraw());

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

	return simulatorPageController;
}