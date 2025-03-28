export class FontProperties {
	public static readonly fontSizeCorrectionMultiplier: number = 0.75;

	public constructor(
		public readonly fontSize: number,
		public readonly strokeWidth: number
	) { }
}