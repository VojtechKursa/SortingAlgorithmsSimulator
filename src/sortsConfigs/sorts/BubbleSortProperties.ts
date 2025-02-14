import { Complexity } from "../definitions/Complexity";
import { SortProperties } from "../definitions/SortProperties";

export const BubbleSortProperties: SortProperties = {
	name: "Bubble sort",
	nameMachine: "bubbleSort",
	shortDescription: "Description of Bubble sort here.",
	longDescription: "Long description of Bubble sort here.",
	timeComplexity: {
		best: Complexity.Linear,
		average: Complexity.Quadratic,
		worst: Complexity.Quadratic,
	},
	spaceComplexity: Complexity.Constant,
	stable: true,
	inPlace: true,
};