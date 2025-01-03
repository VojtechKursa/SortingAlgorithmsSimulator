import { SymbolicColor } from "./SymbolicColor";

export class SymbolicColorHelper {
	public static getCssClass(color: SymbolicColor): string {
		return color;
	}

	public static getCssColorVar(color: SymbolicColor): string {
		return `--color-${color}`;
	}
}
