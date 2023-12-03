import { StepResult } from "../stepResults/StepResult";

export abstract class SortingAlgorithm {
    private input: Array<number>;
    protected current: Array<number>;
    private finalStepResult: StepResult | null;

    protected constructor(input: Array<number>) {
        this.input = input;
        this.current = input;
        this.finalStepResult = null;
    }

    public setInput(input: Array<number>) {
        this.input = input;
        this.current = input;
    }

    public isCompleted() {
        return this.finalStepResult != null;
    }

    public stepForward() {
        if(this.finalStepResult != null)
            return this.finalStepResult;

        let result = this.stepForwardInternal();

        if(result.final)
            this.finalStepResult = result;

        return result;
    }

    public reset() {
        this.current = this.input;
        this.finalStepResult = null;

        this.resetInternal();
    }

    protected abstract stepForwardInternal(): StepResult;
    protected abstract resetInternal(): void;

    public abstract currentStepResult(): StepResult;
    public abstract getPseudocode(): string[];
}