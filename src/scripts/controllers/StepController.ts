import { StepKind } from "../data/stepResults/StepKind";

export const enum StepAction {
	Forward,
	Backward
}

export interface StepEventHandler { (stepKind: StepKind, stepAction: StepAction, controller: StepController): void }

export class StepController {
	private readonly backButton: HTMLButtonElement;
	private readonly nextButton: HTMLButtonElement;
	private readonly stepDisplay: HTMLOutputElement;

	private _currentStep: number = 0;
	private _finalStep: number | undefined;
	private _unknownSymbol: string;

	private readonly eventHandlers: StepEventHandler[] = [];

	public constructor(
		public readonly wrapper: HTMLDivElement,
		public readonly stepKind: StepKind,
		unknownSymbol: string = "?"
	) {
		this._unknownSymbol = unknownSymbol;

		this.backButton = document.createElement("button");

		this.nextButton = document.createElement("button");

		this.stepDisplay = document.createElement("output");

		wrapper.appendChild(this.backButton);
		wrapper.appendChild(this.stepDisplay);
		wrapper.appendChild(this.nextButton);

		this.backButton.addEventListener("click", _ => {
			for (const handler of this.eventHandlers) {
				handler(this.stepKind, StepAction.Backward, this);
			}
		});

		this.nextButton.addEventListener("click", _ => {
			for (const handler of this.eventHandlers) {
				handler(this.stepKind, StepAction.Forward, this);
			}
		});
	}

	public get currentStep(): number {
		return this._currentStep;
	}
	public set currentStep(value: number) {
		this._currentStep = value;
		this.update();
	}

	public get finalStep(): number | undefined {
		return this._finalStep;
	}
	public set finalStep(value: number | undefined | null) {
		if (value == null)
			value = undefined;

		this._finalStep = value;
		this.update();
	}

	public get unknownSymbol(): string {
		return this._unknownSymbol;
	}
	public set unknownSymbol(value: string) {
		this._unknownSymbol = value;
		this.update();
	}

	public updateSteps(currentStep: number, finalStep: number | undefined | null): void {
		if (finalStep == null)
			finalStep = undefined;

		this._currentStep = currentStep;
		this._finalStep = finalStep;

		this.update();
	}

	public setDisabled(disabled: boolean): void;
	public setDisabled(disabled: boolean, stepAction: StepAction): void;
	public setDisabled(disabled: boolean, stepAction?: StepAction): void {
		if (stepAction == undefined) {
			this.nextButton.disabled = disabled;
			this.backButton.disabled = disabled;
		}
		else if (stepAction == StepAction.Forward) {
			this.nextButton.disabled = disabled;
		}
		else if (stepAction == StepAction.Backward) {
			this.backButton.disabled = disabled;
		}
	}

	private update(): void {
		this.stepDisplay.textContent = `${this.currentStep} / ${this.finalStep ?? this.unknownSymbol}`;

		if (this.currentStep <= 0) {
			this.setDisabled(true, StepAction.Backward);
		}
		else {
			this.setDisabled(false, StepAction.Backward);
		}

		if (this.finalStep != undefined && this.currentStep >= this.finalStep) {
			this.setDisabled(true, StepAction.Forward);
		}
		else {
			this.setDisabled(false, StepAction.Backward);
		}
	}

	public registerHandler(handler: StepEventHandler): void {
		this.eventHandlers.push(handler);
	}

	public unregisterHandler(handler: StepEventHandler): void {
		let index = this.eventHandlers.findIndex(val => val == handler);

		while (index != -1) {
			this.eventHandlers.splice(index, 1);

			index = this.eventHandlers.findIndex(val => val == handler);
		}
	}
}