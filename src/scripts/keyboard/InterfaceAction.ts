import { StepKind } from "../data/stepResults/StepKind";

/**
 * Enum representing all available groups of interface actions.
 *
 * @see {@link InterfaceAction}
 */
export const enum InterfaceActionGroup {
	Backward,
	Forward,
	Select,
	PlayPause,
}

/**
 * Enum representing all available interface actions.
 */
export const enum InterfaceAction {
	Backward_Algorithmic = "backward-algorithmic",
	Backward_Significant = "backward-significant",
	Backward_Code = "backward-code",
	Backward = "backward",
	Forward_Algorithmic = "forward-algorithmic",
	Forward_Significant = "forward-significant",
	Forward_Code = "forward-code",
	Forward = "forward",
	Select_Algorithmic = "select-algorithmic",
	Select_Significant = "select-significant",
	Select_Code = "select-code",
	Select_Next = "select-next",
	Select_Previous = "select-previous",
	PlayPause = "play-pause",
};

/**
 * A class containing information about interface actions.
 */
export class InterfaceActionData {
	/**
	 * A map containing information about all available interface actions.
	 */
	private static readonly actionInfoMap = new Map<InterfaceAction, InterfaceActionData>(
		[
			[InterfaceAction.Backward_Algorithmic, new InterfaceActionData(InterfaceAction.Backward_Algorithmic, InterfaceActionGroup.Backward, "Backward algorithmic step", StepKind.Algorithmic)],
			[InterfaceAction.Backward_Significant, new InterfaceActionData(InterfaceAction.Backward_Significant, InterfaceActionGroup.Backward, "Backward significant step", StepKind.Significant)],
			[InterfaceAction.Backward_Code, new InterfaceActionData(InterfaceAction.Backward_Code, InterfaceActionGroup.Backward, "Backward code step", StepKind.Code)],
			[InterfaceAction.Backward, new InterfaceActionData(InterfaceAction.Backward, InterfaceActionGroup.Backward, "Backward")],

			[InterfaceAction.Forward_Algorithmic, new InterfaceActionData(InterfaceAction.Forward_Algorithmic, InterfaceActionGroup.Forward, "Forward algorithmic step", StepKind.Algorithmic)],
			[InterfaceAction.Forward_Significant, new InterfaceActionData(InterfaceAction.Forward_Significant, InterfaceActionGroup.Forward, "Forward significant step", StepKind.Significant)],
			[InterfaceAction.Forward_Code, new InterfaceActionData(InterfaceAction.Forward_Code, InterfaceActionGroup.Forward, "Forward code step", StepKind.Code)],
			[InterfaceAction.Forward, new InterfaceActionData(InterfaceAction.Forward, InterfaceActionGroup.Forward, "Forward")],

			[InterfaceAction.Select_Algorithmic, new InterfaceActionData(InterfaceAction.Select_Algorithmic, InterfaceActionGroup.Select, "Select algorithmic step", StepKind.Algorithmic)],
			[InterfaceAction.Select_Significant, new InterfaceActionData(InterfaceAction.Select_Significant, InterfaceActionGroup.Select, "Select significant step", StepKind.Significant)],
			[InterfaceAction.Select_Code, new InterfaceActionData(InterfaceAction.Select_Code, InterfaceActionGroup.Select, "Select code step", StepKind.Code)],
			[InterfaceAction.Select_Next, new InterfaceActionData(InterfaceAction.Select_Next, InterfaceActionGroup.Select, "Select next")],
			[InterfaceAction.Select_Previous, new InterfaceActionData(InterfaceAction.Select_Previous, InterfaceActionGroup.Select, "Select previous")],

			[InterfaceAction.PlayPause, new InterfaceActionData(InterfaceAction.PlayPause, InterfaceActionGroup.PlayPause, "Play/Pause")],
		]
	);

	/**
	 * The machine name of the action.
	 */
	public readonly machineName: string;

	/**
	 * @param action - The interface action that is described by this object.
	 * @param group - The group into which the action belongs.
	 * @param displayName - The human-readable name of the interface action.
	 * @param stepKind - The kind of step associated with the action, if any.
	 *
	 * @see {@link InterfaceAction}
	 * @see {@link InterfaceActionGroup}
	 * @see {@link StepKind}
	 */
	public constructor(
		public readonly action: InterfaceAction,
		public readonly group: InterfaceActionGroup,
		public readonly displayName: string,
		public readonly stepKind?: StepKind,
	) {
		this.machineName = action;
	}

	/**
	 * Returns the information about the given action.
	 *
	 * @param action - The action to get information about.
	 * @returns The information about the given action.
	 * @throws An error if information about the given action is not defined.
	 *
	 * @see {@link InterfaceAction}
	 * @see {@link InterfaceActionData}
	 */
	public static getActionInfo(action: InterfaceAction): InterfaceActionData {
		const actionInfo = InterfaceActionData.actionInfoMap.get(action);

		if (actionInfo == undefined) {
			throw new Error(`Unknown action: ${action}`);
		}

		return actionInfo;
	}

	/**
	 * Returns a map containing all available interface actions and the InterfaceActionData associated with them.
	 *
	 * @returns A read-only map, mapping all available interface actions to their InterfaceActionData.
	 *
	 * @see {@link InterfaceAction}
	 * @see {@link InterfaceActionData}
	 */
	public static getMap(): ReadonlyMap<InterfaceAction, InterfaceActionData> {
		return InterfaceActionData.actionInfoMap;
	}

	/**
	 * Returns an iterable containing information about all available interface actions.
	 *
	 * @returns An iterable containing information about all available interface actions.
	 *
	 * @see {@link InterfaceActionData}
	 */
	public static getAllActions(): Iterable<InterfaceActionData> {
		return InterfaceActionData.actionInfoMap.values();
	}

	/**
	 * Returns information about the given action.
	 *
	 * @param actionString - The machine name of the action to get information about.
	 * @returns The information about the action identified by the actionString parameter,
	 * 			or undefined if the action is not recognized based on the actions string.
	 *
	 * @see {@link InterfaceAction}
	 */
	public static fromString(actionString: string): InterfaceActionData | undefined {
		return this.actionInfoMap.get(actionString as InterfaceAction);
	}
}
