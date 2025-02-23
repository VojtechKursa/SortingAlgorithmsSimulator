/**
 * Enum of kinds of step description.
 */
export const enum StepDescriptionKind {
	FullStepDescription,
	CodeStepDescription
};

/**
 * Controller class for managing the description UI element.
 */
export class StepDescriptionController {
	/**
	 * A map storing descriptions based on their kind.
	 * @see StepDescriptionKind
	 */
	public descriptions = new Map<StepDescriptionKind, string>();

	/**
	 * Creates an instance of StepDescriptionController.
	 * @param stepDescriptionElement - The div element in which the step descriptions are to be displayed.
	 */
	public constructor(
		public readonly stepDescriptionElement: HTMLDivElement
	) { }

	/**
	 * Sets the current description for a given step kind.
	 * @param kind - The kind of step for which to set the description.
	 * @param description - The description text. If null or empty, the description is removed for the given step kind.
	 */
	public setDescription(kind: StepDescriptionKind, description: string | null) {
		if (description == null || description.length == 0)
			this.descriptions.delete(kind);
		else
			this.descriptions.set(kind, description);

		this.updateDescription();
	}

	/**
	 * Updates the displayed description by combining all currently set descriptions.
	 */
	private updateDescription() {
		let description = [];

		if (this.descriptions.has(StepDescriptionKind.FullStepDescription)) {
			description.push(this.descriptions.get(StepDescriptionKind.FullStepDescription));
		}

		if (this.descriptions.has(StepDescriptionKind.CodeStepDescription)) {
			description.push(this.descriptions.get(StepDescriptionKind.CodeStepDescription));
		}

		this.stepDescriptionElement.textContent = description.join(" | ");
	}
}