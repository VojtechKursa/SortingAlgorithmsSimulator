import { FullStepResult } from "../stepResults/FullStepResult";
import { StepKind, StepKindHelper } from "../stepResults/StepKind";
import { StepResult } from "../stepResults/StepResult";

export class StepResultCollection {
	private readonly steps: Array<StepResult>;
	private readonly fullStepIndexes: Array<Array<number>>;
	private pointer: number;

	private previousFullWasLastSubstep: boolean = false;
	private endStep: number | null;
	private endFullStep: number | null;

	public constructor(initialStep: StepResult) {
		this.steps = new Array<StepResult>();
		this.fullStepIndexes = new Array<Array<number>>();
		this.pointer = 0;

		this.endStep = this.endFullStep = null;

		this.fullStepIndexes.push([0]);
		this.steps.push(initialStep);
		
		if (initialStep instanceof FullStepResult) {
			this.previousFullWasLastSubstep = initialStep.isLastSubstep;
		}
	}

	public add(stepResult: StepResult): void {
		this.steps.push(stepResult);

		if (stepResult instanceof FullStepResult) {
			if (this.previousFullWasLastSubstep)
				this.fullStepIndexes.push([this.steps.length - 1]);
			else
				this.fullStepIndexes[this.fullStepIndexes.length - 1].push(this.steps.length - 1);

			if (stepResult.final) {
				this.endStep = this.steps.length - 1;
				this.endFullStep = this.fullStepIndexes.length - 1;
			}

			this.previousFullWasLastSubstep = stepResult.isLastSubstep;
		}
	}

	public addAndAdvance(stepResult: StepResult): void {
		this.add(stepResult);
		this.pointer = this.steps.length - 1;
	}

	public forward(kind: StepKind): boolean {
		switch (kind) {
			case StepKind.Code:
				if (this.pointer + 1 < this.steps.length) {
					this.pointer++;
					return true;
				}
				return false;
			
			case StepKind.Sub:
			case StepKind.Full:
				let currentFullStepIndexes = this.getCurrentStepNumber(StepKind.Full, false);
				let subStepIndexes: number[] | undefined;
				let currentStepKind = this.getStepKind();

				if (currentStepKind == StepKind.Full) {
					if (currentFullStepIndexes[0] + 1 < this.fullStepIndexes.length) {
						subStepIndexes = this.fullStepIndexes[currentFullStepIndexes[0] + 1];
					}
				} else {
					subStepIndexes = this.fullStepIndexes[currentFullStepIndexes[0]];
				}

				if (subStepIndexes == undefined)
					return false;

				let targetIndex: number | undefined;

				if (kind == StepKind.Full) {
					targetIndex = subStepIndexes[subStepIndexes.length - 1];
				} else {
					if (currentStepKind == StepKind.Full) {
						if (currentFullStepIndexes[0] + 1 < this.fullStepIndexes.length) {
							subStepIndexes = this.fullStepIndexes[currentFullStepIndexes[0] + 1];
							targetIndex = subStepIndexes[0];
						}
					}
					else {
						if (currentFullStepIndexes[1] + 1 < subStepIndexes.length)
							targetIndex = subStepIndexes[currentFullStepIndexes[1] + 1]
						else if (currentFullStepIndexes[0] + 1 < this.fullStepIndexes.length) {
							subStepIndexes = this.fullStepIndexes[currentFullStepIndexes[0] + 1];
							targetIndex = subStepIndexes[0];
						}
					}
				}

				if (targetIndex == undefined)
					return false;

				if (kind == StepKind.Sub || (kind == StepKind.Full && this.getStepKind(targetIndex) == StepKind.Full)) {
					this.pointer = targetIndex;
					return true;
				}

				return false;
		}
	}

	public backward(kind: StepKind): boolean {
		let currentFullStepIndexes: [number, number];

		switch (kind) {
			case StepKind.Code:
				if (this.pointer > 0) {
					this.pointer--;
					return true;
				}
				return false;
			
			case StepKind.Sub:
				currentFullStepIndexes = this.getCurrentStepNumber(StepKind.Full, false);
				let targetIndex: number | undefined;

				if (currentFullStepIndexes[1] > 0) {						
					let subStepIndexes = this.fullStepIndexes[currentFullStepIndexes[0]];
					targetIndex = subStepIndexes[currentFullStepIndexes[1] - 1];
				} else if (currentFullStepIndexes[0] - 1 >= 0) {
					let subStepIndexes = this.fullStepIndexes[currentFullStepIndexes[0] - 1];
					targetIndex = subStepIndexes[subStepIndexes.length - 1];
				}

				if (targetIndex == undefined)
					return false;

				this.pointer = targetIndex;
				return true;
			
			case StepKind.Full:
				currentFullStepIndexes = this.getCurrentStepNumber(StepKind.Full, false);

				if (currentFullStepIndexes[0] - 1 >= 0) {
					let subStepIndexes = this.fullStepIndexes[currentFullStepIndexes[0] - 1];
					let targetIndex = subStepIndexes[subStepIndexes.length - 1];

					this.pointer = targetIndex;
					return true;
				}

				return false;
		}
	}

	public getCurrentStepNumber(): number;
	public getCurrentStepNumber(kind: StepKind.Code): number;
	public getCurrentStepNumber(kind: StepKind.Full | StepKind.Sub, justOne: true): number;
	public getCurrentStepNumber(kind: StepKind.Full | StepKind.Sub, justOne: false): [number, number];
	public getCurrentStepNumber(kind: StepKind = StepKind.Code, justOne?: boolean): number | [number, number] {
		switch (kind) {
			case StepKind.Code:
				return this.pointer;
			
			case StepKind.Sub:
			case StepKind.Full:
				let stepIndexes = this.binarySearchFullStepIndex();
				if (justOne) {
					if (kind == StepKind.Full)
						return stepIndexes[0];
					else
						return stepIndexes[1];
				} else {
					return stepIndexes;
				}
		}
	}

	private binarySearchFullStepIndex(targetStep: number = this.pointer): [number, number] {
		let current = this.fullStepIndexes[this.fullStepIndexes.length - 1];

		if (targetStep >= current[0]) {
			return [this.fullStepIndexes.length - 1, this.getSubstepIndex(current, targetStep)];
		}

		let l = 0;
		let r = this.fullStepIndexes.length - 1;

		while (l <= r) {
			let i = Math.floor((l + r) / 2);

			current = this.fullStepIndexes[i];
			let next = i + 1 < this.fullStepIndexes.length ? this.fullStepIndexes[i + 1] : null;

			if (targetStep >= current[0] && (next == null || targetStep < next[0]))
				return [i, this.getSubstepIndex(current, targetStep)];
			else if (targetStep < current[0])
				r = i - 1;
			else	// targetStep > current
				l = i + 1;
		}

		throw new Error("Full step indexes for given target step not found");
	}

	private getSubstepIndex(subSteps: Array<number>, targetStep: number): number {
		for (let i = subSteps.length - 1; i >= 0; i--) {
			if (subSteps[i] <= targetStep)
				return i;
		}
		
		throw new Error("Invalid substeps array for specified target step");
	}

	public getEndStepNumber(): number | null;
	public getEndStepNumber(kind: StepKind.Code | StepKind.Full): number | null;
	public getEndStepNumber(kind: StepKind.Sub, fullStepNumber?: number): number | null;
	public getEndStepNumber(kind: StepKind = StepKind.Code, fullStepNumber?: number): number | null {
		switch (kind) {
			case StepKind.Code: return this.endStep;
			case StepKind.Full: return this.endFullStep;
			case StepKind.Sub:
				if (fullStepNumber == undefined)
					fullStepNumber = this.getCurrentStepNumber(StepKind.Full, true);
				else if (fullStepNumber < 0 || fullStepNumber >= this.fullStepIndexes.length)
					throw new Error("Invalid full step number");

				let subStepIndexes = this.fullStepIndexes[fullStepNumber];
				if (this.getStepKind(subStepIndexes[subStepIndexes.length - 1]) == StepKind.Full)
					return subStepIndexes.length - 1;
				else
					return null;
		}
	}

	public getCurrentStep(): StepResult;
	public getCurrentStep(kind: StepKind.Code): StepResult;
	public getCurrentStep(kind: StepKind.Sub | StepKind.Full): FullStepResult;
	public getCurrentStep(kind: StepKind = StepKind.Code): StepResult {
		switch (kind) {
			case StepKind.Code: return this.steps[this.pointer];
			case StepKind.Sub:
			case StepKind.Full: return this.steps[this.getCurrentStepNumber(kind, true)] as FullStepResult;
		}
	}

	public goToStep(step: number): boolean;
	public goToStep(step: number, kind: StepKind.Code | StepKind.Full): boolean;
	public goToStep(fullStep: number, kind: StepKind.Sub, subStep: number): boolean;
	public goToStep(step: number, kind: StepKind = StepKind.Code, subStep?: number): boolean {
		switch (kind) {
			case StepKind.Code:
				if (step > -1 && step < this.steps.length) {
					this.pointer = step;
					return true;
				}
				return false;
			
			case StepKind.Sub:
				if (subStep == undefined)
					throw new Error("goToStep called with SubStep step kind, but no sub-step index was given");

				if (step > -1 && step < this.fullStepIndexes.length) {
					let subStepIndexes = this.fullStepIndexes[step];

					if (subStep > -1 && subStep < subStepIndexes.length - 1) {
						let targetIndex = subStepIndexes[subStep];

						this.pointer = targetIndex;
						return true;
					}
				}
				return false;
			
			case StepKind.Full:
				if (step > -1 && step < this.fullStepIndexes.length) {
					let subStepIndexes = this.fullStepIndexes[step];
					let targetIndex = subStepIndexes[subStepIndexes.length - 1];
					
					if (this.getStepKind(targetIndex) == StepKind.Full) {
						this.pointer = targetIndex;
						return true;
					}
				}
				return false;
		}
	}

	public goToLastKnownStep(): void {
		this.pointer = this.steps.length - 1;
	}

	public getLastKnownStepNumber(): number;
	public getLastKnownStepNumber(kind: StepKind.Code | StepKind.Full): number;
	public getLastKnownStepNumber(kind: StepKind.Sub, fullStep?: number): number;
	public getLastKnownStepNumber(kind: StepKind = StepKind.Code, fullStep?: number): number {
		switch (kind) {
			case StepKind.Code: return this.steps.length - 1;
			case StepKind.Full: return this.fullStepIndexes.length - 1;
			case StepKind.Sub:
				if (fullStep == undefined)
					fullStep = this.getCurrentStepNumber(StepKind.Full, true);
				else if (fullStep < 0 || fullStep >= this.fullStepIndexes.length)
					throw new Error("Invalid full step number");

				return this.fullStepIndexes[fullStep].length - 1;
		}
	}

	public getStepKind(stepIndex: number = this.pointer): StepKind {
		const currentStep = this.steps[stepIndex];

		return StepKindHelper.getStepKind(currentStep);
	}
}