export class IndexedNumber {
	public constructor(
		public readonly value: number,
		public readonly index: number | null
	) { }

	public valueOf(): number {
		return this.value;
	}
}