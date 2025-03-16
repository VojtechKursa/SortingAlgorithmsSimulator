import { CommonSortProperties } from "./CommonSortProperties";
import { FamilySpaceComplexity, FamilyTimeComplexity } from "./Complexity";
import { SortProperties } from "./SortProperties";

export interface SortFamilyProperties extends CommonSortProperties {
	readonly timeComplexity: FamilyTimeComplexity;
	readonly spaceComplexity: FamilySpaceComplexity;
	readonly sorts: readonly SortProperties[];
};