import { bodyVerticalLayoutClass } from "../visualization/CssInterface";
import { CallStackController } from "./CallStackController";
import { DarkModeHandler } from "./DarkModeHandler";
import { InputController } from "./InputController";
import { PlayerController } from "./PlayerController";

export class SimulatorPageController {
	public readonly verticalLayoutBreakpointWithStack = 1400;
	public readonly verticalLayoutBreakpointWithoutStack = 1200;

	public constructor(
		private readonly playerController: PlayerController,
		private readonly inputController: InputController,
		private readonly debuggerColumn: HTMLDivElement,
		private readonly callStackController: CallStackController,
		private readonly settingsOpenButton: HTMLButtonElement,
		darkModeHandler: DarkModeHandler
	) {
		darkModeHandler.addEventHandler(dark => {
			playerController.setDarkMode(dark);
		});

		window.addEventListener("resize", _ => this.resizeHandler());

		this.resizeHandler();
	}

	private resizeHandler() {
		const breakpoint = this.callStackController.isPresent ? this.verticalLayoutBreakpointWithStack : this.verticalLayoutBreakpointWithoutStack;
		const shouldBeVertical = window.innerWidth < breakpoint;

		if (shouldBeVertical) {
			document.body.classList.add(bodyVerticalLayoutClass);
			this.debuggerColumn.classList.remove("collapse-horizontal");
		} else {
			document.body.classList.remove(bodyVerticalLayoutClass);
			this.debuggerColumn.classList.add("collapse-horizontal");
		}

		this.playerController.redraw();
	}
}