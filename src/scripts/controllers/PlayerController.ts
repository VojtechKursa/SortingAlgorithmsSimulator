import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { ColorSet } from "../ColorSet";
import { VisualizationElement, FullStepResult } from "../stepResults/FullStepResult";
import { CodeStepResult, DebuggerElement, VariableWatchElement } from "../stepResults/CodeStepResult";
import { StepResultCollection } from "../StepResultCollection";
import { PlayerControls } from "../PlayerControls";

export class PlayerController {
    private readonly algorithm: SortingAlgorithm;
    private steps: StepResultCollection;
    private autoPlayTimerId: NodeJS.Timeout | number | null;

    private readonly visualizationElement: VisualizationElement;
    private readonly debuggerElement: DebuggerElement;
    private readonly variableWatchElement: VariableWatchElement;

    private playerElementContainer: PlayerControls;
    private debuggerElementContainer: PlayerControls;

    private resetButton: HTMLButtonElement;

    public colorSet: ColorSet;

    public constructor(colorSet: ColorSet, algorithm: SortingAlgorithm,
        outputElement: VisualizationElement,
        debuggerElement: DebuggerElement,
        variableWatchElement: VariableWatchElement, 
        playerElementContainer: PlayerControls,
        debuggerElementContainer: PlayerControls,
        resetButton: HTMLButtonElement
    ) {
        this.colorSet = colorSet;
        this.algorithm = algorithm;

        this.visualizationElement = outputElement;
        this.debuggerElement = debuggerElement;
        this.variableWatchElement = variableWatchElement;

        this.playerElementContainer = playerElementContainer;
        this.debuggerElementContainer = debuggerElementContainer;

        this.resetButton = resetButton;

        this.autoPlayTimerId = null;

        this.steps = new StepResultCollection(this.algorithm.getInitialStepResult());

        this.reset();

        this.playerElementContainer.back.addEventListener("click", _ => this.backward());
        this.playerElementContainer.forward.addEventListener("click", _ => this.forward());
        this.playerElementContainer.play.addEventListener("click", _ => this.play());
        this.playerElementContainer.pause.addEventListener("click", _ => this.pause());

        this.debuggerElementContainer.back.addEventListener("click", _ => this.backwardCode());
        this.debuggerElementContainer.forward.addEventListener("click", _ => this.forwardCode());

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

        let endStepNumberFull = this.steps.getEndFullStepNumber();
        this.playerElementContainer.step.value = `${this.steps.getCurrentFullStepNumber()} / ${endStepNumberFull == null ? "?" : endStepNumberFull}`;

        let endStepNumber = this.steps.getEndStepNumber();
        this.debuggerElementContainer.step.value = `${this.steps.getCurrentStepNumber()} / ${endStepNumber == null ? "?" : endStepNumber}`;
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
            if (!this.playerElementContainer.forward.disabled) {
                this.playerElementContainer.forward.disabled = true;
                this.playerElementContainer.play.disabled = true;
            }

            if (this.autoPlayTimerId != null) {
                clearInterval(this.autoPlayTimerId);
                this.autoPlayTimerId = null;

                this.playerElementContainer.pause.checked = true;
            }

            if (this.playerElementContainer.periodInput.disabled) {
                this.playerElementContainer.periodInput.disabled = false;
            }
        }
        else if (this.playerElementContainer.forward.disabled) {
            this.playerElementContainer.forward.disabled = false;
            this.playerElementContainer.play.disabled = false;
        }

        if (currentStep <= 0) {
            if (!this.playerElementContainer.back.disabled) {
                this.playerElementContainer.back.disabled = true;
            }
        }
        else if (this.playerElementContainer.back.disabled) {
            this.playerElementContainer.back.disabled = false;
        }
    }

    private play(): void {
        if (this.autoPlayTimerId == null) {
            this.playerElementContainer.periodInput.disabled = true;
            let value = this.playerElementContainer.periodInput.valueAsNumber

            let intervalMs: number;

            if (value <= 0 || Number.isNaN(value)) {
                let min = Number.parseFloat(this.playerElementContainer.periodInput.min);

                intervalMs = min * 1000;

                this.playerElementContainer.periodInput.valueAsNumber = min;
            }
            else {
                intervalMs = this.playerElementContainer.periodInput.valueAsNumber * 1000;
            }

            this.forward();

            this.autoPlayTimerId = setInterval(() => this.forward(), intervalMs);
        }
    }

    private pause(): void {
        if (this.autoPlayTimerId != null) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;

            this.playerElementContainer.periodInput.disabled = false;
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