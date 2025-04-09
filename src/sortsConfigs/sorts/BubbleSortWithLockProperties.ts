import { SortProperties } from "../definitions/SortProperties";
import { BubbleSortProperties } from "./BubbleSortProperties";

export const BubbleSortWithLockProperties: SortProperties = {
	...BubbleSortProperties,
	name: "Bubble sort with Lock",
	nameMachine: "bubbleSortWithLock",
	shortDescription: "Bubble Sort algorithm with iteration stopping at the point of last iteration's last swap.",
	longDescription: "This version of the Bubble Sort algorithm has an added \"lock\" variable, which marks the position where the last swap in the last iteration occurred. Since no items after the lock position were swapped, they must all be in the correct order already and therefore don't have to be processed. While this makes the algorithm slightly faster, it's asymptotic computational complexity stays the same.",
};
