import { FullStepResult } from "./stepResults/FullStepResult";
import { StepResult } from "./stepResults/StepResult";

export class StepResultCollection {
	private readonly collection : Array<StepResult>;
	private readonly fullStepIndexes : Array<number>;
	private pointer: number;

	private endStep: number | null;
	private endFullStep: number | null;

	public constructor (initialStep: StepResult) {
		this.collection = new Array<StepResult>();
		this.fullStepIndexes = new Array<number>();
		this.pointer = -1;

		this.endStep = this.endFullStep = null;

		this.addAndAdvance(initialStep);
	}

	public add(stepResult: StepResult): void {
		this.collection.push(stepResult);

		if (stepResult instanceof FullStepResult) {
			let fullStepResult = stepResult as FullStepResult;

			this.fullStepIndexes.push(this.collection.length - 1);

			if (fullStepResult.final) {
				this.endStep = this.collection.length - 1;
				this.endFullStep = this.fullStepIndexes.length - 1;
			}
		}
	}

	public addAndAdvance(stepResult: StepResult): void {
		this.add(stepResult);
		this.pointer = this.collection.length - 1;
	}

	public getCurrentStep(): StepResult {
		return this.collection[this.pointer];
	}

	public forward(): boolean {
		if (this.pointer + 1 < this.collection.length) {
			this.pointer++;
			return true;
		}
		
		return false;
	}

	public backward(): boolean {
		if (this.pointer > 0) {
			this.pointer--;
			return true;
		}

		return false;
	}

	public getCurrentFullStep(): FullStepResult {
		return this.collection[this.getCurrentFullStepNumber()] as FullStepResult;
	}

	public forwardFull(): boolean {
		let currentFullStep = this.getCurrentFullStepNumber();

		if (currentFullStep + 1 < this.fullStepIndexes.length) {
			this.pointer = this.fullStepIndexes[currentFullStep + 1];
			return true;
		}

		return false;
	}

	public backwardFull(): boolean {
		let currentFullStep = this.getCurrentFullStepNumber();

		if (currentFullStep - 1 >= 0) {
			this.pointer = this.fullStepIndexes[currentFullStep - 1];
			return true;
		}

		return false;
	}

	public goToStep(step: number): boolean {
		if (step > -1 && step < this.collection.length) {
			this.pointer = step;
			return true;
		}

		return false;
	}

	public goToFullStep(step: number): boolean {
		if (step > -1 && step < this.fullStepIndexes.length) {
			this.pointer = this.fullStepIndexes[step];
			return true;
		}

		return false;
	}

	public getCurrentStepNumber(): number {
		return this.pointer;
	}

	public getCurrentFullStepNumber(): number {
		if (this.pointer >= this.fullStepIndexes[this.fullStepIndexes.length - 1])
			return this.fullStepIndexes[this.fullStepIndexes.length - 1];
		
		let l = 0;
		let r = this.fullStepIndexes.length;

		while (true) {
			if (l > r)
				throw new Error("Unreachable Code Reached");

			let i = (l + r) / 2;

			let current = this.fullStepIndexes[i];
			let next = i + 1 < this.fullStepIndexes.length ? this.fullStepIndexes[i + 1] : null;

			if (current <= this.pointer && (next == null || this.pointer < next))
				return i;
			else if (this.pointer < current)
				r = i;
			else	// current < this.pointer
				l = i;
		}
	}

	public getEndStepNumber(): number | null {
		return this.endStep;
	}

	public getEndFullStepNumber(): number | null {
		return this.endFullStep;
	}

	public isCurrentStepFull(): boolean {
		return this.collection[this.pointer] instanceof FullStepResult;
	}
}