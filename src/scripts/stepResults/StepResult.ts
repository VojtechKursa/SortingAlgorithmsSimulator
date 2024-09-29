export abstract class StepResult {
    public readonly text: string;

    protected constructor(text: string) {
        this.text = text;
    }
}