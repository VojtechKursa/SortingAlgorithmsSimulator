import { SymbolicColor } from "./SymbolicColor";

export class SymbolicColorHelper {
	public static getCssClass(color: SymbolicColor): string {
		return color;
	}

	public static getCssColorVar(color: SymbolicColor): string {
		return `--color-${color}`;
	}

	public static getReadableName(color: SymbolicColor): string {
		let resultBuilder = new Array<string>();

		const colorParts = color.split("-");

		for(const part of colorParts) {
			if (part.length > 0) {
				let newPart = part.charAt(0).toUpperCase() + (part.substring(1, part.length).replace("_", " "));
				resultBuilder.push(newPart);
			}
		}

		return resultBuilder.join(" - ");
	}
}
