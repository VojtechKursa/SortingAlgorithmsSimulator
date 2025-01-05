import { AlgorithmState } from "../AlgorithmState";
import { CallStackFreezed } from "../CallStack";
import { StepIndexes } from "../StepIndexes";
import { CodeStepResult } from "../stepResults/CodeStepResult";
import { FullStepResult } from "../stepResults/FullStepResult";
import { StepKind, StepKindHelper } from "../stepResults/StepKind";
import { StepResult } from "../stepResults/StepResult";

class StepCounter {
	private _previousFullWasLastSubstep: boolean;

	public constructor(
		protected code: number = 0,
		protected sub: number = 0,
		protected full: number = 0,
		previousFullWasLastSubstep: boolean = false
	) {
		this._previousFullWasLastSubstep = previousFullWasLastSubstep;
	}

	public get previousFullWasLastSubstep(): boolean {
		return this._previousFullWasLastSubstep;
	}
	private set previousFullWasLastSubstep(value: boolean) {
		this._previousFullWasLastSubstep = value;
	}

	public add(stepKind: StepKind) {
		switch (stepKind) {
			case StepKind.Full:
			case StepKind.Sub:
				if (this.previousFullWasLastSubstep) {
					this.full++;
					this.sub = 0;
					this.previousFullWasLastSubstep = false;
				}
				else {
					this.sub++;
				}
			case StepKind.Code:
				this.code++;
				break;
		}

		if (stepKind == StepKind.Full) {
			this.previousFullWasLastSubstep = true;
		}
	}

	public get(stepKind: StepKind): number {
		switch (stepKind) {
			case StepKind.Code: return this.code;
			case StepKind.Sub: return this.sub;
			case StepKind.Full: return this.full;
		}
	}

	public freeze(): StepIndexes {
		return new StepIndexes(this.full, this.sub, this.code);
	}
}

class AlgorithmStateCollection {
	private steps = new Array<AlgorithmState>();
	private fullSteps = new Array<Array<AlgorithmState>>();

	public constructor(initialState: AlgorithmState) {
		this.insert(initialState);
	}

	public get lastStep(): AlgorithmState {
		return this.steps[this.steps.length - 1];
	}

	public insert(state: AlgorithmState): void {
		this.steps[state.stepsIndex.code] = state;

		if (state.stepKind != StepKind.Code) {
			const fullStepIndex = state.stepsIndex.full;

			if (this.fullSteps[fullStepIndex] == undefined)
				this.fullSteps[fullStepIndex] = [];

			this.fullSteps[fullStepIndex][state.stepsIndex.sub] = state;
		}
	}

	public get(stepKind: StepKind.Code | StepKind.Full, step: number): AlgorithmState | undefined;
	public get(stepKind: StepKind.Sub, fullStep: number, subStep: number): AlgorithmState | undefined;
	public get(stepKind: StepKind, step: number, subStep?: number): AlgorithmState | undefined {
		switch (stepKind) {
			case StepKind.Code:
				if (step >= 0 && step < this.steps.length)
					return this.steps[step];

				return undefined;
			case StepKind.Sub:
			case StepKind.Full:
				let subSteps;
				if (step >= 0 && step < this.fullSteps.length)
					subSteps = this.fullSteps[step];
				else
					return undefined;

				switch (stepKind) {
					case StepKind.Sub:
						if (subStep == undefined)
							throw new Error("Sub-step requested but sub-step index is undefined");

						if (subStep >= 0 && subStep <= subSteps.length)
							return subSteps[subStep];

						return undefined;
					case StepKind.Full:
						let possibleFullStep = subSteps[subSteps.length - 1];

						if (possibleFullStep.stepKind == StepKind.Full)
							return possibleFullStep;

						return undefined;
				}
		}
	}

	public getSubSteps(fullStepIndex: number): AlgorithmState[] | undefined {
		if (fullStepIndex >= 0 && fullStepIndex < this.fullSteps.length)
			return this.fullSteps[fullStepIndex];

		return undefined;
	}
}

export class StepResultCollection {
	private readonly stepCounter = new StepCounter(0, 0, 0, true);
	private currentStepIndexes: StepIndexes;
	private readonly states: AlgorithmStateCollection;

	private endStep: number | null = null;
	private endFullStep: number | null = null;

	public constructor(initialStep: FullStepResult) {
		let codeStep = initialStep.codeStepResult;
		let stack = undefined;

		this.currentStepIndexes = this.stepCounter.freeze();

		this.states = new AlgorithmStateCollection(new AlgorithmState(codeStep, initialStep, StepKindHelper.getStepKind(initialStep), this.currentStepIndexes, stack));
	}

	public add(stepResult: StepResult): void {
		const lastStep = this.states.lastStep;
		const stepKind = StepKindHelper.getStepKind(stepResult);
		this.stepCounter.add(stepKind);

		let fullStep = undefined;
		let codeStep = undefined;
		let stack = undefined;

		if (stepResult instanceof CodeStepResult) {
			codeStep = stepResult;
			fullStep = lastStep.fullStepResult;
		}
		else if (stepResult instanceof FullStepResult) {
			codeStep = stepResult.codeStepResult;
			fullStep = stepResult;

			if (stepResult.final) {
				this.endStep = this.stepCounter.get(StepKind.Code);
				this.endFullStep = this.stepCounter.get(StepKind.Full);
			}
		}
		else {
			throw new Error("Invalid step result received");
		}

		const lastStack = this.states.lastStep.callStack;

		if (lastStack != undefined && CallStackFreezed.equalSimple(this.states.lastStep.callStack, stack)) {
			codeStep.acceptEqualStack(lastStack);
		}

		this.states.insert(new AlgorithmState(codeStep, fullStep, stepKind, this.stepCounter.freeze(), stack));
	}

	public addAndAdvance(stepResult: StepResult): void {
		this.add(stepResult);
		this.currentStepIndexes = this.stepCounter.freeze();
	}

	public forward(kind: StepKind): boolean {
		let nextState;

		switch (kind) {
			case StepKind.Code:
				nextState = this.states.get(StepKind.Code, this.currentStepIndexes.code + 1);
				break;
			case StepKind.Full:
			case StepKind.Sub:
				if (kind == StepKind.Full) {
					// Get to the end of current full step's substeps
					nextState = this.states.get(StepKind.Full, this.currentStepIndexes.full);
				}
				else {
					// Get the current substep
					nextState = this.states.get(StepKind.Sub, this.currentStepIndexes.full, this.currentStepIndexes.sub);
				}

				// If there isn't even the current step can't continue further
				if (nextState == undefined)
					return false;

				// If already at the step or past it, go to the next one
				if (this.currentStepIndexes.code >= nextState.stepsIndex.code) {
					if (kind == StepKind.Full) {
						nextState = this.states.get(StepKind.Full, this.currentStepIndexes.full + 1);
					}
					else {
						nextState = this.states.get(StepKind.Sub, this.currentStepIndexes.full, this.currentStepIndexes.sub + 1);

						// If next substep in the current steps doesn't exist, go to the beginning of the next substeps
						if (nextState == undefined) {
							nextState = this.states.get(StepKind.Sub, this.currentStepIndexes.full + 1, 0);
						}
					}
				}

				break;
		}

		if (nextState != undefined) {
			this.currentStepIndexes = nextState.stepsIndex;
			return true;
		}
		else
			return false;
	}

	public backward(kind: StepKind): boolean {
		let nextState;

		switch (kind) {
			case StepKind.Code:
				nextState = this.states.get(StepKind.Code, this.currentStepIndexes.code - 1);
				break;
			case StepKind.Full:
			case StepKind.Sub:
				// Get the current step of the desired kind
				if (kind == StepKind.Full)
					nextState = this.states.get(StepKind.Full, this.currentStepIndexes.full);
				else
					nextState = this.states.get(StepKind.Sub, this.currentStepIndexes.full, this.currentStepIndexes.sub);

				// If the current full step is undefined, we can't be past it, so go to the previous step
				// If we are before or at the current step, go to the previous step (if past it, nextState stays at the current step, going back to it)
				if (nextState == undefined || this.currentStepIndexes.code <= nextState.stepsIndex.code) {
					if (kind == StepKind.Full)
						nextState = this.states.get(StepKind.Full, this.currentStepIndexes.full - 1);
					else {
						nextState = this.states.get(StepKind.Sub, this.currentStepIndexes.full, this.currentStepIndexes.sub - 1);

						// If previous substep in the current sub-steps doesn't exist, go to the end of previous substeps
						if (nextState == undefined) {
							nextState = this.states.get(StepKind.Full, this.currentStepIndexes.full - 1);
						}
					}
				}

				break;
		}

		if (nextState != undefined) {
			this.currentStepIndexes = nextState.stepsIndex;
			return true;
		}
		else
			return false;
	}

	public getCurrentStepNumbers(): StepIndexes {
		return this.currentStepIndexes;
	}

	public getCurrentStep(): AlgorithmState {
		const state = this.states.get(StepKind.Code, this.currentStepIndexes.code);

		if (state == undefined)
			throw new Error("Current step doesn't exist");

		return state;
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
					fullStepNumber = this.currentStepIndexes.full;

				const subSteps = this.states.getSubSteps(fullStepNumber);
				if (subSteps == undefined)
					throw new Error("Invalid full step number");

				if (subSteps[subSteps.length - 1].stepKind == StepKind.Full)
					return subSteps.length - 1;
				else
					return null;
		}
	}

	public goToStep(step: number): boolean;
	public goToStep(step: number, kind: StepKind.Code | StepKind.Full): boolean;
	public goToStep(fullStep: number, kind: StepKind.Sub, subStep: number): boolean;
	public goToStep(step: number, kind: StepKind = StepKind.Code, subStep?: number): boolean {
		let state;

		switch (kind) {
			case StepKind.Code:
			case StepKind.Full:
				state = this.states.get(kind, step);
				break;

			case StepKind.Sub:
				if (subStep == undefined)
					throw new Error("goToStep called with SubStep step kind, but no sub-step index was given");

				state = this.states.get(StepKind.Sub, step, subStep);
				break;
		}

		if (state != undefined) {
			this.currentStepIndexes = state.stepsIndex;
			return true;
		}
		else
			return false;
	}

	public goToLastKnownStep(): void {
		this.currentStepIndexes = this.states.lastStep.stepsIndex;
	}

	public getLastKnownStepNumber(): number;
	public getLastKnownStepNumber(kind: StepKind.Code | StepKind.Full): number;
	public getLastKnownStepNumber(kind: StepKind.Sub, fullStep?: number): number;
	public getLastKnownStepNumber(kind: StepKind = StepKind.Code, fullStep?: number): number {
		const lastStepIndexes = this.states.lastStep.stepsIndex;

		switch (kind) {
			case StepKind.Code: return lastStepIndexes.code;
			case StepKind.Full: return lastStepIndexes.full;
			case StepKind.Sub:
				if (fullStep == undefined)
					fullStep = this.currentStepIndexes.full;

				const subSteps = this.states.getSubSteps(fullStep);
				if (subSteps == undefined)
					throw new Error("Invalid full step number");

				return subSteps.length - 1;
		}
	}

	public getStepKind(stepIndex: number = this.currentStepIndexes.code): StepKind {
		const currentStep = this.states.get(StepKind.Code, stepIndex);

		if (currentStep != undefined)
			return currentStep.stepKind;
		else
			throw new Error("Current step doesn't exist");
	}
}