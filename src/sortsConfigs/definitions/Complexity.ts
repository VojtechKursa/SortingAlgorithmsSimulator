export const enum Complexity {
	Constant,
	Logarithmic,
	Linear,
	Linearithmic,
	Quadratic,
};

export function getComplexityString(complexity: Complexity): string {
	switch (complexity) {
		case Complexity.Constant: return "O(1)";
		case Complexity.Logarithmic: return "O(log n)";
		case Complexity.Linear: return "O(n)";
		case Complexity.Linearithmic: return "O(n log n)";
		case Complexity.Quadratic: return "O(n^2)";
	}
}

export type ComplexityRange = {
	readonly min: Complexity;
	readonly max: Complexity;
}

export type TimeComplexity = {
	readonly best?: Complexity;
	readonly average?: Complexity;
	readonly worst: Complexity;
};

export type SpaceComplexity = Complexity;

export type FamilyTimeComplexity = {
	readonly best?: Complexity | ComplexityRange;
	readonly average?: Complexity | ComplexityRange;
	readonly worst: Complexity | ComplexityRange;
}

export type FamilySpaceComplexity = Complexity | ComplexityRange;
