import { CommonSortProperties } from "./CommonSortProperties";
import { SpaceComplexity, TimeComplexity } from "./Complexity";

export interface SortProperties extends CommonSortProperties {
	readonly timeComplexity: TimeComplexity;
	readonly spaceComplexity: SpaceComplexity;
};
