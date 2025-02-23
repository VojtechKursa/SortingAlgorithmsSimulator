/**
 * A collection containing all the wrappers of collapsible elements on the simulator page.
 */
export class CollapseWrappers {
	public constructor(
		public readonly debuggerWrapper: HTMLDivElement,
		public readonly variableWatchWrapper: HTMLDivElement,
		public readonly callStackWrapper: HTMLDivElement
	) { }
}