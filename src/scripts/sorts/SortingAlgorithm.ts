import { IndexedNumber } from "../IndexedNumber";
import { CodeStepResult } from "../stepResults/CodeStepResult";
import { FullStepResult } from "../stepResults/FullStepResult";
import { StepResult } from "../stepResults/StepResult";

class TemporaryIndexedNumber {
    public constructor(
        public readonly value: number,
        public index: number | null
    ) { }

    public freeze(): IndexedNumber {
        return new IndexedNumber(this.value, this.index);
    }
};

class IndexingData {
    public constructor(
        public lastUsedIndex: number,
        public readonly firstNumber: TemporaryIndexedNumber
    ) { }
}



export abstract class SortingAlgorithm {
    private input: Array<IndexedNumber>;
    protected current: Array<IndexedNumber>;
    private finalStepResult: FullStepResult | null;
    private generator: Generator<StepResult>;

    protected constructor(input: number[]) {
        this.input = this.indexInput(input);
        this.current = this.input.slice();
        this.finalStepResult = null;

        this.generator = this.stepForwardInternal();
    }

    public setInput(input: number[]): void {
        this.input = this.indexInput(input);

        this.reset();
    }

    private indexInput(input: number[]): IndexedNumber[] {
        let indexes = new Map<number, IndexingData>();
        let result = new Array<TemporaryIndexedNumber>();

        for (const num of input) {
            let indexData = indexes.get(num);
            let indexedNumber;

            if (indexData == undefined) {
                indexedNumber = new TemporaryIndexedNumber(num, null);
                indexes.set(num, new IndexingData(1, indexedNumber));
            } else {
                if (indexData.lastUsedIndex == 1) {
                    indexData.firstNumber.index = 1;
                }

                indexData.lastUsedIndex++;

                indexedNumber = new TemporaryIndexedNumber(num, indexData.lastUsedIndex);
            }

            result.push(indexedNumber);
        }

        return result.map(value => value.freeze());
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

        if (result instanceof FullStepResult && result.final)
            this.finalStepResult = result as FullStepResult;

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