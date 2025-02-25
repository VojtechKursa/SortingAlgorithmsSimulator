import { InputParameter } from "./InputParameter";
import { NotMandatoryError } from "../../errors/NotMandatoryError";

/**
 * An enumeration representing a desired behavior of rounding a decimal number to an integer.
 */
export const enum RoundBehavior {
	/**
	 * Allow the number to be decimal (don't round).
	 */
	AllowDecimals,

	/**
	 * Round the number to the nearest integer.
	 */
	Round,

	/**
	 * Round the number down to the nearest integer.
	 */
	Floor,

	/**
	 * Round the number up to the nearest integer.
	 */
	Ceil
};

/**
 * A class representing a numeric input parameter.
 *
 * @see {@link InputParameter}
 */
export class NumberParameter extends InputParameter {
	/**
	 * The initial value of the parameter as a number.
	 */
	public readonly initialValueNumber: number;

	/**
	 * The behavior of rounding a decimal number to an integer selected for this parameter.
	 */
	public readonly roundBehavior: RoundBehavior;

	/**
	 * @param machineName - The machine name of the parameter.
	 * @param readableName - The human-readable name of the parameter.
	 * @param initialValue - The initial value of the parameter. Defaults to 0.
	 * @param mandatory - Whether the parameter is mandatory. Defaults to true.
	 * @param min - The minimum value of the parameter. Not enforced if undefined.
	 * @param max - The maximum value of the parameter. Not enforced if undefined.
	 * @param step - The step of the parameter. Defining the steps of the input field. Defaults to 1 for integers and 0.1 for decimals.
	 * @param roundBehavior - The behavior of rounding a decimal number to an integer selected for this parameter. Defaults to RoundBehavior.Round.
	 * 							Set to RoundBehavior.AllowDecimals to allow decimal numbers.
	 *
	 * @see {@link RoundBehavior}
	 */
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

	/**
	 * Retrieves the value of the input parameter as a number.
	 *
	 * @returns The value of the input parameter as a number or null if empty.
	 */
	public getValueNumber(): number | null {
		if (this.input == undefined)
			return null;

		if (this.input.value == "")
			return null;
		else
			return this.input.valueAsNumber;
	}

	/**
	 * Retrieves the value of the input parameter as a number. Assumes the parameter is mandatory.
	 *
	 * @returns The value of the input parameter as a number.
	 * @throws NotMandatoryError - If the parameter is not mandatory.
	 */
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