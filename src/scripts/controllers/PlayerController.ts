import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { ColorSet } from "../ColorSet";
import { VisualizationElement, FullStepResult } from "../stepResults/FullStepResult";
import { CodeStepResult, DebuggerElement, VariableWatchElement } from "../stepResults/CodeStepResult";
import { StepResultCollection } from "../StepResultCollection";

export class PlayerController {
    private readonly algorithm: SortingAlgorithm;
    private steps: StepResultCollection;
    private autoPlayTimerId: NodeJS.Timeout | null;

    private readonly visualizationElement: VisualizationElement;
    private readonly debuggerElement: DebuggerElement;
    private readonly variableWatchElement: VariableWatchElement;

    private backButton: HTMLButtonElement;
    private forwardButton: HTMLButtonElement;
    private stepOutput: HTMLOutputElement;
    private playButton: HTMLInputElement;
    private pauseButton: HTMLInputElement;
    private periodInput: HTMLInputElement;
    private resetButton: HTMLButtonElement;

    public colorSet: ColorSet;

    public constructor(colorSet: ColorSet, algorithm: SortingAlgorithm,
        outputElement: VisualizationElement,
        debuggerElement: DebuggerElement,
        variableWatchElement: VariableWatchElement, 
        backButton: HTMLButtonElement,
        forwardButton: HTMLButtonElement,
        stepOutput: HTMLOutputElement,
        playButton: HTMLInputElement,
        pauseButton: HTMLInputElement,
        periodInput: HTMLInputElement,
        resetButton: HTMLButtonElement
    ) {
        this.colorSet = colorSet;
        this.algorithm = algorithm;

        this.visualizationElement = outputElement;
        this.debuggerElement = debuggerElement;
        this.variableWatchElement = variableWatchElement;

        this.backButton = backButton;
        this.forwardButton = forwardButton;
        this.stepOutput = stepOutput;
        this.playButton = playButton;
        this.pauseButton = pauseButton;
        this.periodInput = periodInput;
        this.resetButton = resetButton;

        this.autoPlayTimerId = null;

        this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

        this.reset();

        this.backButton.addEventListener("click", _ => this.backward());
        this.forwardButton.addEventListener("click", _ => this.forward());
        this.playButton.addEventListener("click", _ => this.play());
        this.pauseButton.addEventListener("click", _ => this.pause());
        this.resetButton.addEventListener("click", _ => this.reset());
    }

    public redraw(): void {
        let currentStep = this.steps.getCurrentStep();

        if (currentStep instanceof FullStepResult) {
            let step = currentStep as FullStepResult;
            step.display(this.visualizationElement, this.colorSet, this.debuggerElement, this.variableWatchElement);
        }
        else {
            let step = currentStep as CodeStepResult;
            step.display(this.debuggerElement, this.variableWatchElement);
        }

        let endStepNumber = this.steps.getEndStepNumber();
        this.stepOutput.value = `${this.steps.getCurrentStepNumber()} / ${endStepNumber == null ? "?" : endStepNumber}`;
    }

    private forward(): void {
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

    private backward(): void {
        if (this.steps.backwardFull())
            this.redraw();

        this.updateStepControls();
    }

    private forwardCode(): void {
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

    private backwardCode(): void {
        if (this.steps.backward())
            this.redraw();

        this.updateStepControls();
    }

    private updateStepControls(): void {
        let endStep = this.steps.getEndStepNumber();
        let currentStep = this.steps.getCurrentStepNumber();

        if (endStep != null && currentStep == endStep) {
            if (!this.forwardButton.disabled) {
                this.forwardButton.disabled = true;
                this.playButton.disabled = true;
            }

            if (this.autoPlayTimerId != null) {
                clearInterval(this.autoPlayTimerId);
                this.autoPlayTimerId = null;

                this.pauseButton.checked = true;
            }

            if (this.periodInput.disabled) {
                this.periodInput.disabled = false;
            }
        }
        else if (this.forwardButton.disabled) {
            this.forwardButton.disabled = false;
            this.playButton.disabled = false;
        }

        if (currentStep <= 0) {
            if (!this.backButton.disabled) {
                this.backButton.disabled = true;
            }
        }
        else if (this.backButton.disabled) {
            this.backButton.disabled = false;
        }
    }

    private play(): void {
        if (this.autoPlayTimerId == null) {
            this.periodInput.disabled = true;
            let value = this.periodInput.valueAsNumber

            let intervalMs: number;

            if (value <= 0 || Number.isNaN(value)) {
                let min = Number.parseFloat(this.periodInput.min);

                intervalMs = min * 1000;

                this.periodInput.valueAsNumber = min;
            }
            else {
                intervalMs = this.periodInput.valueAsNumber * 1000;
            }

            this.forward();

            this.autoPlayTimerId = setInterval(() => this.forward(), intervalMs);
        }
    }

    private pause(): void {
        if (this.autoPlayTimerId != null) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;

            this.periodInput.disabled = false;
        }
    }

    private reset(): void {
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