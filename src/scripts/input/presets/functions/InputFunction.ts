import { InputPreset } from "../InputPreset";
import { InputParameter } from "../../parameters/InputParameter";
import { NumberParameter, RoundBehavior } from "../../parameters/NumberParameter";

export abstract class InputFunction implements InputPreset {
	public readonly name: string;
	protected parameters: InputParameter[];

	protected lengthParameter: NumberParameter;

	protected constructor(name: string) {
		this.name = name;

		this.lengthParameter = new NumberParameter("length", "Length", 10, true, 0, undefined, 1, RoundBehavior.Round);
		this.parameters = [this.lengthParameter];
	}

	public createForm(parametersDiv: HTMLDivElement, loadButton: HTMLButtonElement): void {
		this.parameters.forEach(parameter => parameter.createForm(parametersDiv, loadButton));
	}

	public onClear(): void {
		this.parameters.forEach(parameter => {
			parameter.onClear();
		});
	}

	public abstract getArray(): number[];
}