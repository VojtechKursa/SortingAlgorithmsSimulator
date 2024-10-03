import { StepResult } from "../stepResults/StepResult";
import { StepResultArray } from "../stepResults/StepResultArray";
import { SortingAlgorithm } from "./SortingAlgorithm";
import { Highlights } from "../Highlights";
import { PresetColor } from "../PresetColor";
import { CodeStepResult } from "../stepResults/CodeStepResult";
import { FullStepResult } from "../stepResults/FullStepResult";

enum HighlightState {
    Selected,
    OrderCorrect,
    OrderSwapped
};

export class BubbleSort extends SortingAlgorithm {
    protected k: number;
    protected swapped: boolean;

    public constructor(input: number[]) {
        super(input);

        this.k = 0;
        this.swapped = false;
    }

    protected makeFullStepResult(final: boolean, text: string, highlightState: HighlightState | undefined, highlightedLines: number[] | number, l?: number, additionalHighlights?: Highlights): StepResult {
        let highlights: Highlights = new Map<number, PresetColor>();

        if (typeof highlightedLines == "number") {
            highlightedLines = [highlightedLines];
        }

        if (final) {
            for (let i = 0; i < this.current.length; i++) {
                highlights.set(i, PresetColor.Sorted);
            }
        }
        else {
            if (highlightState == HighlightState.Selected) {
                highlights.set(this.k, PresetColor.Highlight_1);
                highlights.set(this.k + 1, PresetColor.Highlight_2);
            }
            else if (highlightState == HighlightState.OrderCorrect) {
                highlights.set(this.k, PresetColor.ElementOrderCorrect);
                highlights.set(this.k + 1, PresetColor.ElementOrderCorrect);
            }
            else if (highlightState == HighlightState.OrderSwapped) {
                highlights.set(this.k, PresetColor.ElementOrderSwapped);
                highlights.set(this.k + 1, PresetColor.ElementOrderSwapped);
            }

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

        return new StepResultArray(final, text, this.makeCodeStepResult(highlightedLines), this.current, highlights);
    }

    protected makeCodeStepResult(highlightedLines: number[] | number, variables: Map<string, any> | undefined = undefined, text: string | undefined = undefined): CodeStepResult {
        if (typeof highlightedLines == "number")
            highlightedLines = [highlightedLines];

        let highlights = new Map<number, PresetColor>();
        highlightedLines.forEach(line => highlights.set(line, PresetColor.CodeHighlight_1));

        return new CodeStepResult(text != undefined ? text : "", highlights, variables != undefined ? variables : new Map<string, any>())
    }

    protected * stepForwardInternal(): Generator<StepResult> {
        yield this.makeCodeStepResult(1);

        do {
            this.swapped = false;

            yield this.makeCodeStepResult(2);

            yield this.makeCodeStepResult(4);

            for (this.k = 0; this.k < this.current.length - 1; this.k++) {
                yield this.makeFullStepResult(false, `Compare index ${this.k} and ${this.k + 1}`, HighlightState.Selected, 5)

                if (this.current[this.k] > this.current[this.k + 1]) {
                    this.swapCurrent(this.k, this.k + 1);
                    this.swapped = true;

                    yield this.makeFullStepResult(false, `Compare index ${this.k} and ${this.k + 1}: Element on index ${this.k} is larger, elements will be swapped.`, HighlightState.OrderSwapped, [6, 7]);

                    yield this.makeCodeStepResult(8);
                }
                else {
                    yield this.makeFullStepResult(false, `Compare index ${this.k} and ${this.k + 1}: Elements are in correct order.`, HighlightState.OrderCorrect, 8);
                }

                yield this.makeCodeStepResult(4);
            }

            yield this.makeCodeStepResult(9);
            yield this.makeCodeStepResult(10);
        } while (this.swapped)

        yield this.makeFullStepResult(true, "Array is sorted.", undefined, [this.getPseudocode().length - 1]);
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