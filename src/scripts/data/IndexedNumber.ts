/**
 * Represents an indexed number in a sorting algorithm.
 */
export class IndexedNumber {
	/**
	 * The order of the number among numbers of the same value in the INPUT array. Useful for showing algorithm's stability.
	*/
	protected _index: number | null;
	/**
	 * The order of the number among numbers of the same value in the INPUT array. Useful for showing algorithm's stability.
	*/
	public get index(): number | null {
		return this._index;
	}

	/**
	 * Whether this number is duplicated.
	 */
	public get duplicated(): boolean {
		return this.original != null;
	}

	/**
	 * @param id - The unique identifier of the number, usually it's index in the INPUT array.
	 * @param value - The value of the number.
	 * @param index - The order of the number among numbers of the same value in the INPUT array. Useful for showing algorithm's stability.
	 * @param original - If this number is a duplicated number, the original number, otherwise null.
	 */
	public constructor(
		public readonly id: number,
		public readonly value: number,
		index: number | null,
		public readonly original: IndexedNumber | null = null,
		public readonly duplicateIdentifier: number | null = null,
	) {
		this._index = index;
	}

	/**
	 * Compares 2 indexed numbers for equality. Numbers are equal if their IDs, values and indexes are equal.
	 *
	 * @param number1 First number to compare
	 * @param number2 Seconds number to compare
	 * @returns Whether the 2 numbers are equal
	 */
	public static equals(number1: IndexedNumber, number2: IndexedNumber): boolean {
		return (
			number1.id === number2.id &&
			number1.value === number2.value &&
			number1.index === number2.index &&
			number1.duplicated == number2.duplicated &&
			number1.duplicateIdentifier == number2.duplicateIdentifier
		);
	}

	// Simplifies comparisons ("IndexedNumber > IndexedNumber" instead of "IndexedNumber.value > IndexedNumber.value")
	public valueOf(): number {
		return this.value;
	}

	/**
	 * Creates a duplicate of this {@link IndexedNumber}.
	 * For use in algorithms that duplicate values, to prevent weird animations.
	 *
	 * @param addDuplicateIdentifier - Whether to add the {@link duplicateIdentifier} property to the duplicated number. Defaults to false.
	 * @returns An {@link IndexedNumber} duplicated from this number.
	 */
	public duplicate(addDuplicateIdentifier?: boolean): IndexedNumber;
	/**
	 * Creates a duplicate of this {@link IndexedNumber}.
	 * For use in algorithms that duplicate values, to prevent weird animations.
	 *
	 * @param duplicateIdentifier - The value to use as the {@link duplicateIdentifier} property of the duplicated number.
	 * @returns An {@link IndexedNumber} duplicated from this number.
	 */
	public duplicate(duplicateIdentifier: number | null): IndexedNumber;
	public duplicate(duplicateIdentifier: number | null | boolean = false): IndexedNumber {
		let resultingDuplicateIdentifier: number | null;
		if (duplicateIdentifier == null) {
			resultingDuplicateIdentifier = null;
		}
		else if (typeof duplicateIdentifier === "number") {
			resultingDuplicateIdentifier = duplicateIdentifier;
		}
		else {
			resultingDuplicateIdentifier = duplicateIdentifier ? ((this.duplicateIdentifier ?? 0) + 1) : null;
		}

		return new IndexedNumber(this.id, this.value, this.index, this, resultingDuplicateIdentifier);
	}
}