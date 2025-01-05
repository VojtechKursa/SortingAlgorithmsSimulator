import { CallStackController } from "../../../controllers/CallStackController";
import { StepDescriptionController } from "../../../controllers/StepDescriptionController";

export class SimulatorOutputElements {
	public constructor(
		public readonly renderer: SVGSVGElement,
		public readonly debuggerElement: HTMLDivElement,
		public readonly variableWatch: HTMLDivElement,
		public readonly stepDescriptionController: StepDescriptionController,
		public readonly callStackController: CallStackController
	) { }
}