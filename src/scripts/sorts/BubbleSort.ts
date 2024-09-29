import { StepResult } from "../stepResults/StepResult";
import { StepResultArray } from "../stepResults/StepResultArray";
import { SortingAlgorithm } from "./SortingAlgorithm";
import { Highlights } from "../Highlights";
import { PresetColor } from "../PresetColor";
import { CodeStepResult } from "../stepResults/CodeStepResult";
import { FullStepResult } from "../stepResults/FullStepResult";

export class BubbleSort extends SortingAlgorithm {
    protected k: number;
    protected swapped: boolean;

    public constructor(input: number[]) {
        super(input);

        this.k = 0;
        this.swapped = false;
    }

    protected makeStepResult(final: boolean, text: string, highlightedLines: number[], l?: number, additionalHighlights?: Highlights): StepResult {
        let highlights: Highlights = new Map<number, PresetColor>();

        if (final) {
            for (let i = 0; i < this.current.length; i++) {
                highlights.set(i, PresetColor.Sorted);
            }
        }
        else {
            highlights.set(this.k, PresetColor.Highlight_1);
            highlights.set(this.k + 1, PresetColor.Highlight_2);

            if (l != undefined) {
                for (let i = l; i < this.current.length; i++) {
                    highlights.set(i, PresetColor.Sorted);
                }
            }
        }

        if (additionalHighlights) {
            for (const key of additionalHighlights.keys()) {
                let value = additionalHighlights.get(key);

                if (value)
                    highlights.set(key, value);
            }
        }

        let codeHighlights: Highlights = new Map<number, PresetColor>();
        highlightedLines.forEach(item => codeHighlights.set(item, PresetColor.CodeHighlight_1));

        return new StepResultArray(final, text, new CodeStepResult("", new Map<number, PresetColor>(), new Map<string, any>()), this.current, highlights);
    }

    protected * stepForwardInternal(): Generator<StepResult> {
        // TODO: Adapt to debugger
        do {
            this.swapped = false;

            //yield this.makeStepResult(false, "Reset 'swapped' and start next pass.", [2, 3, 4]);

            for (this.k = 0; this.k < this.current.length - 1; this.k++) {
                if (this.current[this.k] > this.current[this.k + 1]) {
                    this.swapCurrent(this.k, this.k + 1);
                    this.swapped = true;

                    yield this.makeStepResult(false, `Compare index ${this.k} and ${this.k + 1}: Element on index ${this.k} is larger and will be swapped.`, [5, 6, 7, 8])
                }
                else {
                    yield this.makeStepResult(false, `Compare index ${this.k} and ${this.k + 1}: Elements are in correct order.`, [5, 8]);
                }
            }

            //yield this.makeStepResult(false, "", [10]);

        } while (this.swapped)

        yield this.makeStepResult(true, "Array is sorted.", [this.getPseudocode.length - 1]);
    }

    protected resetInternal(): void {
        this.k = 0;
        this.swapped = false;
    }

    public getInitialStepResult(): FullStepResult {
        return new StepResultArray(this.current.length <= 1, "", new CodeStepResult("", new Map<number, PresetColor>(), new Map<string, any>()), this.current, null);
    }

    public getPseudocode(): string[] {
        return [
            "function bubbleSort(a: list_of_comparable_items)",
            "\tdo",
            "\t\tswapped := false",
            "\t\t",
            "\t\tfor k := 0 to length(a)-1 do",
            "\t\t\tif a[k] > a[k+1]",
            "\t\t\t\tswap(a[k], a[k+1])",
            "\t\t\t\tswapped := true",
            "\t\t\tend if",
            "\t\tend for",
            "\twhile swapped",
            "end function"
        ];
    }
}