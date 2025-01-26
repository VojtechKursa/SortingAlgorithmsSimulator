export class CollapseWrappers {
	public constructor(
		public readonly debuggerWrapper: HTMLDivElement,
		public readonly variableWatchWrapper: HTMLDivElement,
		public readonly callStackWrapper: HTMLDivElement
	) { }
}