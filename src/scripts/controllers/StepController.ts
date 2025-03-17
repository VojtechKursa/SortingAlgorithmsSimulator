import { StepIndexes } from "../data/StepIndexes";
import { StepKind, StepKindHelper } from "../data/stepResults/StepKind";
import { StepControllerClasses } from "../visualization/css/StepControllerClasses";

export const enum StepAction {
	Forward,
	Backward,
	ToBeginning,
	ToEnd
}

export interface StepEventHandler { (stepKind: StepKind, stepAction: StepAction): void }
interface StepEventHandlerElementary { (stepKind: StepKind, stepAction: StepAction, controller: StepControllerElementary): void }

class StepControllerElementary {
	private readonly backButton: HTMLButtonElement;
	private readonly nextButton: HTMLButtonElement;
	private readonly stepDisplay: HTMLOutputElement;

	private _currentStep: number = 0;
	private _finalStep: number | undefined;
	private _unknownSymbol: string;

	private readonly eventHandlers: StepEventHandlerElementary[] = [];

	public constructor(
		public readonly wrapper: HTMLDivElement,
		public readonly stepKind: StepKind,
		unknownSymbol: string = "?"
	) {
		this._unknownSymbol = unknownSymbol;

		wrapper.classList.add(StepControllerClasses.wrapperClass);

		const buttonGroup = document.createElement("div");
		buttonGroup.classList.add("btn-group");
		buttonGroup.role = "group";

		this.backButton = document.createElement("button");
		const backIcon = document.createElement("i");
		backIcon.classList.add("bi", "bi-caret-left-fill");
		this.backButton.appendChild(backIcon);

		this.nextButton = document.createElement("button");
		const nextIcon = document.createElement("i");
		nextIcon.classList.add("bi", "bi-caret-right-fill");
		this.nextButton.appendChild(nextIcon);

		for (const button of [this.backButton, this.nextButton]) {
			button.classList.add("btn", "btn-primary");
			button.type = "button";
		}

		this.stepDisplay = document.createElement("output");
		this.stepDisplay.classList.add("disabled");

		const label = document.createElement("div");
		label.textContent = `${StepKindHelper.toString(stepKind).displayName.charAt(0)}:`;
		label.classList.add(StepControllerClasses.labelClass);

		buttonGroup.appendChild(this.backButton);
		buttonGroup.appendChild(this.stepDisplay);
		buttonGroup.appendChild(this.nextButton);

		wrapper.appendChild(label);
		wrapper.appendChild(buttonGroup);

		this.backButton.addEventListener("click", () => {
			for (const handler of this.eventHandlers) {
				handler(this.stepKind, StepAction.Backward, this);
			}
		});

		this.nextButton.addEventListener("click", () => {
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

	public getDisabled(stepAction?: StepAction): boolean {
		if (stepAction == undefined)
			return this.nextButton.disabled || this.backButton.disabled;

		switch (stepAction) {
			case StepAction.Backward:
			case StepAction.ToBeginning:
				return this.backButton.disabled;
			case StepAction.Forward:
			case StepAction.ToEnd:
				return this.nextButton.disabled;
		}
	}

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
	}

	public registerHandler(handler: StepEventHandlerElementary): void {
		this.eventHandlers.push(handler);
	}

	public unregisterHandler(handler: StepEventHandlerElementary): void {
		let index = this.eventHandlers.findIndex(val => val == handler);

		while (index != -1) {
			this.eventHandlers.splice(index, 1);

			index = this.eventHandlers.findIndex(val => val == handler);
		}
	}
}

export class StepController {
	private readonly stepControllers: readonly StepControllerElementary[];

	private readonly eventHandlers: StepEventHandler[] = [];

	private readonly beginningButton: HTMLButtonElement;
	private readonly endButton: HTMLButtonElement;

	private _currentStep: StepIndexes;
	public get currentStep(): StepIndexes {
		return this._currentStep;
	}
	public set currentStep(indexes: StepIndexes) {
		for (const controller of this.stepControllers.values()) {
			const stepCount = indexes.getIndex(controller.stepKind);
			controller.currentStep = stepCount;
		}

		this._currentStep = indexes;
	}

	private _finalStep: StepIndexes | undefined;
	public get finalStep(): StepIndexes | undefined {
		return this._finalStep;
	}
	public set finalStep(indexes: StepIndexes | undefined | null) {
		if (indexes == null)
			indexes = undefined;

		for (const controller of this.stepControllers.values()) {
			if (indexes != undefined) {
				const stepCount = indexes.getIndex(controller.stepKind);
				controller.finalStep = stepCount;
			}
			else {
				controller.finalStep = undefined;
			}
		}

		this._finalStep = indexes;
	}

	public constructor(
		rendererStepControllerWrapper: HTMLDivElement,
		debuggerStepControllerWrapper: HTMLDivElement
	) {
		this._currentStep = new StepIndexes(0, 0, 0);

		const rendererControllerWrapper = document.createElement("div");
		rendererControllerWrapper.classList.add(StepControllerClasses.verticalWrapperClass);

		const significantWrapper = document.createElement("div");
		const algorithmicWrapper = document.createElement("div");
		rendererControllerWrapper.appendChild(significantWrapper);
		rendererControllerWrapper.appendChild(algorithmicWrapper);

		const generationConfig: [StepKind, HTMLDivElement][] = [
			[StepKind.Code, debuggerStepControllerWrapper],
			[StepKind.Significant, significantWrapper],
			[StepKind.Algorithmic, algorithmicWrapper]
		];

		const controllers: StepControllerElementary[] = [];

		for (const config of generationConfig) {
			const controller = new StepControllerElementary(config[1], config[0]);
			controllers.push(controller);

			controller.registerHandler((stepKind, stepAction) => this.stepHandler(stepKind, stepAction));
		}

		this.stepControllers = controllers;

		this.beginningButton = document.createElement("button");
		this.beginningButton.id = "step-beginning";
		const beginningIcon = document.createElement("i");
		beginningIcon.classList.add("bi", "bi-skip-backward-fill");
		this.beginningButton.appendChild(beginningIcon);

		this.endButton = document.createElement("button");
		this.endButton.id = "step-end";
		const endIcon = document.createElement("i");
		endIcon.classList.add("bi", "bi-skip-forward-fill");
		this.endButton.appendChild(endIcon);

		for (const button of [this.beginningButton, this.endButton]) {
			button.classList.add("btn", "btn-primary");
			button.type = "button";
		}

		this.beginningButton.addEventListener("click", () => this.stepHandler(StepKind.Algorithmic, StepAction.ToBeginning));
		this.endButton.addEventListener("click", () => this.stepHandler(StepKind.Algorithmic, StepAction.ToEnd));

		rendererStepControllerWrapper.appendChild(this.beginningButton);
		rendererStepControllerWrapper.appendChild(rendererControllerWrapper);
		rendererStepControllerWrapper.appendChild(this.endButton);
	}

	private stepHandler(stepKind: StepKind, stepAction: StepAction) {
		for (const handler of this.eventHandlers) {
			handler(stepKind, stepAction);
		}
	}

	public getDisabled(stepAction?: StepAction, stepKind?: StepKind): boolean {
		const toScan = stepKind == undefined ? this.stepControllers : this.stepControllers.filter(controller => controller.stepKind == stepKind);

		for (const controller of toScan) {
			if (controller.getDisabled(stepAction))
				return true;
		}

		return false;
	}

	public setDisabled(disabled: boolean, stepAction?: StepAction, stepKind?: StepKind): void {
		if (stepAction == StepAction.ToBeginning || stepAction == undefined) {
			this.beginningButton.disabled = disabled;
			if (stepAction != undefined)
				return;
		}

		if (stepAction == StepAction.ToEnd || stepAction == undefined) {
			this.endButton.disabled = disabled;
			if (stepAction != undefined)
				return;
		}

		const toSet = stepKind == undefined ? this.stepControllers : this.stepControllers.filter(controller => controller.stepKind == stepKind);

		for (const controller of toSet) {
			controller.setDisabled(disabled, stepAction);
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