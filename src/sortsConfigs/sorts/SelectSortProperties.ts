import { Complexity } from "../definitions/Complexity";

export const SelectSortProperties = {
	name: "Selection sort",
	nameMachine: "selectionSort",
	shortDescription: "A simple sorting algorithms, which searches for the smallest elements in the array.",
	longDescription: "Select sort comprises of an outer cycle, which marks the end of a sorted part of the array and an inner cycle, which iterates through the unsorted part of the array, searching for the smallest value. The smallest value is then swapped to the end of the sorted part. This sorts the value into it's correct place and expands the sorted area. While this algorithm is asymptotically more complex (therefore theoretically slower) than Bubble sort, it causes only n swaps, when compared to up to n^2 swaps that bubble sort can do, making it often slightly faster in practice.",
	timeComplexity: {
		best: Complexity.Quadratic,
		average: Complexity.Quadratic,
		worst: Complexity.Quadratic
	},
	spaceComplexity: Complexity.Constant,
	stable: false,
	inPlace: true
};