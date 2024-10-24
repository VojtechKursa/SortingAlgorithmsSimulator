import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { FullStepResult } from "../stepResults/FullStepResult";
import { CodeStepResult } from "../stepResults/CodeStepResult";
import { StepResultCollection } from "../StepResultCollection";
import { RendererControlElements } from "../controlElements/RendererControlElements";
import { DebuggerControlElements } from "../controlElements/DebuggerControlElements";
import { StepDescriptionController } from "./StepDescriptionController";

export class PlayerController {
    private steps: StepResultCollection;

    private autoPlayTimerId: NodeJS.Timeout | number | null;
    private playingCode: boolean = false;

    public constructor(
        private readonly algorithm: SortingAlgorithm,
        private readonly visualizationElement: HTMLDivElement,
        private readonly debuggerElement: HTMLDivElement,
        private readonly variableWatchElement: HTMLDivElement,
        private readonly playerElementContainer: RendererControlElements,
        private readonly debuggerElementContainer: DebuggerControlElements,
        private readonly stepDescriptionController: StepDescriptionController,
        private readonly resetButton: HTMLButtonElement
    ) {
        this.autoPlayTimerId = null;

        this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

        this.reset();

        this.playerElementContainer.backButton.addEventListener("click", _ => this.backward());
        this.playerElementContainer.forwardButton.addEventListener("click", _ => this.forward());
        this.playerElementContainer.beginningButton.addEventListener("click", _ => this.toBeginning());
        this.playerElementContainer.endButton.addEventListener("click", _ => this.toEnd());
        this.playerElementContainer.playButton.addEventListener("click", _ => this.play());
        this.playerElementContainer.pauseButton.addEventListener("click", _ => this.pause());

        this.debuggerElementContainer.backButton.addEventListener("click", _ => this.backwardCode());
        this.debuggerElementContainer.forwardButton.addEventListener("click", _ => this.forwardCode());
        this.debuggerElementContainer.playButton.addEventListener("click", _ => this.playCode());
        this.debuggerElementContainer.pauseButton.addEventListener("click", _ => this.pauseCode());

        this.resetButton.addEventListener("click", _ => this.reset());
    }

    public redraw(): void {
        let currentStep = this.steps.getCurrentStep();

        if (currentStep instanceof FullStepResult) {
            let step = currentStep;
            step.display(this.visualizationElement, this.debuggerElement, this.variableWatchElement, this.stepDescriptionController);
        }
        else {
            let step = currentStep as CodeStepResult;
            step.display(this.debuggerElement, this.variableWatchElement, this.stepDescriptionController);
        }

        let endStepNumberFull = this.steps.getEndFullStepNumber();
        this.playerElementContainer.stepOutput.value = `${this.steps.getCurrentFullStepNumber()} / ${endStepNumberFull == null ? "?" : endStepNumberFull}`;

        let endStepNumber = this.steps.getEndStepNumber();
        this.debuggerElementContainer.stepOutput.value = `${this.steps.getCurrentStepNumber()} / ${endStepNumber == null ? "?" : endStepNumber}`;
    }

    public forward(): void {
        if (this.steps.forwardFull())
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
        if (this.steps.backwardFull())
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
        if (this.steps.forward())
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
        if (this.steps.backward())
            this.redraw();

        this.updateStepControls();
    }

    private updateStepControls(): void {
        let endStep = this.steps.getEndStepNumber();
        let currentStep = this.steps.getCurrentStepNumber();

        if (currentStep == endStep) {
            if (!this.playerElementContainer.forwardButton.disabled) {
                this.playerElementContainer.forwardButton.disabled = true;
                this.playerElementContainer.playButton.disabled = true;
                this.playerElementContainer.endButton.disabled = true;

                this.debuggerElementContainer.forwardButton.disabled = true;
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
        else if (this.playerElementContainer.forwardButton.disabled) {
            this.playerElementContainer.forwardButton.disabled = false;
            this.playerElementContainer.playButton.disabled = false;
            this.playerElementContainer.endButton.disabled = false;

            this.debuggerElementContainer.forwardButton.disabled = false;
        }

        if (currentStep <= 0) {
            if (!this.playerElementContainer.backButton.disabled) {
                this.playerElementContainer.backButton.disabled = true;
                this.playerElementContainer.beginningButton.disabled = true;

                this.debuggerElementContainer.backButton.disabled = true;
            }
        }
        else if (this.playerElementContainer.backButton.disabled) {
            this.playerElementContainer.backButton.disabled = false;
            this.playerElementContainer.beginningButton.disabled = false;

            this.debuggerElementContainer.backButton.disabled = false;
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
                this.playerElementContainer.pauseButton.disabled = true;
                this.playerElementContainer.playButton.disabled = true;

                this.debuggerElementContainer.periodInput.disabled = true;

                if (!this.debuggerElementContainer.playButton.checked) {
                    this.debuggerElementContainer.playButton.checked = true;
                }
            }
            else {
                this.debuggerElementContainer.pauseButton.disabled = true;
                this.debuggerElementContainer.playButton.disabled = true;

                this.playerElementContainer.periodInput.disabled = true;

                if (!this.playerElementContainer.playButton.checked) {
                    this.playerElementContainer.playButton.checked = true;
                }
            }
        }
        else {
            if (playingCode) {
                this.playerElementContainer.pauseButton.disabled = false;
                this.playerElementContainer.playButton.disabled = false;

                this.debuggerElementContainer.periodInput.disabled = false;

                if (!this.debuggerElementContainer.pauseButton.checked) {
                    this.debuggerElementContainer.pauseButton.checked = true;
                }
            }
            else {
                this.debuggerElementContainer.pauseButton.disabled = false;
                this.debuggerElementContainer.playButton.disabled = false;

                this.playerElementContainer.periodInput.disabled = false;

                if (!this.playerElementContainer.pauseButton.checked) {
                    this.playerElementContainer.pauseButton.checked = true;
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
            let intervalMs = this.getPlayInterval(this.playerElementContainer.periodInput);

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
            let intervalMs = this.getPlayInterval(this.debuggerElementContainer.periodInput);

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