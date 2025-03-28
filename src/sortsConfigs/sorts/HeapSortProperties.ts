import { Complexity } from "../definitions/Complexity";

export const HeapSortProperties = {
	name: "Heap sort",
	nameMachine: "heapSort",
	shortDescription: "Description of Heap sort here.",
	longDescription: "Long description of Heap sort here.",
	timeComplexity: {
		best: Complexity.Linearithmic,
		average: Complexity.Linearithmic,
		worst: Complexity.Linearithmic
	},
	spaceComplexity: Complexity.Constant,
	stable: false,
	inPlace: true
};