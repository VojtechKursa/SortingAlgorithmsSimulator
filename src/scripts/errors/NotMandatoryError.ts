/**
 * Error which is thrown when a non-mandatory InputPresetParameter is requested as if it was mandatory.
 */
export class NotMandatoryError extends Error {
	public constructor(public readonly parameterName: string) {
		super(`Requested mandatory value on a non-mandatory parameter ${parameterName}.`);
	}
}