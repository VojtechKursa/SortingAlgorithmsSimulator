import { StepResult } from "../stepResults/StepResult";
import { BubbleSort } from "./BubbleSort";

export class BubbleSortOptimized extends BubbleSort {
    private l: number;

    public constructor(input: number[]) {
        super(input);

        this.l = this.current.length;
    }

    protected * stepForwardInternal(): Generator<StepResult> {
        let next_l = this.current.length;

        while (next_l >= 2) {
            this.l = next_l;
            next_l = 0;

            for (this.k = 0; this.k < this.l - 1; this.k++) {
                if (this.current[this.k] > this.current[this.k + 1]) {
                    this.swapCurrent(this.k, this.k + 1);
                    next_l = this.k + 1;
                }

                yield this.makeStepResult(false, "", [], this.l);
            }
        }

        yield this.makeStepResult(true, "", []);
    }

    protected resetInternal(): void {
        super.resetInternal();

        this.l = this.current.length;
    }

    public getPseudocode(): string[] {
        return [
            "function bubbleSort(a: list of comparable items)",
            "\tnext_l := length(a)",
            "\t",
            "\twhile next_l >= 2",
            "\t\tl := next_l",
            "\t\tnext_l := 0",
            "\t\t",
            "\t\tfor k := 0 to l-2 do",
            "\t\t\tif a[k] > a[k+1]",
            "\t\t\t\tswap(a[k], a[k+1])",
            "\t\t\t\tnext_l := k + 1",
            "\t\t\tend if",
            "\t\tend for",
            "\tend for",
            "end function"
        ];
    }
}