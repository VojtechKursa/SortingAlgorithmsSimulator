/**
 * Error which is thrown when operation with an unsupported StepResult is requested.
 */
export class UnsupportedStepResult extends Error {
	/**
	 * Creates an instance of UnsupportedStepResult.
	 * @param supportedTypes - The types of StepResults that are supported by the requested operation.
	 */
	public constructor(supportedTypes?: string[]) {
		let message = "Unsupported StepResult type."
		if (supportedTypes != undefined) {
			message += ` Supported types: ${supportedTypes.join(", ")}`
		}

		super(message);
	}
}