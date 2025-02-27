/**
 * Represents an indexed number in a sorting algorithm.
 */
export class IndexedNumber {
	/**
	 * @param id - The unique identifier of the number, usually it's index in the INPUT array.
	 * @param value - The value of the number.
	 * @param index - The order of the number among numbers of the same value in the INPUT array. Useful for showing algorithm's stability.
	 */
	public constructor(
		public readonly id: number,
		public readonly value: number,
		public readonly index: number | null
	) { }

	public static equals(number1: IndexedNumber, number2: IndexedNumber): boolean {
		return number1.id === number2.id && number1.value === number2.value && number1.index === number2.index;
	}

	// Simplifies comparisons ("IndexedNumber > IndexedNumber" instead of "IndexedNumber.value > IndexedNumber.value")
	public valueOf(): number {
		return this.value;
	}
}