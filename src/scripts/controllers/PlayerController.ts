import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { StepResultCollection } from "../StepResultCollection";
import { RendererControlElements } from "../htmlElementCollections/RendererControlElements";
import { DebuggerControlElements } from "../htmlElementCollections/DebuggerControlElements";
import { SimulatorOutputElements } from "../htmlElementCollections/SimulatorOutputElements";
import { StepKind } from "../stepResults/StepKind";
import { ContinuousControlElements } from "../htmlElementCollections/ContinuousControlElements";

export class PlayerController {
    private steps: StepResultCollection;

    private autoPlayTimerId: NodeJS.Timeout | number | null = null;
    private playingKind: StepKind | null = null;

    public constructor(
        private readonly algorithm: SortingAlgorithm,
        private readonly outputElements: SimulatorOutputElements,
        private readonly playerControls: RendererControlElements,
        private readonly debuggerControls: DebuggerControlElements,
        private readonly continuousControls: ContinuousControlElements,
        private readonly resetButton: HTMLButtonElement
    ) {
        this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

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

        this.continuousControls.registerHandler((start, kind, interval) => this.playHandler(start, kind, interval));
    }

    public redraw(): void {
        let currentStep = this.steps.getCurrentStep();

        currentStep.display(this.outputElements);

        let currentFullStepIndexes = this.steps.getCurrentStepNumber(StepKind.Full, false);

        let endStepNumberFull = this.steps.getEndStepNumber(StepKind.Full);
        let endStepNumberSub = this.steps.getEndStepNumber(StepKind.Sub);
        this.playerControls.stepOutput.innerHTML = `${currentFullStepIndexes[0]}<sub>${currentFullStepIndexes[1] + 1} / ${endStepNumberSub == null ? "?" : endStepNumberSub + 1}</sub> / ${endStepNumberFull == null ? "?" : endStepNumberFull}`;

        let endStepNumberCode = this.steps.getEndStepNumber(StepKind.Code);
        this.debuggerControls.stepOutput.value = `${this.steps.getCurrentStepNumber(StepKind.Code)} / ${endStepNumberCode == null ? "?" : endStepNumberCode}`;
    }

    public forward(kind: StepKind): void {
        if (this.steps.forward(kind))
            this.redraw();
        else {
            if (!this.algorithm.isCompleted()) {
                if (kind == StepKind.Code)
                    this.steps.addAndAdvance(this.algorithm.stepForward(kind));
                else {
                    let results = this.algorithm.stepForward(kind);

                    results.forEach(stepResult => this.steps.add(stepResult));
                    this.steps.goToLastKnownStep();
                }

                this.redraw();
            }
        }

        this.updateStepControls();
    }

    public backward(kind: StepKind): void {
        if (this.steps.backward(kind))
            this.redraw();

        this.updateStepControls();
    }

    public toBeginning(): void {
        this.steps.goToStep(0);

        this.redraw();
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

        this.redraw();
        this.updateStepControls();
    }

    private updateStepControls(): void {
        let endStep = this.steps.getEndStepNumber();
        let currentStep = this.steps.getCurrentStepNumber();

        if (this.autoPlayTimerId != null || this.playingKind != null) {
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

    private playHandler(start: boolean, kind: StepKind, intervalMs: number): void {
        if (start) {
            this.play(kind, intervalMs, true);
        } else {
            this.pause(true);
        }
    }

    public play(kind: StepKind, intervalMs?: number, triggeredByHandler: boolean = false): void {
        if (!triggeredByHandler) {
            this.continuousControls.play();
            return;
        }

        if (this.autoPlayTimerId == null) {
            if (intervalMs == undefined)
                intervalMs = this.continuousControls.getTimerIntervalMs();

            this.playingKind = kind;

            this.forward(kind);

            this.autoPlayTimerId = setInterval(() => this.forward(kind), intervalMs);
        }
    }

    public pause(triggeredByHandler: boolean = false): void {
        if (!triggeredByHandler) {
            this.continuousControls.pause();
            return;
        }

        if (this.autoPlayTimerId != null) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;
            this.playingKind = null;

            this.disableAllDirectStepControls(false);

            // update step controls after enabling all of them
            this.updateStepControls();
        }
    }

    public reset(): void {
        if (this.autoPlayTimerId != null) {
            this.pause();
        }

        this.algorithm.reset();

        this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

        this.redraw();

        this.updateStepControls();
    }

    public setInput(input: number[]): void {
        this.algorithm.setInput(input);

        this.reset();
    }
}