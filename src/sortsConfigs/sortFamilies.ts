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
		shortDescription: BubbleSortProperties.shortDescription,
		longDescription: BubbleSortProperties.longDescription,
		timeComplexity: {
			best: Complexity.Linear,
			average: Complexity.Quadratic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Constant,
		stable: true,
		inPlace: true,
		sorts: [
			BubbleSortProperties,
			BubbleSortOptimizedProperties,
		]
	},
	{
		name: "Selection sort",
		nameMachine: "selectionSort",
		shortDescription: SelectSortProperties.shortDescription,
		longDescription: SelectSortProperties.longDescription,
		timeComplexity: {
			best: Complexity.Quadratic,
			average: Complexity.Quadratic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Constant,
		stable: false,
		inPlace: true,
		sorts: [
			SelectSortProperties
		],
	},
	{
		name: "Insertion sort",
		nameMachine: "insertionSort",
		shortDescription: InsertSortProperties.shortDescription,
		longDescription: InsertSortProperties.longDescription,
		timeComplexity: {
			best: Complexity.Linear,
			average: Complexity.Quadratic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Constant,
		stable: true,
		inPlace: true,
		sorts: [
			InsertSortProperties
		]
	},
	{
		name: "Quick sort",
		nameMachine: "quickSort",
		shortDescription: QuickSortProperties.shortDescription,
		longDescription: QuickSortProperties.longDescription,
		timeComplexity: {
			best: Complexity.Linearithmic,
			average: Complexity.Linearithmic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Logarithmic,
		stable: false,
		inPlace: null,
		sorts: [
			QuickSortProperties
		]
	}
];

export default sortFamilies;
