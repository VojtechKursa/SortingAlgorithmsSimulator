import { Complexity } from "../definitions/Complexity";

export const QuickSortProperties = {
	name: "Quick sort",
	nameMachine: "quickSort",
	shortDescription: "The most commonly used generic sorting algorithm.",
	longDescription: "Quick sort uses a divide and conquer approach. It picks a pivot value and splits the array into 2 sections: a section containing values smaller or equal to pivot and a section containing values bigger than the pivot. Placing the pivot between the 2 sections sorts it to it's final, sorted position, since all the values on the left of it will be smaller (or equal) and all the values on the right will be bigger. The algorithm is then executed recursively on the 2 sections of the array. The sections can be sorted independently, because all values in them are going to stay on their respective side of the pivot.",
	timeComplexity: {
		best: Complexity.Linearithmic,
		average: Complexity.Linearithmic,
		worst: Complexity.Quadratic
	},
	spaceComplexity: Complexity.Logarithmic,
	stable: false,
	inPlace: true
};