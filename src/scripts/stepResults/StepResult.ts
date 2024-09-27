export abstract class StepResult {
    public readonly text: string;
    public readonly isFullStep: boolean;    // false for code steps

    protected constructor(text: string, isFullStep: boolean) {
        this.text = text;
        this.isFullStep = isFullStep;
    }
}