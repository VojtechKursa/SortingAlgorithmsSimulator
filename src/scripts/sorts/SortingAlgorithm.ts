import { CodeStepResult } from "../stepResults/CodeStepResult";
import { FullStepResult } from "../stepResults/FullStepResult";
import { StepResult } from "../stepResults/StepResult";

export abstract class SortingAlgorithm {
    private input: Array<number>;
    protected current: Array<number>;
    private finalStepResult: FullStepResult | null;
    private generator: Generator<StepResult>;

    protected constructor(input: number[]) {
        this.input = input.slice();
        this.current = input.slice();
        this.finalStepResult = null;

        this.generator = this.stepForwardInternal();
    }

    public setInput(input: number[]): void {
        this.input = input.slice();

        this.reset();
    }

    public reset(): FullStepResult {
        this.current = this.input.slice();
        this.finalStepResult = null;

        this.resetInternal();

        this.generator = this.stepForwardInternal();

        return this.getInitialStepResult();
    }

    public isCompleted(): boolean {
        return this.finalStepResult != null;
    }

    public stepForwardFull(): [StepResult, CodeStepResult[]] {
        if (this.finalStepResult != null)
            return [this.finalStepResult, []];

        let codeResults = new Array<CodeStepResult>();
        let stepResult: FullStepResult | null = null;

        do {
            let result = this.stepForward();

            if (result instanceof FullStepResult)
                stepResult = result as FullStepResult;
            else
                codeResults.push(result as CodeStepResult);
        } while (stepResult == null);
        
        if (stepResult.final)
            this.finalStepResult = stepResult;

        return [stepResult, codeResults];
    }

    public stepForward(): StepResult {
        if (this.finalStepResult != null)
            return this.finalStepResult;

        let result = this.generator.next().value as StepResult;

        return result;
    }

    protected swapCurrent(indexA: number, indexB: number): void {
        let tmp = this.current[indexA];
        this.current[indexA] = this.current[indexB];
        this.current[indexB] = tmp;
    }

    protected abstract stepForwardInternal(): Generator<StepResult>;
    protected abstract resetInternal(): void;

    public abstract getInitialStepResult(): FullStepResult;
    public abstract getPseudocode(): string[];
}