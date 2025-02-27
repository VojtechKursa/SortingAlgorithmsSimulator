import { PlayerController } from "../controllers/PlayerController";
import { SimulatorPageController } from "../controllers/SimulatorPageController";
import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { RendererControlElements } from "../data/collections/htmlElementCollections/RendererControlElements";
import { DebuggerControlElements } from "../data/collections/htmlElementCollections/DebuggerControlElements";
import { InputPreset } from "../input/presets/InputPreset";
import { InputController } from "../controllers/InputController";
import { StepDescriptionController } from "../controllers/StepDescriptionController";
import { ContinuousControlController } from "../controllers/ContinuousControlController";
import { SvgArrayBoxRenderer } from "../visualization/rendering/svg/SvgArrayBoxRenderer";
import { PageColors } from "../visualization/colors/PageColors";
import { CallStackController } from "../controllers/CallStackController";
import { DebuggerController } from "../controllers/DebuggerController";
import { HtmlCallStackDisplayHandler } from "../visualization/rendering/html/HtmlCallStackDisplayHandler";
import { HtmlVariableWatchDisplayHandler } from "../visualization/rendering/html/HtmlVariableWatchDisplayHandler";
import { VariableWatchController } from "../controllers/VariableWatchController";
import { HtmlDebuggerDisplayHandler } from "../visualization/rendering/html/HtmlDebuggerDisplayHandler";
import { HtmlDescriptionDisplayHandler } from "../visualization/rendering/html/HtmlDescriptionDisplayHandler";
import { CollapseWrappers } from "../data/collections/htmlElementCollections/CollapseWrappers";
import { initCommon } from "./common";
import { StepKindController } from "../controllers/StepKindController";
import { KeyboardSettings } from "../keyboard/KeyboardSettings";
import { HtmlSvgDisplayHandler } from "../visualization/rendering/html/HtmlSvgDisplayHandler";
import { StepDisplayHandler } from "../visualization/rendering/StepDisplayHandler";



export function initSimulator(sortingAlgorithm: SortingAlgorithm, extraPresets?: InputPreset[]): SimulatorPageController {
	const initCommonResult = initCommon();
	const darkModeHandler = initCommonResult.darkModeHandler;

	let playerController: PlayerController;
	let callStackController: CallStackController;
	{
		let playerElementContainer: RendererControlElements;
		{
			let backAlgorithmic = document.getElementById("step-back-algorithmic") as HTMLButtonElement;
			let backSignificant = document.getElementById("step-back-significant") as HTMLButtonElement;
			let step = document.getElementById("step_id") as HTMLDivElement;
			let nextSignificant = document.getElementById("step-next-significant") as HTMLButtonElement;
			let nextAlgorithmic = document.getElementById("step-next-algorithmic") as HTMLButtonElement;
			let beginning = document.getElementById("step-beginning") as HTMLButtonElement;
			let end = document.getElementById("step-end") as HTMLButtonElement;

			playerElementContainer = new RendererControlElements(backAlgorithmic, nextAlgorithmic, backSignificant, nextSignificant, beginning, end, step);
		}

		let debuggerElementContainer: DebuggerControlElements;
		{
			let backCode = document.getElementById("step-back-code") as HTMLButtonElement;
			let stepCode = document.getElementById("step_id-code") as HTMLOutputElement;
			let nextCode = document.getElementById("step-next-code") as HTMLButtonElement;

			debuggerElementContainer = new DebuggerControlElements(backCode, nextCode, stepCode);
		}

		let stepKindController: StepKindController;
		{
			let radioWrapper = document.getElementById("step_kind_selector") as HTMLDivElement;

			stepKindController = new StepKindController(radioWrapper);
		}

		let continuousControl: ContinuousControlController;
		{
			let periodInput = document.getElementById("player_control-period") as HTMLInputElement;
			let pauseButton = document.getElementById("player_control-pause") as HTMLInputElement;
			let playButton = document.getElementById("player_control-play") as HTMLInputElement;

			continuousControl = new ContinuousControlController(periodInput, pauseButton, playButton, stepKindController);
		}

		let output = ((document.getElementById("canvas") as any) as SVGSVGElement);

		let debug_view = document.getElementById("debugger") as HTMLDivElement;
		let debuggerController = new DebuggerController(debug_view);

		let reset = document.getElementById("reset_simulator") as HTMLButtonElement;
		let colors = PageColors.load();

		let stepDescriptionElement = document.getElementById("step_description") as HTMLDivElement;
		let stepDescriptionController = new StepDescriptionController(stepDescriptionElement);

		let variableWatchElement = document.getElementById("variable_watch-body") as HTMLDivElement;

		let callStackWrapper = document.getElementById("call_stack-hide_wrapper") as HTMLDivElement;
		callStackController = new CallStackController(callStackWrapper);


		let svgBoxesRenderer = new SvgArrayBoxRenderer(colors.currentColorSet, false, false);

		let renderers = [svgBoxesRenderer];

		let svgDisplayVisitor = new HtmlSvgDisplayHandler(svgBoxesRenderer, output);

		let displayHandlers: StepDisplayHandler[] = [
			new HtmlDescriptionDisplayHandler(stepDescriptionController),
			new HtmlCallStackDisplayHandler(callStackController),
			new HtmlVariableWatchDisplayHandler(new VariableWatchController(variableWatchElement)),
			new HtmlDebuggerDisplayHandler(debuggerController),
		];

		playerController = new PlayerController(
			sortingAlgorithm,
			playerElementContainer,
			debuggerElementContainer,
			debuggerController,
			continuousControl,
			stepKindController,
			displayHandlers,
			svgDisplayVisitor,
			renderers,
			colors,
			reset
		);
	}

	window.addEventListener("load", _ => {
		// Ensure correct theme is selected
		playerController.setDarkMode(document.body.getAttribute("data-bs-theme") === "dark");

		// Initial render
		playerController.draw();
	});

	let inputController: InputController;
	{
		let body = document.getElementsByTagName("body")[0];
		let inputDialog = document.getElementById("dialog-input") as HTMLDialogElement;
		let inputDialogOpenButton = document.getElementById("dialog-input-show") as HTMLButtonElement;
		let inputDialogMethodSelector = document.getElementById("dialog-input-method") as HTMLSelectElement;
		let inputDialogMethodArea = document.getElementById("dialog-input-method_area") as HTMLDivElement;
		let inputDialogOkButton = document.getElementById("dialog-input-ok") as HTMLButtonElement;
		let inputDialogCloseButton = document.getElementById("dialog-input-close") as HTMLButtonElement;

		inputController = new InputController(playerController, body, inputDialog, inputDialogOpenButton, inputDialogMethodSelector, inputDialogMethodArea, inputDialogOkButton, inputDialogCloseButton, extraPresets);
	}

	let simulatorPageController: SimulatorPageController;
	{
		let debuggerCollapseWrapper = document.getElementById("debugger_collection") as HTMLDivElement;
		let variableWatchCollapseWrapper = document.getElementById("variable_watch-collapse_wrapper") as HTMLDivElement;
		let callStackCollapseWrapper = document.getElementById("call_stack-collapse_wrapper") as HTMLDivElement;
		let collapseWrappers = new CollapseWrappers(debuggerCollapseWrapper, variableWatchCollapseWrapper, callStackCollapseWrapper);

		let debuggerCollapseButton = document.getElementById("button_hide_debugger") as HTMLButtonElement;

		let settingsOpenButton = document.getElementById("settings-open") as HTMLButtonElement;

		simulatorPageController = new SimulatorPageController(
			playerController,
			inputController,
			collapseWrappers,
			debuggerCollapseButton,
			callStackController,
			settingsOpenButton,
			darkModeHandler,
			KeyboardSettings.load(true)
		);
	}

	return simulatorPageController;
}