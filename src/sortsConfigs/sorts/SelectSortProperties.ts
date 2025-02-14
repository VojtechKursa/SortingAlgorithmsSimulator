import { Complexity } from "../definitions/Complexity";

export const SelectSortProperties = {
	name: "Selection sort",
	nameMachine: "selectionSort",
	shortDescription: "Description of Selection sort here.",
	longDescription: "Long description of Selection sort here.",
	timeComplexity: {
		best: Complexity.Quadratic,
		average: Complexity.Quadratic,
		worst: Complexity.Quadratic
	},
	spaceComplexity: Complexity.Constant,
	stable: false,
	inPlace: true
};