import { ColorSet } from "../colors/ColorSet";
import { StepDisplayVisitor } from "./StepDisplayVisitor";

export abstract class StepDisplayVisitorWithColor extends StepDisplayVisitor {
	public constructor(
		public colorSet: ColorSet,
		next: StepDisplayVisitor | null
	) {
		super(next);
	}
}