import { StepKind } from "../data/stepResults/StepKind";

export const enum InterfaceActionGroup {
	Backward,
	Forward,
	Select,
	PlayPause,
}

export const enum InterfaceAction {
	Backward_Full = "backward-full",
	Backward_Sub = "backward-sub",
	Backward_Code = "backward-code",
	Backward = "backward",
	Forward_Full = "forward-full",
	Forward_Sub = "forward-sub",
	Forward_Code = "forward-code",
	Forward = "forward",
	Select_Full = "select-full",
	Select_Sub = "select-sub",
	Select_Code = "select-code",
	Select_Next = "select-next",
	Select_Previous = "select-previous",
	PlayPause = "play-pause",
};

export class InterfaceActionData {
	private static readonly actionInfoMap = new Map<InterfaceAction, InterfaceActionData>(
		[
			[InterfaceAction.Backward_Full, new InterfaceActionData(InterfaceAction.Backward_Full, InterfaceActionGroup.Backward, "Backward full step", StepKind.Full)],
			[InterfaceAction.Backward_Sub, new InterfaceActionData(InterfaceAction.Backward_Sub, InterfaceActionGroup.Backward, "Backward sub-step", StepKind.Sub)],
			[InterfaceAction.Backward_Code, new InterfaceActionData(InterfaceAction.Backward_Code, InterfaceActionGroup.Backward, "Backward code step", StepKind.Code)],
			[InterfaceAction.Backward, new InterfaceActionData(InterfaceAction.Backward, InterfaceActionGroup.Backward, "Backward")],

			[InterfaceAction.Forward_Full, new InterfaceActionData(InterfaceAction.Forward_Full, InterfaceActionGroup.Forward, "Forward full step", StepKind.Full)],
			[InterfaceAction.Forward_Sub, new InterfaceActionData(InterfaceAction.Forward_Sub, InterfaceActionGroup.Forward, "Forward sub-step", StepKind.Sub)],
			[InterfaceAction.Forward_Code, new InterfaceActionData(InterfaceAction.Forward_Code, InterfaceActionGroup.Forward, "Forward code step", StepKind.Code)],
			[InterfaceAction.Forward, new InterfaceActionData(InterfaceAction.Forward, InterfaceActionGroup.Forward, "Forward")],

			[InterfaceAction.Select_Full, new InterfaceActionData(InterfaceAction.Select_Full, InterfaceActionGroup.Select, "Select full step", StepKind.Full)],
			[InterfaceAction.Select_Sub, new InterfaceActionData(InterfaceAction.Select_Sub, InterfaceActionGroup.Select, "Select sub-step", StepKind.Sub)],
			[InterfaceAction.Select_Code, new InterfaceActionData(InterfaceAction.Select_Code, InterfaceActionGroup.Select, "Select code step", StepKind.Code)],
			[InterfaceAction.Select_Next, new InterfaceActionData(InterfaceAction.Select_Next, InterfaceActionGroup.Select, "Select next")],
			[InterfaceAction.Select_Previous, new InterfaceActionData(InterfaceAction.Select_Previous, InterfaceActionGroup.Select, "Select previous")],

			[InterfaceAction.PlayPause, new InterfaceActionData(InterfaceAction.PlayPause, InterfaceActionGroup.PlayPause, "Play/Pause")],
		]
	);

	public readonly machineName: string;

	public constructor(
		public readonly action: InterfaceAction,
		public readonly group: InterfaceActionGroup,
		public readonly displayName: string,
		public readonly stepKind?: StepKind,
	) {
		this.machineName = action;
	}

	public static getActionInfo(action: InterfaceAction): InterfaceActionData {
		const actionInfo = InterfaceActionData.actionInfoMap.get(action);

		if (actionInfo == undefined) {
			throw new Error(`Unknown action: ${action}`);
		}

		return actionInfo;
	}

	public static getMap(): ReadonlyMap<InterfaceAction, InterfaceActionData> {
		return InterfaceActionData.actionInfoMap;
	}

	public static getAllActions(): Iterable<InterfaceActionData> {
		return InterfaceActionData.actionInfoMap.values();
	}

	public static fromString(actionString: string): InterfaceActionData | undefined {
		return this.actionInfoMap.get(actionString as InterfaceAction);
	}
}
