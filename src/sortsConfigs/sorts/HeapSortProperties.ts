import { Complexity } from "../definitions/Complexity";

export const HeapSortProperties = {
	name: "Heap sort",
	nameMachine: "heapSort",
	shortDescription: "A sorting algorithm, which uses the Heap data structure for sorting.",
	longDescription: "This algorithm first constructs a max-heap from the input sequence and then repeats the process of pulling out the heap's root node (the largest item of the heap), putting it in the current position in the array (The array is traversed from the back) and renewing the heap property of the heap until the heap is empty.",
	timeComplexity: {
		best: Complexity.Linearithmic,
		average: Complexity.Linearithmic,
		worst: Complexity.Linearithmic
	},
	spaceComplexity: Complexity.Constant,
	stable: false,
	inPlace: true
};