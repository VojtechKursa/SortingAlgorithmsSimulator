export class Point2D {
	public constructor(
		public readonly x: number,
		public readonly y: number
	) { }

	public toString(): string {
		return `${this.x},${this.y}`;
	}

	public static fromString(str: string): Point2D | null {
		const split = str.split(",");

		if (split.length != 2)
			return null;

		const x = Number.parseFloat(split[0]);
		if (x == null)
			return null;

		const y = Number.parseFloat(split[1]);
		if (y == null)
			return null;

		return new Point2D(x, y);
	}
}