/**
 * Error which is thrown when operation with an unsupported StepResult is requested.
 */
export class UnsupportedStepResult extends Error {
	public constructor(supportedTypes?: string[]) {
		let message = "Unsupported StepResult type."
		if (supportedTypes != undefined) {
			message += ` Supported types: ${supportedTypes.join(", ")}`
		}

		super(message);
	}
}