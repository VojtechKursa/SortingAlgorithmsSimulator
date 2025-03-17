import { CollapseWrappers } from "../data/collections/htmlElementCollections/CollapseWrappers";
import { KeyboardSettings } from "../keyboard/KeyboardSettings";
import { KeyPress } from "../keyboard/KeyPress";
import { bodyVertical1LayoutClass, bodyVertical2LayoutClass } from "../visualization/css/LayoutClasses";
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
	 * @param playerController - The player controller for the simulator.
	 * @param inputController - The input dialog controller for the simulator.
	 * @param collapseWrappers - The wrappers for the collapsible elements in the simulator.
	 * @param debuggerCollapseButton - The button element used to collapse the debugger.
	 * @param callStackController - The call stack controller for the simulator.
	 * @param settingsOpenButton - The button element used to open the settings dialog.
	 * @param darkModeHandler - The dark mode handler for the simulator.
	 * @param keyboardSettings - The current keyboard settings used to control the simulator.
	 */
	public constructor(
		private readonly playerController: PlayerController,
		private readonly inputController: InputController,
		private readonly collapseWrappers: CollapseWrappers,
		debuggerCollapseButton: HTMLButtonElement,
		private readonly callStackController: CallStackController,
		private readonly settingsOpenButton: HTMLButtonElement,
		darkModeHandler: DarkModeHandler,
		private readonly keyboardSettings: KeyboardSettings
	) {
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
	}

	/**
	 * Handles the resize event of the window.
	 */
	private resizeHandler() {
		const horizontalCollapseClass = "collapse-horizontal";

		const breakpointVertical1 = this.callStackController.isPresent ? this.vertical1LayoutBreakpointWithStack : this.vertical1LayoutBreakpointWithoutStack;
		const breakpointVertical2 = this.callStackController.isPresent ? this.vertical2LayoutBreakpointWithStack : this.vertical2LayoutBreakpointWithoutStack;

		const shouldBeVertical1 = window.innerWidth < breakpointVertical1;
		const shouldBeVertical2 = window.innerWidth < breakpointVertical2;

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
}