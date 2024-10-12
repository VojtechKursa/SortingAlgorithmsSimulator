export interface InputMethod {
	readonly name: string;
	readonly loadButtonName: string;

	createForm(methodArea: HTMLDivElement, loadButton: HTMLButtonElement): void;
	onClear(): void;

	getInput(): number[] | null;
}