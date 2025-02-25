export interface InputMethod {
	readonly name: string;
	readonly loadButtonText: string;

	createForm(methodArea: HTMLDivElement, loadButton: HTMLButtonElement): void;
	onClear(): void;

	getInput(): Promise<number[] | null>;
}