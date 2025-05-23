import { SortProperties } from "../../sortsConfigs/definitions/SortProperties";
import { CollapseWrappers } from "../data/collections/htmlElementCollections/CollapseWrappers";
import { KeyboardSettings } from "../keyboard/KeyboardSettings";
import { KeyPress } from "../keyboard/KeyPress";
import { ScrollBarWidthMeasurer } from "../misc/ScrollBarWidthMeasurer";
import { flexWrappedClass } from "../visualization/css/GenericClasses";
import { bodyVertical1LayoutClass, bodyVertical2LayoutClass } from "../visualization/css/LayoutClasses";
import { AlgorithmDescriptionController } from "./AlgorithmDescriptionController";
import { CallStackController } from "./CallStackController";
import { DarkModeHandler } from "./DarkModeHandler";
import { InputController } from "./InputController";
import { PlayerController } from "./PlayerController";

/**
 * Controller class for managing the simulator page.
 */
export class SimulatorPageController {
	/**
	 * The breakpoint width for the vertical layout 1 for a simulator with a call stack.
	 */
	public readonly vertical1LayoutBreakpointWithStack = 1400;

	/**
	 * The breakpoint width for the vertical layout 1 for a simulator without a call stack.
	 */
	public readonly vertical1LayoutBreakpointWithoutStack = 1200;

	/**
	 * The breakpoint width for the vertical layout 2 for a simulator with a call stack.
	 */
	public readonly vertical2LayoutBreakpointWithStack = 992;

	/**
	 * The breakpoint width for the vertical layout 2 for a simulator without a call stack.
	 */
	public readonly vertical2LayoutBreakpointWithoutStack = 768;

	/**
	 * A boolean indicating whether the keys configured for controlling the sorting algorithm should be captured.
	 */
	private playerKeysActive: boolean = true;

	/**
	 * The algorithm description controller of the simulator.
	 */
	private readonly algorithmDescriptionController: AlgorithmDescriptionController;

	/**
	 * The {@link ScrollBarWidthMeasurer} used to measure the width of the page's scrollbar during resizes.
	 */
	private readonly scrollBarWidthMeasurer: ScrollBarWidthMeasurer;

	/**
	 * @param playerController - The player controller for the simulator.
	 * @param inputController - The input dialog controller for the simulator.
	 * @param collapseWrappers - The wrappers for the collapsible elements in the simulator.
	 * @param debuggerCollapseButton - The button element used to collapse the debugger.
	 * @param callStackController - The call stack controller for the simulator.
	 * @param algorithmProperties - The properties of the sorting algorithm used in the current simulator.
	 * @param algorithmDescriptionButton - The button element used to open the algorithm description dialog.
	 * @param darkModeHandler - The dark mode handler for the simulator.
	 * @param keyboardSettings - The current keyboard settings used to control the simulator.
	 * @param visualizationOptionsWrapper - The wrapper containing the visualization options elements.
	 */
	public constructor(
		private readonly playerController: PlayerController,
		private readonly inputController: InputController,
		private readonly collapseWrappers: CollapseWrappers,
		debuggerCollapseButton: HTMLButtonElement,
		private readonly callStackController: CallStackController,
		algorithmProperties: SortProperties,
		algorithmDescriptionButton: HTMLButtonElement,
		darkModeHandler: DarkModeHandler,
		private readonly keyboardSettings: KeyboardSettings,
		private readonly visualizationOptionsWrapper: HTMLDivElement
	) {
		this.scrollBarWidthMeasurer = new ScrollBarWidthMeasurer(true);

		darkModeHandler.addEventHandler(dark => {
			playerController.setDarkMode(dark);
		});

		window.addEventListener("resize", () => this.resizeHandler());
		debuggerCollapseButton.addEventListener("click", () => {
			const period = 1000 / 30;
			const limit = 400;

			let ranFor = 0;

			const intervalId = setInterval(() => {
				playerController.redraw();

				ranFor += period;
				if (ranFor >= limit) {
					clearInterval(intervalId);
				}
			}, period);
		});

		inputController.addDialogEventListener((opening) => this.playerKeysActive = !opening);

		window.addEventListener("keydown", event => {
			if (!this.playerKeysActive)
				return
			if (this.playerController.textFieldFocused)
				return;

			const action = this.keyboardSettings.getAction(KeyPress.fromEvent(event));
			if (action != undefined) {
				event.preventDefault();
				this.playerController.performAction(action);
			}
		});

		this.resizeHandler();

		// Reapply dark mode to fix incorrect dark mode on simulator page during first load
		darkModeHandler.DarkMode = darkModeHandler.DarkMode;

		new ResizeObserver(() => this.visualizationOptionsResizeHandler()).observe(visualizationOptionsWrapper);

		this.algorithmDescriptionController = new AlgorithmDescriptionController(algorithmProperties, false);
		algorithmDescriptionButton.addEventListener("click", () => {
			this.algorithmDescriptionController.open();
		});
	}

	/**
	 * Handles the resize event of the window.
	 */
	private resizeHandler() {
		const scrollBarWidth = this.scrollBarWidthMeasurer.scrollBarWidth;
		document.body.style.setProperty("--scrollbar-width", `${scrollBarWidth}px`);

		const horizontalCollapseClass = "collapse-horizontal";

		const breakpointVertical1 = this.callStackController.isPresent ? this.vertical1LayoutBreakpointWithStack : this.vertical1LayoutBreakpointWithoutStack;
		const breakpointVertical2 = this.callStackController.isPresent ? this.vertical2LayoutBreakpointWithStack : this.vertical2LayoutBreakpointWithoutStack;

		const width = Math.min(window.innerWidth, window.outerWidth);

		const shouldBeVertical1 = width < breakpointVertical1;
		const shouldBeVertical2 = width < breakpointVertical2;

		if (shouldBeVertical1) {
			document.body.classList.add(bodyVertical1LayoutClass);
			this.collapseWrappers.debuggerWrapper.classList.remove(horizontalCollapseClass);

			if (shouldBeVertical2) {
				document.body.classList.add(bodyVertical2LayoutClass);
				this.collapseWrappers.variableWatchWrapper.classList.remove(horizontalCollapseClass);
				this.collapseWrappers.callStackWrapper.classList.remove(horizontalCollapseClass);

			} else {
				document.body.classList.remove(bodyVertical2LayoutClass);
				this.collapseWrappers.variableWatchWrapper.classList.add(horizontalCollapseClass);
				this.collapseWrappers.callStackWrapper.classList.add(horizontalCollapseClass);
			}
		} else {
			document.body.classList.remove(bodyVertical1LayoutClass);
			document.body.classList.remove(bodyVertical2LayoutClass);
			this.collapseWrappers.debuggerWrapper.classList.add(horizontalCollapseClass);
			this.collapseWrappers.variableWatchWrapper.classList.add(horizontalCollapseClass);
			this.collapseWrappers.callStackWrapper.classList.add(horizontalCollapseClass);
		}

		this.playerController.redraw();
	}

	private visualizationOptionsResizeHandler() {
		const parent = this.visualizationOptionsWrapper.parentElement;
		if (parent == null)
			return;

		if (this.visualizationOptionsWrapper.offsetTop > parent.offsetTop) {
			this.visualizationOptionsWrapper.classList.add(flexWrappedClass);
		} else {
			this.visualizationOptionsWrapper.classList.remove(flexWrappedClass);
		}
	}
}