import { AlgorithmState } from "../AlgorithmState";
import { StepIndexes } from "../StepIndexes";
import { StepKind, StepKindHelper } from "../stepResults/StepKind";
import { StepResult } from "../stepResults/StepResult";

/**
 * Class representing a counter for all types of steps in a sorting algorithm.
 */
class StepCounter {
	/**
	 * @param code - The initial count of code steps.
	 * @param significant - The initial count of significant steps.
	 * @param algorithmic - The initial count of algorithmic steps.
	 */
	public constructor(
		protected code: number = 0,
		protected significant: number = 0,
		protected algorithmic: number = 0,
	) { }

	/**
	 * Increments the counter by 1 of the specified kind.
	 * @param stepKind - The kind of step to increment the counter.
	 */
	public add(stepKind: StepKind) {
		switch (stepKind) {
			case StepKind.Algorithmic:
				this.algorithmic++;
			case StepKind.Significant:
				this.significant++;
			case StepKind.Code:
				this.code++;
				break;
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
			case StepKind.Significant: return this.significant;
			case StepKind.Algorithmic: return this.algorithmic;
		}
	}

	/**
	 * Freezes the current StepCounter object into a read-only StepIndexes object.
	 * @returns A StepIndexes object containing the the current step counts.
	 */
	public freeze(): StepIndexes {
		return new StepIndexes(this.algorithmic, this.significant, this.code);
	}
}

/**
 * Class representing a collection of algorithm states.
 */
class AlgorithmStateCollection {
	/**
	 * Array of all algorithm states.
	 */
	private states = new Array<AlgorithmState>();

	/**
	 * @param initialState - The initial state of the algorithm.
	 */
	public constructor(initialState: AlgorithmState) {
		this.insert(initialState);
	}

	/**
	 * Gets the last step known to the collection.
	 */
	public get lastState(): AlgorithmState {
		return this.states[this.states.length - 1];
	}

	/**
	 * Adds a new state to the collection at the index specified by the state's index.
	 * @param state - The state to add.
	 *
	 * @see {@link AlgorithmState.index}
	 */
	public insert(state: AlgorithmState): void {
		this.states[state.index.code] = state;
	}

	/**
	 * Gets an algorithm state by step kind and index.
	 * @param stepKind - The kind of step to get.
	 * @param stepIndex - The index of the step to get.
	 * @returns The algorithm state of the specified step kind at the specified index, or undefined if the requested step isn't known to the collection.
	 */
	public get(stepKind: StepKind, stepIndex: number): AlgorithmState | undefined {
		switch (stepKind) {
			case StepKind.Code:
				if (stepIndex >= 0 && stepIndex < this.states.length)
					return this.states[stepIndex];
				return undefined;
			case StepKind.Significant:
			case StepKind.Algorithmic:
				let l = 0;
				let r = this.states.length - 1;

				const desiredHierarchical = StepKindHelper.getHierarchicalIndex(stepKind);

				while (l <= r) {
					const index = Math.floor((l + r) / 2);
					const foundStep = this.states[index];

					const foundStepIndex = foundStep.index.getIndex(stepKind);

					if (foundStepIndex == stepIndex) {
						const foundHierarchical = StepKindHelper.getHierarchicalIndex(foundStep.step);

						if (foundHierarchical >= desiredHierarchical)
							return foundStep;
						else
							r = index - 1;
					}
					else if (stepIndex > foundStepIndex) {
						l = index + 1;
					}
					else {	// stepIndex < foundStepIndex
						r = index - 1;
					}
				}

				return undefined;
		}
	}
}

/**
 * Represents a collection of steps of a sorting algorithm.
 */
export class StepResultCollection {
	private readonly stepCounter = new StepCounter(0, 0, 0);
	private _currentStepIndexes: StepIndexes;
	private readonly states: AlgorithmStateCollection;

	private _finalStepIndexes: StepIndexes | null = null;



	/**
	 * @param initialStep The initial step result, representing the initial state of the algorithm.
	 */
	public constructor(initialStep: StepResult) {
		this._currentStepIndexes = this.stepCounter.freeze();

		this.states = new AlgorithmStateCollection(new AlgorithmState(initialStep, this.currentStepIndexes));
	}



	/**
	 * Gets indexes of the current step.
	 * @returns The current step indexes.
	 */
	public get currentStepIndexes(): StepIndexes {
		return this._currentStepIndexes;
	}
	private set currentStepIndexes(value: StepIndexes) {
		this._currentStepIndexes = value;
	}

	/**
	 * Gets the current state.
	 * @returns The current algorithm state.
	 * @throws Error if the collection is in invalid state.
	 */
	public get currentState(): AlgorithmState {
		const state = this.states.get(StepKind.Code, this.currentStepIndexes.code);

		if (state == undefined)
			throw new Error("Current step doesn't exist");

		return state;
	}

	/**
	 * Gets the current step.
	 * @returns The current algorithm state's associated step.
	 * @throws Error if the collection is in invalid state.
	 */
	public get currentStep(): StepResult {
		return this.currentState.step;
	}

	/**
	 * Gets the final step indexes.
	 * @returns The final step indexes or null if the final step hasn't been added yet.
	 */
	public get finalStepIndexes(): StepIndexes | null {
		return this._finalStepIndexes;
	}
	private set finalStepIndexes(value: StepIndexes) {
		this._finalStepIndexes = value;
	}



	/**
	 * Adds a step result to the collection.
	 * @param stepResult The step result to add.
	 */
	public add(stepResult: StepResult): void {
		this.stepCounter.add(stepResult.stepKind);

		if (stepResult.final) {
			this.finalStepIndexes = this.stepCounter.freeze();
		}

		stepResult.acceptEqualStepData(this.states.lastState.step);

		this.states.insert(new AlgorithmState(stepResult, this.stepCounter.freeze()));
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
	 * If successful, the current step can be retrieved from the collection using the currentState or currentStep properties.
	 *
	 * @param kind The kind of step to move forward to.
	 *
	 * @returns True if the step operation was successful and the step was advanced. False if the requested step is not in the collection
	 * 				for example if the step is not known yet and has to be added first (user's responsibility) or if attempt to step past the final state was made.
	 *
	 * @see {@link StepResultCollection.currentState}
	 */
	public forward(kind: StepKind): boolean {
		return this.goToStep(this.currentStepIndexes.getIndex(kind) + 1, kind);
	}

	/**
	 * Moves backward to the previous step of the specified kind.
	 * If successful, the current step can be retrieved from the collection using the currentState or currentState properties.
	 *
	 * @param kind The kind of step to move backward to.
	 *
	 * @returns True if the step operation was successful and the step was moved backward. False if attempt to step past the initial state was made.
	 */
	public backward(kind: StepKind): boolean {
		return this.goToStep(this.currentStepIndexes.getIndex(kind) - 1, kind);
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
	public goToStep(step: number, kind: StepKind): boolean;
	public goToStep(step: number, kind: StepKind = StepKind.Code): boolean {
		if (step < 0) {
			step = 0;
			kind = StepKind.Code;
		}

		let state = this.states.get(kind, step);

		if (state != undefined) {
			this.currentStepIndexes = state.index;
			return true;
		}
		else
			return false;
	}

	/**
	 * Moves to the last known step.
	 */
	public goToLastKnownStep(): void {
		this.currentStepIndexes = this.states.lastState.index;
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
	public getLastKnownStepNumber(kind: StepKind): number;
	public getLastKnownStepNumber(kind: StepKind = StepKind.Code): number {
		return this.states.lastState.index.getIndex(kind);
	}

	/**
	 * Gets the kind of the specified step.
	 * @param stepIndex The step index. Defaults to the current step index.
	 * @returns The kind of the given step.
	 * @throws Error if the requested step isn't present in the collection.
	 */
	public getStepKind(stepIndex: number = this.currentStepIndexes.code): StepKind {
		const selectedState = this.states.get(StepKind.Code, stepIndex);

		if (selectedState != undefined)
			return selectedState.step.stepKind;
		else
			throw new Error("Selected step doesn't exist");
	}
}