export class Variable {
	public constructor(
		public readonly name: string,
		public readonly value: any,
		public readonly draw: boolean = false
	) { }
};
