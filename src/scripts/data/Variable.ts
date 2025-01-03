import { SymbolicColor } from "../visualization/colors/SymbolicColor";

export class Variable {
	public constructor(
		public readonly name: string,
		public readonly value: any,
		public readonly color: SymbolicColor | undefined = undefined
	) { }
};
