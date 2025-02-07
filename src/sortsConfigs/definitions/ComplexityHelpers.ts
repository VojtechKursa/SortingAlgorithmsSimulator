import { Complexity, ComplexityRange, getComplexityString } from "./Complexity";

export function getComplexityRangeString(complexityRange: ComplexityRange): string {
	return `O(${getComplexityString(complexityRange.min)}) - O(${getComplexityString(complexityRange.max)})`;
}

export function isComplexityRange(input: Complexity | ComplexityRange): input is ComplexityRange {
	return typeof input !== "number";
}

export function getComplexityOrComplexityRangeString(input: Complexity | ComplexityRange): string {
	return isComplexityRange(input) ? getComplexityRangeString(input) : getComplexityString(input);
}

export function getBooleanString(value: boolean | null | undefined): string {
	switch (value) {
		case true: return "Yes";
		case false: return "No";
		case null: return "Yes/No";
		case undefined: return "?";
	}
}