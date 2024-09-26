import { SortingAlgorithm } from "../sorts/SortingAlgorithm";
import { ColorSet } from "../ColorSet";
import { OutputElement, StepResult } from "../stepResults/StepResult";

export class PlayerController {
    private readonly algorithm: SortingAlgorithm;
    private results: Array<StepResult>;
    private currentStep: number;
    private endStep: number | null;
    private readonly outputElement: OutputElement;
    private autoPlayTimerId: NodeJS.Timeout | null;

    private backButton: HTMLButtonElement;
    private forwardButton: HTMLButtonElement;
    private stepOutput: HTMLOutputElement;
    private playButton: HTMLInputElement;
    private pauseButton: HTMLInputElement;
    private periodInput: HTMLInputElement;
    private resetButton: HTMLButtonElement;

    public colorSet: ColorSet;

    public constructor(outputElement: OutputElement, colorSet: ColorSet, algorithm: SortingAlgorithm,
        backButton: HTMLButtonElement,
        forwardButton: HTMLButtonElement,
        stepOutput: HTMLOutputElement,
        playButton: HTMLInputElement,
        pauseButton: HTMLInputElement,
        periodInput: HTMLInputElement,
        resetButton: HTMLButtonElement
    ) {
        this.outputElement = outputElement;
        this.colorSet = colorSet;
        this.algorithm = algorithm;

        this.backButton = backButton;
        this.forwardButton = forwardButton;
        this.stepOutput = stepOutput;
        this.playButton = playButton;
        this.pauseButton = pauseButton;
        this.periodInput = periodInput;
        this.resetButton = resetButton;

        this.results = new Array<StepResult>();
        this.currentStep = 0;
        this.endStep = null;
        this.autoPlayTimerId = null;

        this.reset();

        this.backButton.addEventListener("click", _ => this.backward());
        this.forwardButton.addEventListener("click", _ => this.forward());
        this.playButton.addEventListener("click", _ => this.play());
        this.pauseButton.addEventListener("click", _ => this.pause());
        this.resetButton.addEventListener("click", _ => this.reset());
    }

    public redraw(): void {
        this.results[this.currentStep].draw(this.outputElement, this.colorSet);

        this.stepOutput.value = `${this.currentStep} / ${this.endStep == null ? "?" : this.endStep}`;
    }

    private forward(): void {
        if (this.currentStep + 1 < this.results.length) {
            this.currentStep++;
            this.redraw();
        }
        else {
            if (!this.algorithm.isCompleted()) {
                let result = this.algorithm.stepForward();

                this.results.push(result);
                this.currentStep++;

                if (result.final) {
                    this.endStep = this.currentStep;
                }

                this.redraw();
            }
        }

        this.stepUpdate();
    }

    private backward(): void {
        if (this.currentStep > 0) {
            this.currentStep--;

            this.redraw();
        }

        this.stepUpdate();
    }

    private stepUpdate(): void {
        if (this.endStep != null && this.currentStep == this.endStep) {
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

        if (this.currentStep <= 0) {
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

        this.results = new Array<StepResult>();
        this.results.push(this.algorithm.currentStepResult());

        this.currentStep = 0;
        this.endStep = null;

        this.redraw();

        this.stepUpdate();
    }

    public getStep(): number {
        return this.currentStep;
    }

    public getEndStep(): number | null {
        return this.endStep;
    }

    public setInput(input: number[]): void {
        this.algorithm.setInput(input);

        this.reset();
    }
}