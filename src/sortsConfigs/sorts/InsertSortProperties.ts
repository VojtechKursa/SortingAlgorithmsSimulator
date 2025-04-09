import { Complexity } from "../definitions/Complexity";

export const InsertSortProperties = {
	name: "Insertion sort",
	nameMachine: "insertionSort",
	shortDescription: "Algorithm, which inserts a value into it's correct position.",
	longDescription: "Insertion sort iterates through an array from the beginning and for each item, it iterates in a nested loop backwards, comparing the value at the outer loop with the values iterated over in the inner loop. Since the area iterated over the inner loop is already sorted, the target position in the sorted part of the array is the position after the first value that's lower than the current outer loop item. The main advantage of this algorithm is that it's adaptive, meaning it can detect and take advantage of already sorted chunks of data.",
	timeComplexity: {
		best: Complexity.Linear,
		average: Complexity.Quadratic,
		worst: Complexity.Quadratic
	},
	spaceComplexity: Complexity.Constant,
	stable: true,
	inPlace: true
};