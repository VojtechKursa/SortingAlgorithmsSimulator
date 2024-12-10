import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { StepResultCollection } from "../StepResultCollection";
import { RendererControlElements } from "../htmlElementCollections/RendererControlElements";
import { DebuggerControlElements } from "../htmlElementCollections/DebuggerControlElements";
import { SimulatorOutputElements } from "../htmlElementCollections/SimulatorOutputElements";
import { StepKind } from "../stepResults/StepKind";

export class PlayerController {
    private steps: StepResultCollection;

    private autoPlayTimerId: NodeJS.Timeout | number | null;
    private playingCode: boolean = false;

    public constructor(
        private readonly algorithm: SortingAlgorithm,
        private readonly outputElements: SimulatorOutputElements,
        private readonly playerControls: RendererControlElements,
        private readonly debuggerControls: DebuggerControlElements,
        private readonly resetButton: HTMLButtonElement
    ) {
        this.autoPlayTimerId = null;

        this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

        this.reset();

        this.playerControls.backButton.addEventListener("click", _ => this.backward());
        this.playerControls.forwardButton.addEventListener("click", _ => this.forward());
        this.playerControls.beginningButton.addEventListener("click", _ => this.toBeginning());
        this.playerControls.endButton.addEventListener("click", _ => this.toEnd());
        this.playerControls.playButton.addEventListener("click", _ => this.play());
        this.playerControls.pauseButton.addEventListener("click", _ => this.pause());

        this.debuggerControls.backButton.addEventListener("click", _ => this.backwardCode());
        this.debuggerControls.forwardButton.addEventListener("click", _ => this.forwardCode());
        this.debuggerControls.playButton.addEventListener("click", _ => this.playCode());
        this.debuggerControls.pauseButton.addEventListener("click", _ => this.pauseCode());

        this.resetButton.addEventListener("click", _ => this.reset());
    }

    public redraw(): void {
        let currentStep = this.steps.getCurrentStep();

        currentStep.display(this.outputElements);

        let currentFullStepIndexes = this.steps.getCurrentStepNumber(StepKind.Full, false);

        let endStepNumberFull = this.steps.getEndStepNumber(StepKind.Full);
        this.playerControls.stepOutput.value = `${currentFullStepIndexes[0]} / ${endStepNumberFull == null ? "?" : endStepNumberFull}`;

        let endStepNumberSub = this.steps.getEndStepNumber(StepKind.Sub);
        let currentStepNumberSub = currentFullStepIndexes[1];

        let endStepNumberCode = this.steps.getEndStepNumber(StepKind.Code);
        this.debuggerControls.stepOutput.value = `${this.steps.getCurrentStepNumber(StepKind.Code)} / ${endStepNumberCode == null ? "?" : endStepNumberCode}`;
    }

    public forward(): void {
        if (this.steps.forward(StepKind.Full))
            this.redraw();
        else {
            if (!this.algorithm.isCompleted()) {
                let result = this.algorithm.stepForwardFull();

                result[1].forEach(codeStepResult => this.steps.add(codeStepResult));
                this.steps.addAndAdvance(result[0]);

                this.redraw();
            }
        }

        this.updateStepControls();
    }

    public backward(): void {
        if (this.steps.backward(StepKind.Full))
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

    public forwardCode(): void {
        if (this.steps.forward(StepKind.Code))
            this.redraw();
        else {
            if (!this.algorithm.isCompleted()) {
                let result = this.algorithm.stepForward();

                this.steps.addAndAdvance(result);

                this.redraw();
            }
        }

        this.updateStepControls();
    }

    public backwardCode(): void {
        if (this.steps.backward(StepKind.Code))
            this.redraw();

        this.updateStepControls();
    }

    private updateStepControls(): void {
        let endStep = this.steps.getEndStepNumber();
        let currentStep = this.steps.getCurrentStepNumber();

        if (currentStep == endStep) {
            if (!this.playerControls.forwardButton.disabled) {
                this.playerControls.forwardButton.disabled = true;
                this.playerControls.playButton.disabled = true;
                this.playerControls.endButton.disabled = true;

                this.debuggerControls.forwardButton.disabled = true;
            }

            if (this.autoPlayTimerId != null) {
                if (this.playingCode) {
                    this.pauseCode();
                }
                else {
                    this.pause();
                }
            }
        }
        else if (this.playerControls.forwardButton.disabled) {
            this.playerControls.forwardButton.disabled = false;
            this.playerControls.playButton.disabled = false;
            this.playerControls.endButton.disabled = false;

            this.debuggerControls.forwardButton.disabled = false;
        }

        if (currentStep <= 0) {
            if (!this.playerControls.backButton.disabled) {
                this.playerControls.backButton.disabled = true;
                this.playerControls.beginningButton.disabled = true;

                this.debuggerControls.backButton.disabled = true;
            }
        }
        else if (this.playerControls.backButton.disabled) {
            this.playerControls.backButton.disabled = false;
            this.playerControls.beginningButton.disabled = false;

            this.debuggerControls.backButton.disabled = false;
        }
    }

    private getPlayInterval(inputElement: HTMLInputElement): number {
        let value = inputElement.valueAsNumber;

        if (value <= 0 || Number.isNaN(value)) {
            value = Number.parseFloat(inputElement.min);

            inputElement.valueAsNumber = value;
        }

        return value * 1000;
    }

    private updatePlayControls(starting: boolean, playingCode: boolean): void {
        if (starting) {
            if (playingCode) {
                this.playerControls.pauseButton.disabled = true;
                this.playerControls.playButton.disabled = true;

                this.debuggerControls.periodInput.disabled = true;

                if (!this.debuggerControls.playButton.checked) {
                    this.debuggerControls.playButton.checked = true;
                }
            }
            else {
                this.debuggerControls.pauseButton.disabled = true;
                this.debuggerControls.playButton.disabled = true;

                this.playerControls.periodInput.disabled = true;

                if (!this.playerControls.playButton.checked) {
                    this.playerControls.playButton.checked = true;
                }
            }
        }
        else {
            if (playingCode) {
                this.playerControls.pauseButton.disabled = false;
                this.playerControls.playButton.disabled = false;

                this.debuggerControls.periodInput.disabled = false;

                if (!this.debuggerControls.pauseButton.checked) {
                    this.debuggerControls.pauseButton.checked = true;
                }
            }
            else {
                this.debuggerControls.pauseButton.disabled = false;
                this.debuggerControls.playButton.disabled = false;

                this.playerControls.periodInput.disabled = false;

                if (!this.playerControls.pauseButton.checked) {
                    this.playerControls.pauseButton.checked = true;
                }
            }
        }

        if (starting)
            this.playingCode = playingCode;
        else
            this.playingCode = false;
    }

    public play(): void {
        if (this.autoPlayTimerId == null) {
            let intervalMs = this.getPlayInterval(this.playerControls.periodInput);

            this.updatePlayControls(true, false);

            this.forward();

            this.autoPlayTimerId = setInterval(() => this.forward(), intervalMs);
        }
    }

    public pause(): void {
        if (this.autoPlayTimerId != null && !this.playingCode) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;

            this.updatePlayControls(false, false);
        }
    }

    public playCode(): void {
        if (this.autoPlayTimerId == null) {
            let intervalMs = this.getPlayInterval(this.debuggerControls.periodInput);

            this.updatePlayControls(true, true);

            this.forwardCode();

            this.autoPlayTimerId = setInterval(() => this.forwardCode(), intervalMs);
        }
    }

    public pauseCode(): void {
        if (this.autoPlayTimerId != null && this.playingCode) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;

            this.updatePlayControls(false, true);
        }
    }

    public reset(): void {
        if (this.autoPlayTimerId != null) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;
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