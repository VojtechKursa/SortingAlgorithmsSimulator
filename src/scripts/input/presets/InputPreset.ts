export interface InputPreset {
	readonly name: string;

	createForm(parametersDiv: HTMLDivElement, loadButton: HTMLButtonElement): void;
	onClear(): void;

	getArray(): number[];
}