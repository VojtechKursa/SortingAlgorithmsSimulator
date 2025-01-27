import { CollapseWrappers } from "../data/collections/htmlElementCollections/CollapseWrappers";
import { KeyboardSettings } from "../keyboard/KeyboardSettings";
import { KeyPress } from "../keyboard/KeyPress";
import { bodyVertical1LayoutClass, bodyVertical2LayoutClass } from "../visualization/CssInterface";
import { CallStackController } from "./CallStackController";
import { DarkModeHandler } from "./DarkModeHandler";
import { InputController } from "./InputController";
import { PlayerController } from "./PlayerController";

export class SimulatorPageController {
	public readonly vertical1LayoutBreakpointWithStack = 1400;
	public readonly vertical1LayoutBreakpointWithoutStack = 1200;

	public readonly vertical2LayoutBreakpointWithStack = 992;
	public readonly vertical2LayoutBreakpointWithoutStack = 768;

	private playerKeysActive: boolean = true;

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

		window.addEventListener("resize", _ => this.resizeHandler());
		debuggerCollapseButton.addEventListener("click", _ => {
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