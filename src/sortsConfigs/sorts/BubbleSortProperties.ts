import { Complexity } from "../definitions/Complexity";
import { SortProperties } from "../definitions/SortProperties";

export const BubbleSortProperties: SortProperties = {
	name: "Bubble sort",
	nameMachine: "bubbleSort",
	shortDescription: "A basic sorting algorithm that \"bubbles\" the largest values to the end of an array.",
	longDescription: "The algorithm iterates through an array and compares each value with it's following value. If the current value is bigger, it's swapped with the following value, effectively making it the next value, so it will be compared again in the next iteration. This causes the \"bubbling\" of the largest value to the end of the array. This is repeated until the array is sorted.",
	timeComplexity: {
		best: Complexity.Linear,
		average: Complexity.Quadratic,
		worst: Complexity.Quadratic,
	},
	spaceComplexity: Complexity.Constant,
	stable: true,
	inPlace: true,
};