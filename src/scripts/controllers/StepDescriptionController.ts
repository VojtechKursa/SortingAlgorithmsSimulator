/**
 * Controller class for managing the description UI element.
 */
export class StepDescriptionController {
	/**
	 * @param stepDescriptionElement - The div element in which the step descriptions are to be displayed.
	 */
	public constructor(
		public readonly stepDescriptionElement: HTMLDivElement
	) { }

	/**
	 * Sets the description for the current step.
	 * @param description - The description text. If null or empty, the description.
	 */
	public setDescription(description: string | null) {
		if (description == null)
			description = "";

		this.stepDescriptionElement.textContent = description;
	}
}