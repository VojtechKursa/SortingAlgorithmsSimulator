import { StepResult } from "../stepResults/StepResult";

export abstract class SortingAlgorithm {
    private input: Array<number>;
    protected current: Array<number>;
    private finalStepResult: StepResult | null;
    private generator: Generator<StepResult>;

    protected constructor(input: number[]) {
        this.input = input.slice();
        this.current = input.slice();
        this.finalStepResult = null;

        this.generator = this.stepForwardInternal();
    }

    public setInput(input: number[]) {
        this.input = input.slice();

        this.reset();
    }

    public isCompleted() {
        return this.finalStepResult != null;
    }

    public stepForward() {
        if(this.finalStepResult != null)
            return this.finalStepResult;

        let result = this.generator.next().value as StepResult;

        if(result.final)
            this.finalStepResult = result;

        return result;
    }

    public reset() {
        this.current = this.input.slice();
        this.finalStepResult = null;

        this.resetInternal();

        this.generator = this.stepForwardInternal();

        return this.currentStepResult();
    }

    protected swapCurrent(indexA: number, indexB: number) {
        let tmp = this.current[indexA];
        this.current[indexA] = this.current[indexB];
        this.current[indexB] = tmp;
    }

    protected abstract stepForwardInternal(): Generator<StepResult>;
    protected abstract resetInternal(): void;

    public abstract currentStepResult(): StepResult;
    public abstract getPseudocode(): string[];
}