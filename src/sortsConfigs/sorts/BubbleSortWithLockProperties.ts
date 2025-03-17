import { SortProperties } from "../definitions/SortProperties";
import { BubbleSortProperties } from "./BubbleSortProperties";

export const BubbleSortWithLockProperties: SortProperties = {
	...BubbleSortProperties,
	name: "Bubble sort with Lock",
	nameMachine: "bubbleSortWithLock",
	shortDescription: "Description of Optimized Bubble sort here.",
	longDescription: "Long description of Optimized Bubble sort here.",
};
