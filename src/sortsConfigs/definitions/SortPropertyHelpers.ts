import { Complexity, ComplexityRange, getComplexityHTML, getComplexityString } from "./Complexity";

export function getComplexityRangeString(complexityRange: ComplexityRange): string {
	return `${getComplexityString(complexityRange.min)} - ${getComplexityString(complexityRange.max)}`;
}

export function getComplexityRangeHTML(complexityRange: ComplexityRange): string {
	return `${getComplexityHTML(complexityRange.min)} - ${getComplexityHTML(complexityRange.max)}`;
}

export function isComplexityRange(input: Complexity | ComplexityRange): input is ComplexityRange {
	return typeof input !== "number";
}

export function getComplexityOrComplexityRangeString(input: Complexity | ComplexityRange): string {
	return isComplexityRange(input) ? getComplexityRangeString(input) : getComplexityString(input);
}

export function getComplexityOrComplexityRangeHTML(input: Complexity | ComplexityRange): string {
	return isComplexityRange(input) ? getComplexityRangeHTML(input) : getComplexityHTML(input);
}

export function getBooleanString(value: boolean | null | undefined): string {
	switch (value) {
		case true: return "Yes";
		case false: return "No";
		case null: return "Y/N";
		case undefined: return "?";
	}
}