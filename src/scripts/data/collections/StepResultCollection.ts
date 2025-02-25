import { AlgorithmState } from "../AlgorithmState";
import { CallStackFrozen } from "../CallStack";
import { StepIndexes } from "../StepIndexes";
import { CodeStepResult } from "../stepResults/CodeStepResult";
import { FullStepResult } from "../stepResults/FullStepResult";
import { StepKind, StepKindHelper } from "../stepResults/StepKind";
import { StepResult } from "../stepResults/StepResult";

/**
 * Class representing a counter for all types of steps in a sorting algorithm.
 */
class StepCounter {
	/**
	 * Indicates if the previous step was the last sub-step of a full step.
	 */
	private _previousFullWasLastSubstep: boolean;

	/**
	 * @param code - The initial count of code steps.
	 * @param sub - The initial count of sub-steps.
	 * @param full - The initial count of full steps.
	 * @param previousFullWasLastSubstep - Whether the the previous step was the last sub-step of a full step.
	 */
	public constructor(
		protected code: number = 0,
		protected sub: number = 0,
		protected full: number = 0,
		previousFullWasLastSubstep: boolean = false
	) {
		this._previousFullWasLastSubstep = previousFullWasLastSubstep;
	}

	/**
	 * Gets the value indicating if the previous step was the last sub-step of a full step.
	 */
	public get previousFullWasLastSubstep(): boolean {
		return this._previousFullWasLastSubstep;
	}

	/**
	 * Sets the value indicating if the previous step was the last sub-step of a full step.
	 */
	private set previousFullWasLastSubstep(value: boolean) {
		this._previousFullWasLastSubstep = value;
	}

	/**
	 * Increments the counter by 1 of the specified kind.
	 * @param stepKind - The kind of step to increment the counter.
	 */
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

	/**
	 * Gets the state of the step counter for the specified kind of step.
	 * @param stepKind - The kind of step to get the count for.
	 * @returns The count of steps of the specified kind.
	 */
	public get(stepKind: StepKind): number {
		switch (stepKind) {
			case StepKind.Code: return this.code;
			case StepKind.Sub: return this.sub;
			case StepKind.Full: return this.full;
		}
	}

	/**
	 * Freezes the current StepCounter object into a read-only StepIndexes object.
	 * @returns A StepIndexes object containing the the current step counts.
	 */
	public freeze(): StepIndexes {
		return new StepIndexes(this.full, this.sub, this.code);
	}
}

/**
 * Class representing a collection of algorithm states.
 */
class AlgorithmStateCollection {
	/**
	 * Array of all algorithm states.
	 */
	private steps = new Array<AlgorithmState>();

	/**
	 * Array of algorithm states, grouped by full steps.
	 */
	private fullSteps = new Array<Array<AlgorithmState>>();

	/**
	 * @param initialState - The initial state of the algorithm.
	 */
	public constructor(initialState: AlgorithmState) {
		this.insert(initialState);
	}

	/**
	 * Gets the last step known to the collection.
	 */
	public get lastStep(): AlgorithmState {
		return this.steps[this.steps.length - 1];
	}

	/**
	 * Adds a new state to the collection.
	 * @param state - The state to add.
	 */
	public insert(state: AlgorithmState): void {
		this.steps[state.stepsIndex.code] = state;

		if (state.stepKind != StepKind.Code) {
			const fullStepIndex = state.stepsIndex.full;

			if (this.fullSteps[fullStepIndex] == undefined)
				this.fullSteps[fullStepIndex] = [];

			this.fullSteps[fullStepIndex][state.stepsIndex.sub] = state;
		}
	}

	/**
	 * Gets an algorithm state by step kind and index.
	 * @param stepKind - The kind of step to get.
	 * @param step - The index of the step to get.
	 * @returns The algorithm state of the specified step kind at the specified index, or undefined if the requested step isn't known to the collection.
	 */
	public get(stepKind: StepKind.Code | StepKind.Full, step: number): AlgorithmState | undefined;
	/**
	 * Gets an algorithm state by step kind and index.
	 * @param stepKind - The kind of step to get.
	 * @param fullStep - The index of the full step whose sub-step to get.
	 * @param subStep - The index of the sub-step of the given full step to get.
	 * @returns The algorithm state of the specified step kind at the specified index, or undefined if the requested step isn't known to the collection.
	 */
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

	/**
	 * Gets all sub-steps for a given full step.
	 * @param fullStepIndex - The index of the full step whose sub-steps to get.
	 * @returns An array of sub-steps for the given full step index, or undefined if the requested full step isn't known to the collection.
	 */
	public getSubSteps(fullStepIndex: number): AlgorithmState[] | undefined {
		if (fullStepIndex >= 0 && fullStepIndex < this.fullSteps.length)
			return this.fullSteps[fullStepIndex];

		return undefined;
	}
}

/**
 * Represents a collection of steps of a sorting algorithm.
 */
export class StepResultCollection {
	private readonly stepCounter = new StepCounter(0, 0, 0, true);
	private currentStepIndexes: StepIndexes;
	private readonly states: AlgorithmStateCollection;

	private endStep: number | null = null;
	private endFullStep: number | null = null;

	/**
	 * @param initialStep The initial step result, representing the initial state of the algorithm.
	 */
	public constructor(initialStep: FullStepResult) {
		let codeStep = initialStep.codeStepResult;
		let stack = undefined;

		this.currentStepIndexes = this.stepCounter.freeze();

		this.states = new AlgorithmStateCollection(new AlgorithmState(codeStep, initialStep, StepKindHelper.getStepKind(initialStep), this.currentStepIndexes, stack));
	}

	/**
	 * Adds a step result to the collection.
	 * @param stepResult The step result to add.
	 */
	public add(stepResult: StepResult): void {
		const lastStep = this.states.lastStep;
		const stepKind = StepKindHelper.getStepKind(stepResult);
		this.stepCounter.add(stepKind);

		let fullStep: FullStepResult;
		let codeStep: CodeStepResult;
		let stack: CallStackFrozen | undefined;

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

		stack = codeStep.callStack;
		const lastStack = this.states.lastStep.callStack;

		if (lastStack != undefined && CallStackFrozen.equalSimple(this.states.lastStep.callStack, stack)) {
			codeStep.acceptEqualStack(lastStack);
		}

		this.states.insert(new AlgorithmState(codeStep, fullStep, stepKind, this.stepCounter.freeze(), stack));
	}

	/**
	 * Adds a step result to the collection and advances the current step forward to the last available step.
	 * @param stepResult The step result to add.
	 */
	public addAndAdvance(stepResult: StepResult): void {
		this.add(stepResult);
		this.currentStepIndexes = this.stepCounter.freeze();
	}

	/**
	 * Moves forward to the next step of the specified kind.
	 * If successful, the current step can be retrieved from the collection using the getCurrentStep method.
	 * @param kind The kind of step to move forward to.
	 * @returns True if the step operation was successful and the step was advanced. False if the requested step is not in the collection
	 * 				for example if the step is not known yet and has to be added first (user's responsibility) or if attempt to step past the final state was made.
	 */
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

	/**
	 * Moves backward to the previous step of the specified kind.
	 * If successful, the current step can be retrieved from the collection using the getCurrentStep method.
	 * @param kind The kind of step to move backward to.
	 * @returns True if the step operation was successful and the step was moved backward. False if attempt to step past the initial state was made.
	 */
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

	/**
	 * Gets indexes of the current step.
	 * @returns The current step indexes.
	 */
	public getCurrentStepNumbers(): StepIndexes {
		return this.currentStepIndexes;
	}

	/**
	 * Gets the current step.
	 * @returns The current algorithm state.
	 * @throws Error if the collection is in invalid state.
	 */
	public getCurrentStep(): AlgorithmState {
		const state = this.states.get(StepKind.Code, this.currentStepIndexes.code);

		if (state == undefined)
			throw new Error("Current step doesn't exist");

		return state;
	}

	/**
	 * Gets the final step number.
	 * @returns The final step number or null if the final step hasn't been added yet.
	 */
	public getEndStepNumber(): number | null;
	/**
	 * Gets the final step number of the specified kind.
	 * @param kind The kind of step whose final step number to return.
	 * @returns The end step number or null if the final step hasn't been added yet.
	 */
	public getEndStepNumber(kind: StepKind.Code | StepKind.Full): number | null;
	/**
	 * Gets the final step number for a sub-step of the specified full step.
	 * @param kind The kind of step whose final step number to return (StepKind.Sub).
	 * @param fullStepNumber The index of the full step whose final sub-step number to return.
	 * @returns The final sub-step number of the given full step or null if the final sub-step of the given full step hasn't been added yet.
	 * @throws Error if the requested full step is unknown yet.
	 */
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

	/**
	 * Moves to the specified step.
	 * @param step The number of the step to which to move to.
	 * @returns True if the operation was successful, otherwise false (i.e. if the requested step hasn't been added to this collection yet).
	 */
	public goToStep(step: number): boolean;
	/**
	 * Moves to the specified step of the specified kind.
	 * @param step The number of the step to which to move to.
	 * @param kind The kind of step to which to move to.
	 * @returns True if the operation was successful, otherwise false (i.e. if the requested step hasn't been added to this collection yet).
	 */
	public goToStep(step: number, kind: StepKind.Code | StepKind.Full): boolean;
	/**
	 * Moves to the specified sub-step of the specified full step.
	 * @param fullStep The number of the full step to whose sub-step to move to.
	 * @param kind The kind of step to which to move to.
	 * @param subStep The number of the sub-step inside the full step to which to move to.
	 * @returns True if the operation was successful, otherwise false (i.e. if the requested step hasn't been added to this collection yet).
	 * @throws Error if the sub-step index is not provided.
	 */
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

	/**
	 * Moves to the last known step.
	 */
	public goToLastKnownStep(): void {
		this.currentStepIndexes = this.states.lastStep.stepsIndex;
	}

	/**
	 * Gets the last known step number.
	 * @returns The last known step number.
	 */
	public getLastKnownStepNumber(): number;
	/**
	 * Gets the last known step number of the specified kind.
	 * @param kind The kind of step whose last known step number to query.
	 * @returns The last known step number of the specified kind.
	 */
	public getLastKnownStepNumber(kind: StepKind.Code | StepKind.Full): number;
	/**
	 * Gets the last known sub-step number of the specified full step.
	 * @param kind The kind of step whose last known sub-step number to query (StepKind.Sub).
	 * @param fullStep The full step whose last known sub-step number to query.
	 * @returns The last known sub-step number.
	 * @throws Error if the full step number is invalid (i.e. the full step hasn't been added to the collection yet).
	 */
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

	/**
	 * Gets the kind of the specified step.
	 * @param stepIndex The step index. Defaults to the current step index.
	 * @returns The kind of the given step.
	 * @throws Error if the requested step isn't present in the collection.
	 */
	public getStepKind(stepIndex: number = this.currentStepIndexes.code): StepKind {
		const currentStep = this.states.get(StepKind.Code, stepIndex);

		if (currentStep != undefined)
			return currentStep.stepKind;
		else
			throw new Error("Current step doesn't exist");
	}
}