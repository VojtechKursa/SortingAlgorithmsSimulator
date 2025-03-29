import { PlayerController } from "../controllers/PlayerController";
import { SimulatorPageController } from "../controllers/SimulatorPageController";
import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { InputPreset } from "../input/presets/InputPreset";
import { InputController } from "../controllers/InputController";
import { StepDescriptionController } from "../controllers/StepDescriptionController";
import { ContinuousControlController } from "../controllers/ContinuousControlController";
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
import { StepController } from "../controllers/StepController";
import { VisualizationOptionsController } from "../controllers/VisualizationOptionsController";
import { SvgRenderer } from "../visualization/rendering/SvgRenderer";
import { ColorMap } from "../visualization/colors/ColorMap";
import { SvgArrayBoxRenderer } from "../visualization/rendering/svg/SvgArrayBoxRenderer";
import { SvgArrayBarChartRenderer } from "../visualization/rendering/svg/SvgBarChartRenderer";



export function getCurrentColorMap(): ColorMap {
	initCommon();

	let colors = PageColors.load();
	if (colors == null) {
		colors = PageColors.getDefault();
	}

	return colors.currentColorMap;
}

export function getDefaultRenderers(colorMap: ColorMap): SvgRenderer[] {
	const boxRenderer = new SvgArrayBoxRenderer(colorMap);
	const barChartRenderer = new SvgArrayBarChartRenderer(colorMap);

	return [barChartRenderer, boxRenderer];
}

export function initSimulator(
	sortingAlgorithm: SortingAlgorithm,
	defaultRenderer: SvgRenderer | undefined = undefined,
	availableRenderers: SvgRenderer[] | undefined = undefined,
	extraPresets: InputPreset[] | undefined = undefined,
): SimulatorPageController {
	const initCommonResult = initCommon();
	const darkModeHandler = initCommonResult.darkModeHandler;

	let playerController: PlayerController;
	let callStackController: CallStackController;
	let visualizationOptionsWrapper: HTMLDivElement;
	{
		let stepController: StepController;
		{
			let rendererStepControllerWrapper = document.getElementById("stepping") as HTMLDivElement;
			let debuggerStepControllerWrapper = document.getElementById("stepping_code") as HTMLDivElement;

			stepController = new StepController(rendererStepControllerWrapper, debuggerStepControllerWrapper);
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
		if (colors == null) {
			colors = PageColors.getDefault();
			colors.save();
			document.body.setAttribute("data-bs-theme", "dark");
		}

		if (defaultRenderer == undefined || availableRenderers == undefined) {
			const defaultRenderers = getDefaultRenderers(colors.currentColorMap);

			if (defaultRenderer == undefined) {
				if (availableRenderers != undefined && availableRenderers.length > 0) {
					defaultRenderer = availableRenderers[0];
				} else {
					defaultRenderer = defaultRenderers[0];
				}
			}

			if (availableRenderers == undefined) {
				availableRenderers = defaultRenderers;
			}
		}

		let stepDescriptionElement = document.getElementById("step_description") as HTMLDivElement;
		let stepDescriptionController = new StepDescriptionController(stepDescriptionElement);

		let variableWatchElement = document.getElementById("variable_watch-body") as HTMLDivElement;

		let callStackWrapper = document.getElementById("call_stack-hide_wrapper") as HTMLDivElement;
		callStackController = new CallStackController(callStackWrapper);

		visualizationOptionsWrapper = document.getElementById("visualization_options_wrapper") as HTMLDivElement;
		let visualizationOptionsController = new VisualizationOptionsController(visualizationOptionsWrapper, availableRenderers, defaultRenderer);

		let svgDisplayVisitor = new HtmlSvgDisplayHandler(defaultRenderer, output);

		let displayHandlers: StepDisplayHandler[] = [
			new HtmlDescriptionDisplayHandler(stepDescriptionController),
			new HtmlCallStackDisplayHandler(callStackController),
			new HtmlVariableWatchDisplayHandler(new VariableWatchController(variableWatchElement)),
			new HtmlDebuggerDisplayHandler(debuggerController),
		];

		playerController = new PlayerController(
			sortingAlgorithm,
			stepController,
			debuggerController,
			continuousControl,
			stepKindController,
			displayHandlers,
			svgDisplayVisitor,
			visualizationOptionsController,
			colors,
			reset
		);
	}

	window.addEventListener("load", () => {
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
			KeyboardSettings.load(true),
			visualizationOptionsWrapper
		);
	}

	return simulatorPageController;
}