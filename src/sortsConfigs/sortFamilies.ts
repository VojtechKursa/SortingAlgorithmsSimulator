import { Complexity } from "./definitions/Complexity";
import { SortFamilyProperties } from "./definitions/SortFamilyProperties";

import { BubbleSortProperties } from "./sorts/BubbleSortProperties";
import { BubbleSortOptimizedProperties } from "./sorts/BubbleSortOptimizedProperties";
import { SelectSortProperties } from "./sorts/SelectSortProperties";
import { InsertSortProperties } from "./sorts/InsertSortProperties";
import { QuickSortProperties } from "./sorts/QuickSortProperties";

const sortFamilies: SortFamilyProperties[] = [
	{
		name: "Bubble sort",
		nameMachine: "bubbleSort",
		description: "Description of Bubble sort here.",
		timeComplexity: {
			best: Complexity.Linear,
			average: Complexity.Quadratic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Constant,
		sorts: [
			BubbleSortProperties,
			BubbleSortOptimizedProperties,
		]
	},
	{
		name: "Selection sort",
		nameMachine: "selectionSort",
		description: "Description of Selection sort here.",
		timeComplexity: {
			best: Complexity.Quadratic,
			average: Complexity.Quadratic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Constant,
		sorts: [
			SelectSortProperties
		]
	},
	{
		name: "Insertion sort",
		nameMachine: "insertionSort",
		description: "Description of Insertion sort here.",
		timeComplexity: {
			best: Complexity.Linear,
			average: Complexity.Quadratic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Constant,
		sorts: [
			InsertSortProperties
		]
	},
	{
		name: "Quick sort",
		nameMachine: "quickSort",
		description: "Description of Quick sort here.",
		timeComplexity: {
			best: Complexity.Linearithmic,
			average: Complexity.Linearithmic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Logarithmic,
		sorts: [
			QuickSortProperties
		]
	}
];

export default sortFamilies;
