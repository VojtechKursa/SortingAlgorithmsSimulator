import { FamilySpaceComplexity, FamilyTimeComplexity } from "./Complexity";
import { SortProperties } from "./SortProperties";

export interface SortFamilyProperties {
	readonly name: string;
	readonly nameMachine: string;
	readonly description: string;
	readonly timeComplexity: FamilyTimeComplexity;
	readonly spaceComplexity: FamilySpaceComplexity;
	readonly sorts: SortProperties[];
};