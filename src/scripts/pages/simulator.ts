import { PlayerController } from "../controllers/PlayerController";
import { SimulatorPageController } from "../controllers/SimulatorPageController";
import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { RendererControlElements } from "../data/collections/htmlElementCollections/RendererControlElements";
import { DebuggerControlElements } from "../data/collections/htmlElementCollections/DebuggerControlElements";
import { InputPreset } from "../input/presets/InputPreset";
import { InputController } from "../controllers/InputController";
import { StepDescriptionController } from "../controllers/StepDescriptionController";
import { ContinuousControlController } from "../controllers/ContinuousControlController";
import { SvgArrayRenderVisitor } from "../visualization/rendering/SvgArrayRenderVisitor";
import { PageColors } from "../visualization/colors/PageColors";
import { DarkModeHandler } from "../controllers/DarkModeHandler";
import { CallStackController } from "../controllers/CallStackController";
import { DebuggerController } from "../controllers/DebuggerController";
import { HtmlCallStackDisplayVisitor } from "../visualization/rendering/HtmlCallStackDisplayVisitor";
import { HtmlVariableWatchDisplayVisitor } from "../visualization/rendering/HtmlVariableWatchDisplayVisitor";
import { VariableWatchController } from "../controllers/VariableWatchController";
import { HtmlDebuggerDisplayVisitor } from "../visualization/rendering/HtmlDebuggerDisplayVisitor";
import { HtmlDescriptionDisplayVisitor } from "../visualization/rendering/HtmlDescriptionDisplayVisitor";



export function initSimulator(sortingAlgorithm: SortingAlgorithm, extraPresets?: InputPreset[]): SimulatorPageController {
	let playerController: PlayerController;
	let callStackController: CallStackController;
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

		let continuousControlElements: ContinuousControlController;
		{
			let periodInput = document.getElementById("player_control_period") as HTMLInputElement;
			let pauseButton = document.getElementById("player_control_pause") as HTMLInputElement;
			let playButton = document.getElementById("player_control_play") as HTMLInputElement;
			let radioWrapper = document.getElementById("continuous_control-kind-wrapper") as HTMLDivElement;

			continuousControlElements = new ContinuousControlController(periodInput, pauseButton, playButton, radioWrapper);
		}

		let output = ((document.getElementById("canvas") as any) as SVGSVGElement);

		let debug_view = document.getElementById("debugger") as HTMLDivElement;
		let debuggerController = new DebuggerController(debug_view);

		let reset = document.getElementById("button_reset") as HTMLButtonElement;
		let colors = PageColors.load();

		let stepDescriptionElement = document.getElementById("step_description") as HTMLDivElement;
		let stepDescriptionController = new StepDescriptionController(stepDescriptionElement);

		let variableWatchElement = document.getElementById("variable_watch_body") as HTMLDivElement;

		let callStackWrapper = document.getElementById("call_stack_outer_wrapper") as HTMLDivElement;
		callStackController = new CallStackController(callStackWrapper);

		let svgRenderingVisitor = new SvgArrayRenderVisitor(colors.currentColorSet, output, false, false, null);
		let descriptionVisitor = new HtmlDescriptionDisplayVisitor(stepDescriptionController, svgRenderingVisitor);
		let callStackVisitor = new HtmlCallStackDisplayVisitor(callStackController, descriptionVisitor);
		let variableWatchVisitor = new HtmlVariableWatchDisplayVisitor(new VariableWatchController(variableWatchElement), callStackVisitor);
		let debuggerVisitor = new HtmlDebuggerDisplayVisitor(debuggerController, variableWatchVisitor);

		playerController = new PlayerController(sortingAlgorithm, playerElementContainer, debuggerElementContainer, debuggerController, continuousControlElements, debuggerVisitor, colors, reset);

		window.addEventListener("load", _ => {
			playerController.draw();
			playerController.redraw();	// ensure the first drawing is correct
		});
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
		let debuggerColumn = document.getElementById("col_debugger") as HTMLDivElement;
		let settingsOpenButton = document.getElementById("settings_open") as HTMLButtonElement;
		let darkModeButton = document.getElementById("dark_mode") as HTMLButtonElement;
		let darkModeHandler = new DarkModeHandler(darkModeButton);

		simulatorPageController = new SimulatorPageController(playerController, inputController, debuggerColumn, callStackController, settingsOpenButton, darkModeHandler);
	}

	return simulatorPageController;
}