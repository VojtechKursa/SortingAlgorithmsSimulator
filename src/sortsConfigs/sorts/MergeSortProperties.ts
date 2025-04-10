import { Complexity } from "../definitions/Complexity";
import { SortProperties } from "../definitions/SortProperties";

export const MergeSortProperties: SortProperties = {
	name: "Merge sort",
	nameMachine: "mergeSort",
	shortDescription: "Recursive algorithm which efficiently sorts linked lists.",
	longDescription: "Merge sort splits the input into 2 equally sized parts and recursively calls the merge sort algorithm on them, which sorts them independently. Afterwards those 2 sorted parts are merged together, creating a larger sorted part. The algorithm can be done efficiently on linked lists, because it accesses the elements in a linear manner, making it also an efficient sorting algorithm for sequential media like magnetic tapes. When sorting arrays, either the array has to be converted into a linked list or the merging phase needs to be done through 2 queues or a working copy of the array.",
	timeComplexity: {
		best: Complexity.Linearithmic,
		average: Complexity.Linearithmic,
		worst: Complexity.Linearithmic,
	},
	spaceComplexity: Complexity.Linear,
	stable: true,
	inPlace: true,
};