/**
 * Error which is thrown when a non-mandatory InputPresetParameter is requested as if it was mandatory.
 */
export class NotMandatoryError extends Error {
	/**
	 * Creates an instance of NotMandatoryError.
	 * @param parameterName - The name of the parameter that was requested as mandatory, but isn't.
	 */
	public constructor(public readonly parameterName: string) {
		super(`Requested mandatory value on a non-mandatory parameter ${parameterName}.`);
	}
}