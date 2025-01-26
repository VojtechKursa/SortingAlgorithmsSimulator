import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { StepResultCollection } from "../data/collections/StepResultCollection";
import { RendererControlElements } from "../data/collections/htmlElementCollections/RendererControlElements";
import { DebuggerControlElements } from "../data/collections/htmlElementCollections/DebuggerControlElements";
import { StepKind } from "../data/stepResults/StepKind";
import { ContinuousControlController } from "./ContinuousControlController";
import { StepDisplayVisitor } from "../visualization/rendering/StepDisplayVisitor";
import { PageColors } from "../visualization/colors/PageColors";
import { FullStepResult } from "../data/stepResults/FullStepResult";
import { ColorSet } from "../visualization/colors/ColorSet";
import { DebuggerController } from "./DebuggerController";
import { StepDisplayVisitorWithColor } from "../visualization/rendering/StepDisplayVisitorWithColor";

export class PlayerController {
	private currentlyDisplayedFullStep: FullStepResult | null = null;
	private steps: StepResultCollection;
	private currentColorSet: ColorSet;

	public constructor(
		private readonly algorithm: SortingAlgorithm,
		private readonly playerControls: RendererControlElements,
		private readonly debuggerControls: DebuggerControlElements,
		private readonly debuggerController: DebuggerController,
		private readonly continuousControls: ContinuousControlController,
		private readonly displayVisitor: StepDisplayVisitor,
		public readonly colors: PageColors,
		private readonly resetButton: HTMLButtonElement
	) {
		this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

		this.debuggerController.setCode(algorithm.getPseudocode());

		this.reset();

		this.playerControls.backFullStepButton.addEventListener("click", _ => this.backward(StepKind.Full));
		this.playerControls.forwardFullStepButton.addEventListener("click", _ => this.forward(StepKind.Full));
		this.playerControls.backSubStepButton.addEventListener("click", _ => this.backward(StepKind.Sub));
		this.playerControls.forwardSubStepButton.addEventListener("click", _ => this.forward(StepKind.Sub));
		this.playerControls.beginningButton.addEventListener("click", _ => this.toBeginning());
		this.playerControls.endButton.addEventListener("click", _ => this.toEnd());

		this.debuggerControls.backCodeStepButton.addEventListener("click", _ => this.backward(StepKind.Code));
		this.debuggerControls.forwardCodeStepButton.addEventListener("click", _ => this.forward(StepKind.Code));

		this.resetButton.addEventListener("click", _ => this.reset());

		this.continuousControls.addEventListenerPlay((kind, intervalMs) => this.play(kind, intervalMs, true));
		this.continuousControls.addEventListenerPause(() => this.pause(true));
		this.continuousControls.addEventListenerTick((kind) => this.forward(kind));

		this.currentColorSet = colors.currentColorSet;
	}

	public draw(): void {
		let currentState = this.steps.getCurrentStep();
		let currentStepNumbers = currentState.stepsIndex;

		if (currentState.fullStepResult != this.currentlyDisplayedFullStep) {
			currentState.fullStepResult.display(this.displayVisitor, false);
			this.currentlyDisplayedFullStep = currentState.fullStepResult;
		}

		currentState.codeStepResult.display(this.displayVisitor);

		let endStepNumberFull = this.steps.getEndStepNumber(StepKind.Full);
		let endStepNumberSub = this.steps.getEndStepNumber(StepKind.Sub);
		this.playerControls.stepOutput.innerHTML = `${currentStepNumbers.full}<sub>${currentStepNumbers.sub + 1} / ${endStepNumberSub == null ? "?" : endStepNumberSub + 1}</sub> / ${endStepNumberFull == null ? "?" : endStepNumberFull}`;

		let endStepNumberCode = this.steps.getEndStepNumber(StepKind.Code);
		this.debuggerControls.stepOutput.value = `${currentStepNumbers.code} / ${endStepNumberCode == null ? "?" : endStepNumberCode}`;
	}

	public redraw(): void {
		let currentStep = this.steps.getCurrentStep();

		currentStep.fullStepResult.redraw(this.displayVisitor, false);
		currentStep.codeStepResult.redraw(this.displayVisitor);
	}

	public forward(kind: StepKind): void {
		if (this.steps.forward(kind))
			this.draw();
		else {
			if (!this.algorithm.isCompleted()) {
				if (kind == StepKind.Code)
					this.steps.addAndAdvance(this.algorithm.stepForward(kind));
				else {
					let results = this.algorithm.stepForward(kind);

					results.forEach(stepResult => this.steps.add(stepResult));
					this.steps.goToLastKnownStep();
				}

				this.draw();
			}
		}

		this.updateStepControls();
	}

	public backward(kind: StepKind): void {
		if (this.steps.backward(kind))
			this.draw();

		this.updateStepControls();
	}

	public toBeginning(): void {
		this.steps.goToStep(0);

		this.draw();
		this.updateStepControls();
	}

	public toEnd(): void {
		let endStepNumber = this.steps.getEndStepNumber();

		if (endStepNumber != null) {
			this.steps.goToStep(endStepNumber);
		}
		else {
			while (!this.algorithm.isCompleted()) {
				let result = this.algorithm.stepForward();
				this.steps.add(result);
			}

			this.steps.goToStep(this.steps.getLastKnownStepNumber());
		}

		this.draw();
		this.updateStepControls();
	}

	private updateStepControls(): void {
		let endStep = this.steps.getEndStepNumber();
		let currentStep = this.steps.getCurrentStepNumbers().code;

		if (this.continuousControls.playing) {
			this.disableAllDirectStepControls(true);

			if (currentStep == endStep)
				this.pause();
		}
		else {
			if (currentStep == endStep) {
				this.playerControls.forwardFullStepButton.disabled = true;
				this.playerControls.forwardSubStepButton.disabled = true;
				this.playerControls.endButton.disabled = true;

				this.debuggerControls.forwardCodeStepButton.disabled = true;

				this.continuousControls.playButton.disabled = true;
			}
			else if (this.playerControls.forwardFullStepButton.disabled) {
				this.playerControls.forwardFullStepButton.disabled = false;
				this.playerControls.forwardSubStepButton.disabled = false;
				this.playerControls.endButton.disabled = false;

				this.debuggerControls.forwardCodeStepButton.disabled = false;

				this.continuousControls.playButton.disabled = false;
			}

			if (currentStep <= 0) {
				this.playerControls.backFullStepButton.disabled = true;
				this.playerControls.backSubStepButton.disabled = true;
				this.playerControls.beginningButton.disabled = true;

				this.debuggerControls.backCodeStepButton.disabled = true;
			}
			else if (this.playerControls.backFullStepButton.disabled) {
				this.playerControls.backFullStepButton.disabled = false;
				this.playerControls.backSubStepButton.disabled = false;
				this.playerControls.beginningButton.disabled = false;

				this.debuggerControls.backCodeStepButton.disabled = false;
			}
		}
	}

	private disableAllDirectStepControls(disabled: boolean): void {
		this.playerControls.forwardFullStepButton.disabled = disabled;
		this.playerControls.forwardSubStepButton.disabled = disabled;
		this.playerControls.endButton.disabled = disabled;
		this.debuggerControls.forwardCodeStepButton.disabled = disabled;

		this.playerControls.backFullStepButton.disabled = disabled;
		this.playerControls.backSubStepButton.disabled = disabled;
		this.playerControls.beginningButton.disabled = disabled;
		this.debuggerControls.backCodeStepButton.disabled = disabled;
	}

	public play(kind: StepKind, _?: number, triggeredByHandler: boolean = false): void {
		if (!triggeredByHandler) {
			this.continuousControls.play();
			return;
		}

		this.forward(kind);
	}

	public pause(triggeredByHandler: boolean = false): void {
		if (!triggeredByHandler) {
			this.continuousControls.pause();
			return;
		}

		this.disableAllDirectStepControls(false);

		// update step controls after enabling all of them
		this.updateStepControls();
	}

	public reset(): void {
		if (this.continuousControls.playing) {
			this.pause();
		}

		this.algorithm.reset();

		this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

		this.draw();

		this.updateStepControls();
	}

	public setInput(input: number[]): void {
		this.algorithm.setInput(input);

		this.reset();
	}

	public setDarkMode(darkMode: boolean): void {
		const newColorSet = darkMode ? this.colors.darkColors : this.colors.lightColors;

		if (this.currentColorSet != newColorSet) {
			this.currentColorSet = newColorSet;

			let selectedVisitor: StepDisplayVisitor | null = this.displayVisitor;

			while (selectedVisitor != null) {
				if (selectedVisitor instanceof StepDisplayVisitorWithColor) {
					selectedVisitor.colorSet = newColorSet;
				}

				selectedVisitor = selectedVisitor.next;
			}

			this.draw();
		}
	}
}