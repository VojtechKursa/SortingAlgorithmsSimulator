import { Complexity } from "../definitions/Complexity";

export const InsertSortProperties = {
	name: "Insertion sort",
	nameMachine: "insertionSort",
	shortDescription: "Description of Insertion sort here.",
	longDescription: "Long description of Insertion sort here.",
	timeComplexity: {
		best: Complexity.Linear,
		average: Complexity.Quadratic,
		worst: Complexity.Quadratic
	},
	spaceComplexity: Complexity.Constant,
	stable: true,
	inPlace: true
};