export class IndexedNumber {
	public constructor(
		public readonly id: number,
		public readonly value: number,
		public readonly index: number | null
	) { }
}