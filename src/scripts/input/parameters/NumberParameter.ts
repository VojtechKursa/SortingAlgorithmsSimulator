import { InputParameter } from "./InputParameter";
import { NotMandatoryError } from "../../errors/NotMandatoryError";

export const enum RoundBehavior {
	AllowDecimals,
	Round,
	Floor,
	Ceil
};

export class NumberParameter extends InputParameter {
	public readonly initialValueNumber: number;
	public readonly roundBehavior: RoundBehavior;

	public constructor(
		machineName: string,
		readableName: string,
		initialValue: number = 0,
		mandatory: boolean = true,
		public readonly min: number | undefined = undefined,
		public readonly max: number | undefined = undefined,
		public readonly step: number | undefined = undefined,
		roundBehavior: RoundBehavior | undefined = undefined
	) {
		super(machineName, readableName, initialValue.toString(), mandatory)

		this.initialValueNumber = initialValue;

		this.roundBehavior = roundBehavior == undefined ? RoundBehavior.Round : roundBehavior;
	}

	public override createForm(parametersDiv: HTMLDivElement, loadButton: HTMLButtonElement): void {
		super.createForm(parametersDiv, loadButton);

		if (this.input != null) {
			this.input.type = "number";

			if (this.min != undefined)
				this.input.min = this.min.toString();
			if (this.max != undefined)
				this.input.max = this.max.toString();

			if (this.step != undefined)
				this.input.step = this.step.toString();
			else {
				if (this.roundBehavior == RoundBehavior.AllowDecimals) {
					this.input.step = "0.1";
				}
				else {
					this.input.step = "1";
				}
			}

			if (this.roundBehavior != RoundBehavior.AllowDecimals) {
				this.input.addEventListener("change", () => {
					if (this.input == undefined)
						return;
					let value = this.input.valueAsNumber;
					if (value == undefined || Number.isNaN(value))
						return;

					if (Math.round(value) != value) {
						let newValue;

						switch (this.roundBehavior) {
							case RoundBehavior.Ceil: newValue = Math.ceil(value); break;
							case RoundBehavior.Floor: newValue = Math.floor(value); break;
							case RoundBehavior.Round: newValue = Math.round(value); break;
							default: newValue = undefined; break;
						}

						if (newValue != undefined)
							this.input.valueAsNumber = newValue;
					}
				});
			}
		} else {
			throw new Error("Input element for input preset parameter wasn't created.");
		}
	}

	public getValueNumber(): number | null {
		if (this.input == undefined)
			return null;

		if (this.input.value == "")
			return null;
		else
			return this.input.valueAsNumber;
	}

	public getValueNumberMandatory(): number {
		if (!this.Mandatory)
			throw new NotMandatoryError(this.machineName);

		let value = this.getValueNumber();

		if (value == null)
			return this.initialValueNumber;
		else
			return value;
	}
}