import { StepDescriptionElement } from "../ElementDefinitions";

export enum StepDescriptionKind {
	FullStepDescription,
	CodeStepDescription
};

export class StepDescriptionController {
	public readonly stepDescriptionElement: StepDescriptionElement;
	public descriptions: Map<StepDescriptionKind, string> = new Map<StepDescriptionKind, string>();

	public constructor(stepDescriptionElement: StepDescriptionElement) {
		this.stepDescriptionElement = stepDescriptionElement;
	}

	public setDescription(kind: StepDescriptionKind, description: string | null) {
		if (description == null || description.length == 0)
			this.descriptions.delete(kind);
		else
			this.descriptions.set(kind, description);

		this.updateDescription();
	}

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