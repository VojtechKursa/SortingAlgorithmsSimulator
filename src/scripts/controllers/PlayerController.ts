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
    private resetButton: HTMLButtonElement;

    public colorSet: ColorSet;

    public constructor(outputElement: OutputElement, colorSet: ColorSet, algorithm: SortingAlgorithm, 
        backButton: HTMLButtonElement,
        forwardButton: HTMLButtonElement,
        stepOutput: HTMLOutputElement,
        playButton: HTMLInputElement,
        pauseButton: HTMLInputElement,
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

    private drawCurrent() {
        this.results[this.currentStep].draw(this.outputElement, this.colorSet);

        this.stepOutput.value = `${this.currentStep} / ${this.endStep == null ? "?" : this.endStep}`
    }

    private forward() {
        if(this.currentStep + 1 < this.results.length) {
            this.currentStep++;
            this.drawCurrent();
        }
        else {
            if(!this.algorithm.isCompleted()) {
                let result = this.algorithm.stepForward();

                this.results.push(result);
                this.currentStep = this.currentStep++;

                if(result.final) {
                    this.endStep = this.currentStep;
                }

                this.drawCurrent();
            }
        }

        if(this.endStep != null && this.currentStep == this.endStep) {
            this.forwardButton.disabled = true;
            this.playButton.disabled = true;
        }
        else if(this.forwardButton.disabled) {
            this.forwardButton.disabled = false;
            this.playButton.disabled = false;
        }
    }

    private backward() {
        if (this.currentStep > 0) {
            this.currentStep--;

            this.drawCurrent();
        }

        if(this.currentStep == 0) {
            this.backButton.disabled = true;
        }
        else if(this.backButton.disabled) {
            this.backButton.disabled = false;
        }
    }

    public getStep() {
        return this.currentStep;
    }

    public getEndStep() {
        return this.endStep;
    }

    private play(intervalMs: number = 1000) {
        if(this.autoPlayTimerId == null) {
            this.autoPlayTimerId = setInterval(this.forward, intervalMs);
        }
    }

    private pause() {
        if(this.autoPlayTimerId != null) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;
        }
    }

    private reset() {
        if(this.autoPlayTimerId != null) {
            clearInterval(this.autoPlayTimerId);
            this.autoPlayTimerId = null;
        }

        this.results = new Array<StepResult>();
        this.results.push(this.algorithm.currentStepResult());

        this.currentStep = 0;

        this.drawCurrent();

        this.backButton.disabled = true;
        this.playButton.disabled = false;
        this.forwardButton.disabled = false;
    }

    public setInput(input: number[]) {
        this.algorithm.setInput(input);

        this.reset();
    }
}