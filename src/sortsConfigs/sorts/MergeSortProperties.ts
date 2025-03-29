import { Complexity } from "../definitions/Complexity";
import { SortProperties } from "../definitions/SortProperties";

export const MergeSortProperties: SortProperties = {
	name: "Merge sort",
	nameMachine: "mergeSort",
	shortDescription: "Description of Merge sort here.",
	longDescription: "Long description of Merge sort here.",
	timeComplexity: {
		best: Complexity.Linearithmic,
		average: Complexity.Linearithmic,
		worst: Complexity.Linearithmic,
	},
	spaceComplexity: Complexity.Linear,
	stable: true,
	inPlace: true,
};