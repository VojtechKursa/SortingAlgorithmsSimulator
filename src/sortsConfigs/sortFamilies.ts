import { Complexity } from "./definitions/Complexity";
import { SortFamilyProperties } from "./definitions/SortFamilyProperties";

import { BubbleSortProperties } from "./sorts/BubbleSortProperties";
import { BubbleSortWithLockProperties } from "./sorts/BubbleSortWithLockProperties";
import { SelectSortProperties } from "./sorts/SelectSortProperties";
import { InsertSortProperties } from "./sorts/InsertSortProperties";
import { QuickSortProperties } from "./sorts/QuickSortProperties";
import { HeapSortProperties } from "./sorts/HeapSortProperties";
import { MergeSortProperties } from "./sorts/MergeSortProperties";

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
			BubbleSortWithLockProperties,
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
		spaceComplexity: {
			min: Complexity.Constant,
			max: Complexity.Linear
		},
		stable: null,
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
			best: {
				min: Complexity.Linear,
				max: Complexity.Linearithmic
			},
			average: Complexity.Linearithmic,
			worst: Complexity.Quadratic
		},
		spaceComplexity: Complexity.Logarithmic,
		stable: false,
		inPlace: null,
		sorts: [
			QuickSortProperties
		]
	},
	{
		name: "Heap sort",
		nameMachine: "heapSort",
		shortDescription: HeapSortProperties.shortDescription,
		longDescription: HeapSortProperties.longDescription,
		timeComplexity: {
			best: Complexity.Linearithmic,
			average: Complexity.Linearithmic,
			worst: Complexity.Linearithmic
		},
		spaceComplexity: Complexity.Constant,
		stable: false,
		inPlace: true,
		sorts: [
			HeapSortProperties
		]
	},
	{
		name: "Merge sort",
		nameMachine: "mergeSort",
		shortDescription: MergeSortProperties.shortDescription,
		longDescription: MergeSortProperties.longDescription,
		timeComplexity: {
			worst: Complexity.Linearithmic,
			average: Complexity.Linearithmic,
			best: {
				min: Complexity.Linear,
				max: Complexity.Linearithmic
			}
		},
		spaceComplexity: {
			min: Complexity.Constant,
			max: Complexity.Linear
		},
		stable: true,
		inPlace: null,
		sorts: [
			MergeSortProperties
		]
	}
];

export default sortFamilies;
