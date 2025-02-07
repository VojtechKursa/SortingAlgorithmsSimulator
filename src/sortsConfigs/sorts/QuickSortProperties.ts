import { Complexity } from "../definitions/Complexity";

export const QuickSortProperties = {
	name: "Quick sort",
	nameMachine: "quickSort",
	shortDescription: "Description of Quick sort here.",
	longDescription: "Long description of Quick sort here.",
	timeComplexity: {
		best: Complexity.Linearithmic,
		average: Complexity.Linearithmic,
		worst: Complexity.Quadratic
	},
	spaceComplexity: Complexity.Logarithmic,
	stable: false,
	inPlace: true
};